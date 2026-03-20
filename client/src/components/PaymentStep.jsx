import React, { useState } from 'react';

export default function PaymentStep({ bookingDetails, onPaymentSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val; // Group by 4
    setCardNumber(formatted.substring(0, 19)); // Max 16 digits + 3 spaces
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length >= 3) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val);
  };
  
  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-panel" style={{ maxWidth: '600px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          ← BACK TO SELECTION
        </button>
        <div className="badge">Secure Checkout</div>
        <h2>Finalize Reservation</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Secure your world-class experience with a premium payment.</p>
        
        <div style={{ background: '#FFF6D9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div className="bill-line" style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>
            <span>Total Investment</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{bookingDetails.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Cardholder Name</label>
            <input type="text" className="input-field" placeholder="John Doe" required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Card Number</label>
            <input type="text" className="input-field" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>Expiry Date</label>
              <input type="text" className="input-field" placeholder="MM/YY" value={expiry} onChange={handleExpiryChange} maxLength="5" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>CVC/CVV</label>
              <input type="password" className="input-field" placeholder="***" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))} required />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
            {isProcessing ? 'Processing Transaction...' : `Pay ₹${bookingDetails.totalPrice.toLocaleString()}`}
          </button>
        </form>
      </div>
    </div>
  );
}
