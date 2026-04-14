import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import InlineChat from './InlineChat';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Stable singleton socket for background notifications
let bgSocket = null;
function getBgSocket() {
  if (!bgSocket || bgSocket.disconnected) {
    bgSocket = io(SOCKET_URL, { transports: ['websocket'] });
  }
  return bgSocket;
}

const Dashboard = ({ user, setStep }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const activeChatIdRef = useRef(null);

  // Keep ref in sync so the socket listener can check current value without re-subscribing
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // Fetch events once on mount
  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/events/user/${user._id}`);
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  // Setup background socket ONCE on mount
  useEffect(() => {
    const sock = getBgSocket();

    const handleReceive = (msg) => {
      if (!msg.roomId) return;
      // If the chat for that room isn't currently open, flag as unread
      if (activeChatIdRef.current !== msg.roomId) {
        setUnreadMessages(prev => ({ ...prev, [msg.roomId]: true }));
      }
    };

    sock.on('receiveMessage', handleReceive);
    return () => sock.off('receiveMessage', handleReceive);
  }, []); // ← empty array: only runs once, socket never torn down

  // When events load, silently join all relevant rooms
  useEffect(() => {
    if (!events.length) return;
    const sock = getBgSocket();
    events.forEach(event => {
      ['venue', 'catering', 'decorations', 'entertainment', 'photography'].forEach(category => {
        if (event.eventParams?.[category]) {
          sock.emit('joinRoom', `${event._id}_${category}`);
        }
      });
    });
  }, [events]);


  const toggleExpand = (id) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  };

  const calculateProgress = (event) => {
    let score = 0;
    
    // Status contribution
    if (event.eventStatus === 'Planning') score += 10;
    else if (event.eventStatus === 'Confirmed') score += 30;
    else if (event.eventStatus === 'In Progress') score += 60;
    else if (event.eventStatus === 'Completed') score += 100;

    // Additional progression based on tasks
    const tasks = event.taskChecklist || [];
    if (tasks.length > 0 && event.eventStatus !== 'Completed') {
      const completedTasks = tasks.filter(t => t.isCompleted).length;
      const taskContribution = (completedTasks / tasks.length) * 40; // Max 40% from tasks if not completed
      score = Math.min(score + taskContribution, 95); // cap at 95 unless status is Completed
    }

    return Math.min(Math.round(score), 100);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loader">Loading your legacy...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="dashboard-container empty-state">
        <h2>No Events Tracked Yet</h2>
        <p>Your journey to a legendary gathering begins here.</p>
        <button className="btn-primary" onClick={() => setStep('landing')}>
          Explore Services
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <span className="eyebrow">My Portfolio</span>
        <h1>My Bookings</h1>
        <p>Monitor the real-time progress of your bespoke gatherings.</p>
      </div>

      <div className="events-grid">
        {events.map((event) => {
          const progress = calculateProgress(event);
          const isExpanded = expandedEventId === event._id;

          return (
            <div key={event._id} className={`event-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="event-card-header" onClick={() => toggleExpand(event._id)}>
                <div className="event-info">
                  <h3>{event.eventType}</h3>
                  <span className={`status-badge ${event.eventStatus.toLowerCase().replace(' ', '-')}`}>
                    {event.eventStatus}
                  </span>
                </div>
                <div className="event-meta">
                  <span className="price">₹{event.totalPrice.toLocaleString()}</span>
                  <span className="date">{event.filters.startDateTime ? new Date(event.filters.startDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}</span>
                </div>
                <ChevronDown size={18} className="chevron" />
              </div>

              <div className="progress-section">
                <div className="progress-labels">
                  <span>Planning</span>
                  <span>Execution</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">{progress}% Completed</span>
              </div>

              {isExpanded && (
                <div className="event-details">
                  <div className="detail-grid">
                    <div className="vendors-section">
                      <h4>Vendor Confirmations</h4>
                      <div className="vendor-list">
                        {['venue', 'catering', 'decorations', 'entertainment', 'photography'].map(category => {
                          const vendorStatus = event.vendorConfirmations?.[category] || 'Pending';
                          const vendorDetail = event.eventParams?.[category];
                          if (!vendorDetail) return null;
                          
                          const roomId = `${event._id}_${category}`;
                          const isChatActive = activeChatId === roomId;

                          return (
                            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                              <div className="vendor-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #EEE' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  <span className="vendor-category" style={{ width: '100px' }}>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                  <span className="vendor-name" style={{ fontWeight: 700 }}>{vendorDetail.name}</span>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                  <span className={`vendor-status ${vendorStatus.toLowerCase()}`}>{vendorStatus}</span>
                                  
                                  <button 
                                    onClick={() => {
                                      if (isChatActive) {
                                        setActiveChatId(null);
                                      } else {
                                        setActiveChatId(roomId);
                                        setUnreadMessages(prev => ({ ...prev, [roomId]: false }));
                                      }
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
                                  >
                                    <MessageSquare size={14} /> Message
                                    
                                    {unreadMessages[roomId] && !isChatActive && (
                                      <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#2ecc71',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 0 2px #fff',
                                        animation: 'pulse 2s infinite'
                                      }}></span>
                                    )}
                                  </button>
                                </div>
                              </div>
                              
                              {isChatActive && (
                                <div style={{ animation: 'slideUp 0.3s ease', marginLeft: '10px', borderLeft: '2px solid #EAEAEA', paddingLeft: '15px' }}>
                                  <InlineChat 
                                     roomId={roomId} 
                                     clientName={user.fullName || user.username} 
                                     vendorName={vendorDetail.name} 
                                     currentUserRole="customer" 
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="tasks-section">
                      <h4>Milestone Checklist</h4>
                      <ul className="task-list">
                        {(event.taskChecklist || []).map((task, idx) => (
                          <li key={idx} className={task.isCompleted ? 'completed' : 'pending'}>
                            <span className="checkbox">{task.isCompleted ? '✓' : '○'}</span>
                            <span className="task-name">{task.task}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="payment-status-box">
                        <h4>Financial Status</h4>
                        <span className={`payment-badge ${event.status}`}>
                          {event.status === 'paid' ? 'Funds Secured' : 'Pending Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
