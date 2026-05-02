const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/luxegather')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Failed to connect to MongoDB', err));

// REST endpoint: fetch message history for a room
app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const roomId = decodeURIComponent(req.params.roomId);
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

io.on('connection', (socket) => {
  console.log('User connected to chat:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('sendMessage', async (data) => {
    if (data.roomId) {
      try {
        const saved = await Message.create({
          roomId: data.roomId,
          sender: data.sender,
          senderName: data.senderName,
          text: data.text,
        });

        const outgoing = {
          _id: saved._id,
          roomId: data.roomId,
          sender: data.sender,
          senderName: data.senderName,
          text: data.text,
          timestamp: saved.createdAt.toISOString(),
        };

        // Emit to ENTIRE room including sender so all sides receive it
        io.to(data.roomId).emit('receiveMessage', outgoing);
      } catch (err) {
        console.error('Failed to save message:', err);
      }
    } else {
      // Mock Concierge Response for global chat widget
      setTimeout(() => {
        socket.emit('receiveMessage', {
          sender: 'concierge',
          text: 'Thank you for reaching out. A professional event architect is reviewing your vision and will respond shortly.',
          timestamp: new Date().toISOString()
        });
      }, 1500);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendor', require('./routes/vendorAuth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/events', require('./routes/events'));

app.get('/api', (req, res) => {
  res.json({ message: 'LuxeGather API is running...', status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('LuxeGather API is running...');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
