const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

io.on('connection', (socket) => {
  console.log('User connected to chat:', socket.id);

  socket.on('sendMessage', (message) => {
    // Mock Concierge Response
    setTimeout(() => {
      socket.emit('receiveMessage', { 
        sender: 'concierge', 
        text: 'Thank you for reaching out. A professional event architect is reviewing your vision and will respond shortly.',
        timestamp: new Date().toISOString()
      });
    }, 1500);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/vendors', require('./routes/vendors'));

app.get('/', (req, res) => {
    res.send('LuxeGather API is running...');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
