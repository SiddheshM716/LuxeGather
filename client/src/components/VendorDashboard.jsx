import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, TrendingUp, Clock, CheckCircle, ChevronDown } from 'lucide-react';
import { io } from 'socket.io-client';
import InlineChat from './InlineChat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let bgSocket = null;
function getBgSocket() {
  if (!bgSocket || bgSocket.disconnected) {
    bgSocket = io(SOCKET_URL, { transports: ['websocket'] });
  }
  return bgSocket;
}

const STATUS_CONFIG = {
  Pending:   { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B' },
  Confirmed: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6' },
  Completed: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
};

const VendorDashboard = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const activeChatIdRef = useRef(null);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  useEffect(() => { fetchBookings(); }, [user._id]);

  useEffect(() => {
    const sock = getBgSocket();
    const handleReceive = (msg) => {
      if (!msg.roomId) return;
      if (activeChatIdRef.current !== msg.roomId) {
        setUnreadMessages(prev => ({ ...prev, [msg.roomId]: true }));
      }
    };
    sock.on('receiveMessage', handleReceive);
    return () => sock.off('receiveMessage', handleReceive);
  }, []);

  useEffect(() => {
    if (!bookings.length) return;
    const sock = getBgSocket();
    bookings.forEach(booking => {
      sock.emit('joinRoom', `${booking._id}_${user.category}`);
    });
  }, [bookings, user.category]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/bookings/vendor/${user._id}`);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch vendor bookings', err);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const { data } = await axios.put(`${API_URL}/bookings/${bookingId}/vendor-status`, {
        category: user.category,
        status: newStatus
      });
      setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const estimatedRevenue = (booking) =>
    user.category === 'catering'
      ? user.price * (booking.filters?.guestCount || 1)
      : user.price;

  const totalRevenue = bookings
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + estimatedRevenue(b), 0);

  const confirmedCount = bookings.filter(b => {
    const s = b.vendorConfirmations?.[user.category];
    return s === 'Confirmed' || s === 'Completed';
  }).length;

  return (
    <div style={{
      padding: '110px 5% 80px',
      minHeight: '80vh',
      background: 'linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '2.5rem', display: 'block' }}>
          <span style={{
            display: 'block', fontSize: '0.75rem', fontWeight: 800,
            color: 'var(--gold-accent)', textTransform: 'uppercase',
            letterSpacing: '3px', marginBottom: '1rem',
          }}>
            Vendor Dashboard
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-1.5px', color: '#111', margin: 0 }}>
                {user.name}
              </h1>
              <p style={{ color: '#888', fontSize: '1rem', marginTop: '0.5rem' }}>{user.description}</p>
            </div>
            <span style={{
              padding: '6px 16px', borderRadius: '100px',
              background: '#F3F4F6', color: '#555',
              fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.5px',
              textTransform: 'capitalize',
            }}>
              {user.category}
            </span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem',
        }}>
          {[
            { icon: <TrendingUp size={20} />, label: 'Total Orders', value: bookings.length, accent: '#3B82F6' },
            { icon: <CheckCircle size={20} />, label: 'Confirmed', value: confirmedCount, accent: '#10B981' },
            { icon: <Clock size={20} />, label: 'Revenue Secured', value: `₹${totalRevenue.toLocaleString()}`, accent: 'var(--gold-accent)' },
          ].map(({ icon, label, value, accent }) => (
            <div key={label} style={{
              background: '#FFF', borderRadius: '16px', padding: '1.5rem',
              border: '1px solid #EAEAEA', display: 'flex', alignItems: 'center', gap: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${accent}18`, color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Section Label ── */}
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#CCC', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>
          Incoming Orders ({bookings.length})
        </p>

        {/* ── Orders List ── */}
        {bookings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem', background: '#FFF',
            borderRadius: '20px', border: '1px solid #EAEAEA',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.2rem', opacity: 0.2 }}>✦</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#555', marginBottom: '0.8rem' }}>No orders yet</h3>
            <p style={{ color: '#AAA', fontSize: '0.95rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.7 }}>
              Your profile is live. When clients select {user.name}, their requests will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map(booking => {
              const clientName = booking.user?.fullName || booking.user?.username || 'Private Client';
              const currentStatus = booking.vendorConfirmations?.[user.category] || 'Pending';
              const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
              const roomId = `${booking._id}_${user.category}`;
              const isChatOpen = activeChatId === roomId;
              const hasUnread = unreadMessages[roomId] && !isChatOpen;
              const isExpanded = expandedId === booking._id;
              const revenue = estimatedRevenue(booking);

              return (
                <div key={booking._id} style={{
                  background: '#FFF', borderRadius: '16px', border: '1px solid #EAEAEA',
                  overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  transition: 'box-shadow 0.3s ease',
                }}>
                  {/* Card Header — always visible */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', padding: '1.4rem 1.8rem',
                      gap: '1.2rem', cursor: 'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                  >
                    {/* Status dot */}
                    <div style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: cfg.dot, flexShrink: 0,
                      boxShadow: `0 0 0 3px ${cfg.dot}30`,
                    }} />

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>
                          {booking.eventType}
                          <span style={{ fontWeight: 500, color: '#CCC', fontSize: '0.8rem', marginLeft: '8px' }}>
                            #{booking._id.substring(0, 6).toUpperCase()}
                          </span>
                        </h4>
                        <span style={{
                          padding: '3px 10px', borderRadius: '100px',
                          background: cfg.bg, color: cfg.color,
                          fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.5px',
                        }}>
                          {currentStatus}
                        </span>
                        {booking.status === 'paid' && (
                          <span style={{
                            padding: '3px 10px', borderRadius: '100px',
                            background: '#D1FAE5', color: '#065F46',
                            fontSize: '0.7rem', fontWeight: 800,
                          }}>
                            Paid ✓
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#AAA', fontWeight: 600 }}>
                        {clientName} · {booking.filters?.guestCount} guests
                        {booking.filters?.startDateTime && ` · ${new Date(booking.filters.startDateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    </div>

                    {/* Revenue */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold-accent)', letterSpacing: '-0.5px' }}>
                        +₹{revenue.toLocaleString()}
                      </p>
                    </div>

                    {/* Chevron */}
                    <ChevronDown size={16} style={{
                      color: '#CCC', flexShrink: 0,
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease',
                    }} />
                  </div>

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid #F5F5F5',
                      padding: '1.4rem 1.8rem',
                      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                      animation: 'slideDown 0.25s ease',
                      background: '#FAFAFA',
                    }}>
                      {/* Status selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Update Status
                        </label>
                        <select
                          value={currentStatus}
                          onChange={(e) => { e.stopPropagation(); handleStatusChange(booking._id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700,
                            borderRadius: '10px', border: `1px solid ${cfg.dot}50`,
                            background: cfg.bg, color: cfg.color,
                            cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      {/* Divider */}
                      <div style={{ width: '1px', height: '40px', background: '#EEE' }} />

                      {/* Message button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isChatOpen) {
                            setActiveChatId(null);
                          } else {
                            setActiveChatId(roomId);
                            setUnreadMessages(prev => ({ ...prev, [roomId]: false }));
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 16px', borderRadius: '10px',
                          background: isChatOpen ? '#111' : '#FFF',
                          color: isChatOpen ? '#FFF' : '#333',
                          border: `1px solid ${isChatOpen ? '#111' : '#EAEAEA'}`,
                          fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                          position: 'relative', transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        <MessageSquare size={15} />
                        {isChatOpen ? 'Close Chat' : 'Message Client'}
                        {hasUnread && (
                          <span style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            width: '11px', height: '11px', borderRadius: '50%',
                            background: '#10B981', boxShadow: '0 0 0 2px #FFF',
                            animation: 'pulse 1.5s ease infinite',
                          }} />
                        )}
                      </button>

                      {/* Client info pills */}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#F3F4F6', fontSize: '0.8rem', fontWeight: 700, color: '#444' }}>
                          👤 {clientName}
                        </span>
                        <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#F3F4F6', fontSize: '0.8rem', fontWeight: 700, color: '#444' }}>
                          🎯 {booking.filters?.guestCount} guests
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Inline Chat Panel */}
                  {isChatOpen && (
                    <div style={{
                      borderTop: '1px solid #EAEAEA',
                      padding: '1.2rem 1.8rem 1.5rem',
                      animation: 'slideDown 0.3s ease',
                    }}>
                      <InlineChat
                        roomId={roomId}
                        vendorName={user.name}
                        clientName={clientName}
                        currentUserRole="vendor"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorDashboard;
