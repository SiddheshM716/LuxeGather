import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CustomerProfileModal = ({ user, setUser, close }) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await axios.put(`${API_URL}/auth/profile/${user._id}`, {
        fullName,
        phoneNumber
      });
      setUser({ ...data.user, appRole: user.appRole });
      alert('Profile updated successfully!');
      close();
    } catch (error) {
      alert('Failed to update profile');
      console.error(error);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="param-card" style={{ background: '#FFF', padding: '2.5rem', borderRadius: '16px', maxWidth: '500px', width: '90%', animation: 'slideDown 0.3s', position: 'relative' }}>
        <button onClick={close} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}>&times;</button>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Personal Profile</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Update your details for a personalized LuxeGather experience.</p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSaving} style={{ marginTop: '1rem', padding: '1rem' }}>
            {isSaving ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfileModal;
