import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, UserCircle } from 'lucide-react';
import axios from 'axios';
import './ChatWidget.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_URL = `${SOCKET_URL}/api`;

// Singleton socket - stable, never recreated on re-render
let socket = null;
function getSocket() {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, { transports: ['websocket'] });
  }
  return socket;
}

export default function InlineChat({ roomId, vendorName, clientName, currentUserRole, onUnread }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const roomIdRef = useRef(roomId);

  // Load message history from DB when chat opens
  useEffect(() => {
    roomIdRef.current = roomId;
    
    const loadHistory = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/messages/${encodeURIComponent(roomId)}`);
        setMessages(data.map(m => ({
          ...m,
          timestamp: m.createdAt || m.timestamp,
        })));
      } catch (err) {
        console.error('Failed to load message history', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

    const sock = getSocket();
    sock.emit('joinRoom', roomId);

    const handleReceive = (msg) => {
      // Only handle messages for this specific room
      if (msg.roomId !== roomIdRef.current) return;
      setMessages(prev => {
        // Deduplicate by _id if server echoes back
        if (msg._id && prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    sock.on('receiveMessage', handleReceive);

    return () => {
      sock.off('receiveMessage', handleReceive);
    };
  }, [roomId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const sock = getSocket();
    const msg = {
      roomId,
      sender: currentUserRole,
      senderName: currentUserRole === 'vendor' ? vendorName : clientName,
      text: input,
      timestamp: new Date().toISOString(),
    };

    // Don't optimistically add — wait for server echo (io.to().emit hits sender too)
    sock.emit('sendMessage', msg);
    setInput('');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const otherName = currentUserRole === 'vendor' ? clientName : vendorName;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '380px',
      background: '#FAFAFA', borderRadius: '14px',
      border: '1px solid #EAEAEA', overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', background: '#FFF',
        borderBottom: '1px solid #EAEAEA',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <UserCircle size={22} color="#999" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#111' }}>
            {otherName}
          </h4>
          <span style={{ fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.5px' }}>
            Secure channel · {roomId.substring(0, 10).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
        {loading && (
          <p className="chat-muted" style={{ textAlign: 'center' }}>Loading history...</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="chat-muted">
            Start of your secure conversation with {otherName}.
          </p>
        )}
        {messages.map((m, i) => {
          const isMe = m.sender === currentUserRole;
          return (
            <div key={m._id || i} className={`chat-bubble ${isMe ? 'user' : 'concierge'}`}
              style={{ marginBottom: '12px', maxWidth: '82%' }}>
              <span style={{ display: 'block', fontSize: '0.68rem', opacity: 0.55, marginBottom: '3px', fontWeight: 700 }}>
                {isMe ? 'You' : m.senderName}
              </span>
              {m.text}
              <span className="chat-timestamp" style={{ fontSize: '0.62rem', display: 'block', marginTop: '4px' }}>
                {formatTime(m.timestamp || m.createdAt)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{
        display: 'flex', padding: '12px 16px',
        background: '#FFF', borderTop: '1px solid #EAEAEA', gap: '10px',
      }}>
        <input
          type="text"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '100px',
            border: '1px solid #EAEAEA', outline: 'none',
            fontSize: '0.9rem', background: '#FAFAFA', fontFamily: 'inherit',
          }}
        />
        <button type="submit" style={{
          background: 'var(--primary-color)', color: '#FFF',
          border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'opacity 0.2s',
        }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
