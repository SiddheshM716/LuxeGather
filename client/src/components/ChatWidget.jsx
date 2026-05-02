import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageSquare, X, Send, Headphones } from 'lucide-react';
import './ChatWidget.css'; // Premium styles

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off('receiveMessage');
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const msg = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, msg]);
    socket.emit('sendMessage', msg);
    setInput('');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-widget">
      {!isOpen ? (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open Concierge Chat">
          <MessageSquare />
        </button>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <Headphones size={20} />
              </div>
              <div>
                <h4>LuxeGather Concierge</h4>
                <span className="status">Online</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={24} />
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.length === 0 && (
              <p className="chat-muted">A professional event architect is available to assist you.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.sender}`}>
                {m.text}
                {m.timestamp && (
                  <span className="chat-timestamp">{formatTime(m.timestamp)}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input" onSubmit={sendMessage}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
            />
            <button type="submit" aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
