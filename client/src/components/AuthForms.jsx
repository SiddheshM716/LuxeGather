import React from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AuthForms = ({ step, setStep, setUser, identifier, setIdentifier, otp, setOtp, username, setUsername }) => {
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { identifier });
      alert('Security OTP Code: 1234');
      setStep('otp');
    } catch (err) {
      alert('Error requesting OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/auth/verify-otp`, { identifier, otp });
      if (data.user.username) {
        setUser(data.user);
        setStep('selection');
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
      const { data } = await axios.post(`${API_URL}/auth/complete-profile`, { identifier, username });
      setUser(data.user);
      setStep('selection');
    } catch (err) {
      alert('Error saving profile');
    }
  };

  return (
    <>
      {step === 'login' && (
        <div className="auth-wrapper">
           <div className="auth-panel">
              <div className="badge">Welcome</div>
              <h2>Log In / Sign Up</h2>
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
           <div className="auth-panel">
              <div className="badge">Profile Identity</div>
              <h2>Username</h2>
              <form onSubmit={handleCompleteProfile}>
                 <input type="text" className="input-field" placeholder="Choose username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                 <button className="btn-primary" style={{ width: '100%' }}>Finalize Identity</button>
              </form>
           </div>
        </div>
      )}
    </>
  );
};

export default AuthForms;
