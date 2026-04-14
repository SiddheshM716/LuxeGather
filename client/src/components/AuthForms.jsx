import React, { useState } from 'react';
import axios from 'axios';
import { PREDEFINED_FEATURES } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AuthForms = ({ step, setStep, setUser, identifier, setIdentifier, otp, setOtp, username, setUsername }) => {
  const [role, setRole] = useState('customer'); // 'customer' or 'vendor'
  
  // Extended form states
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState([]);

  const handleFeatureToggle = (feat) => {
    setFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
  };

  const endpointRouter = role === 'vendor' ? '/vendor' : '/auth';

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}${endpointRouter}/request-otp`, { identifier });
      alert('Security OTP Code: 1234');
      setStep('otp');
    } catch (err) {
      alert('Error requesting OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}${endpointRouter}/verify-otp`, { identifier, otp });
      if (data.user.username) {
        setUser({ ...data.user, appRole: role });
        setStep(role === 'vendor' ? 'vendor-dashboard' : 'dashboard');
      } else {
        setStep('profile');
      }
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = { identifier, username };
      if (role === 'customer') {
        payload.fullName = fullName;
        payload.phoneNumber = phoneNumber;
      } else if (role === 'vendor') {
        payload.businessName = businessName;
        payload.category = category;
        payload.description = description;
        payload.price = price;
        payload.features = features;
        // Image url stub
        payload.imageUrl = ''; 
      }
      
      const { data } = await axios.post(`${API_URL}${endpointRouter}/complete-profile`, payload);
      setUser({ ...data.user, appRole: role });
      setStep(role === 'vendor' ? 'vendor-dashboard' : 'dashboard');
    } catch (err) {
      alert('Error saving profile');
    }
  };

  return (
    <>
      {step === 'login' && (
        <div className="auth-wrapper">
           <div className="auth-panel" style={{ position: 'relative' }}>
              <div className="badge">Welcome</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: '#f5f5f5', padding: '5px', borderRadius: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setRole('customer')} 
                  style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: role === 'customer' ? '#fff' : 'transparent', fontWeight: role === 'customer' ? 'bold' : 'normal', boxShadow: role === 'customer' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  Customer
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole('vendor')} 
                  style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '8px', background: role === 'vendor' ? '#fff' : 'transparent', fontWeight: role === 'vendor' ? 'bold' : 'normal', boxShadow: role === 'vendor' ? '0 2px 10px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  Vendor
                </button>
              </div>
              
              <h2>{role === 'customer' ? 'Customer Portal' : 'Vendor Portal'}</h2>
              <p style={{ marginBottom: '2rem', color: '#666' }}>Secure access to your luxury portfolio</p>
              
              <form onSubmit={handleRequestOtp}>
                 <input type="text" className="input-field" placeholder="Email or Mobile" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                 <button className="btn-primary" style={{ width: '100%' }}>Receive Secure OTP</button>
              </form>
           </div>
        </div>
      )}

      {step === 'otp' && (
        <div className="auth-wrapper">
           <div className="auth-panel">
              <div className="badge">Security Verification</div>
              <h2>Verify ID</h2>
              <p style={{ marginBottom: '2rem', color: '#666' }}>A code has been sent to {identifier}</p>
              <form onSubmit={handleVerifyOtp}>
                 <input type="text" className="input-field" placeholder="4-Digit Code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                 <button className="btn-primary" style={{ width: '100%' }}>Verify & Proceed</button>
              </form>
           </div>
        </div>
      )}

      {step === 'profile' && (
        <div className="auth-wrapper">
           <div className="auth-panel" style={{ maxWidth: '500px', width: '90%' }}>
              <div className="badge">Profile Identity</div>
              <h2>Complete Your Profile</h2>
              <p style={{ marginBottom: '1.5rem', color: '#666' }}>We need a few more details to set up your {role} account.</p>
              
              <form onSubmit={handleCompleteProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <input type="text" className="input-field" placeholder="Choose username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                 
                 {role === 'customer' && (
                   <>
                     <input type="text" className="input-field" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                     <input type="text" className="input-field" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                   </>
                 )}
                 
                 {role === 'vendor' && (
                   <>
                     <input type="text" className="input-field" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                     <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value); setFeatures([]); }} required style={{ appearance: 'none', background: '#fcfcfc' }}>
                       <option value="" disabled>Select Service Category</option>
                       <option value="venue">Venue</option>
                       <option value="catering">Catering</option>
                       <option value="decorations">Decorations</option>
                       <option value="entertainment">Entertainment</option>
                       <option value="photography">Photography</option>
                     </select>
                     
                     {category && PREDEFINED_FEATURES[category] && (
                       <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #EEE' }}>
                         <label style={{ display: 'block', fontWeight: 800, marginBottom: '0.8rem', fontSize: '0.9rem', color: '#444' }}>Select Your Features</label>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                           {PREDEFINED_FEATURES[category].map(feat => (
                             <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                               <input type="checkbox" checked={features.includes(feat)} onChange={() => handleFeatureToggle(feat)} style={{ cursor: 'pointer', accentColor: 'var(--primary-color)' }} />
                               {feat}
                             </label>
                           ))}
                         </div>
                       </div>
                     )}

                     <textarea className="input-field" placeholder="Business Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="3" style={{ resize: 'vertical' }} />
                     <input type="number" className="input-field" placeholder="Base/Starting Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required />
                     <div style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                       [Image Upload Stub - Cloudinary integration pending]
                     </div>
                   </>
                 )}
                 
                 <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Finalize Identity</button>
              </form>
           </div>
        </div>
      )}
    </>
  );
};

export default AuthForms;
