import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function PaymentStep({ user, bookingDetails, onPaymentSuccess, onCancel }) {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Pre-load the script for smoother experience
    loadScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Load Razorpay Script (if not already loaded)
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 2. Create Order on Server
      const result = await axios.post(`${API_URL}/bookings/razorpay/order`, {
        amount: bookingDetails.totalPrice
      });

      if (!result.data) {
        alert('Server error. Are you online?');
        setIsProcessing(false);
        return;
      }

      const { amount, id: order_id, currency } = result.data;

      // 3. Initialize Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount.toString(),
        currency: currency,
        name: 'LuxeGather',
        description: 'Premium Event Reservation',
        image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=150&q=80',
        order_id: order_id,
        handler: async function (response) {
          try {
            // 4. Verify Payment Signature
            const verifyRes = await axios.post(`${API_URL}/bookings/razorpay/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 200) {
              // 5. Complete Booking
              onPaymentSuccess();
            }
          } catch (error) {
            console.error(error);
            alert('Payment verification failed.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.fullName || user?.username || 'Customer',
          email: user?.email || 'customer@example.com',
          contact: user?.phoneNumber || '9999999999',
        },
        theme: {
          color: '#d4af37' // LuxeGather Primary Gold color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Could not initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-panel" style={{ maxWidth: '600px' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
          ← BACK TO SELECTION
        </button>
        <div className="badge">Secure Checkout</div>
        <h2>Finalize Reservation</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Secure your world-class experience with a premium payment powered by Razorpay.</p>
        
        <div style={{ background: '#FFF6D9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <div className="bill-line" style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>
            <span>Total Investment</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{bookingDetails.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #EAEAEA', borderRadius: '12px', background: '#F9F9F9' }}>
            <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>Billing Details</h4>
            <div style={{ display: 'grid', gap: '0.5rem', color: '#555', fontSize: '0.95rem' }}>
              <div><strong>Name:</strong> {user?.fullName || user?.username || 'Customer'}</div>
              <div><strong>Contact:</strong> {user?.phoneNumber || 'Not provided'}</div>
            </div>
          </div>
          
          <button className="btn-primary" style={{ width: '100%', fontSize: '1.1rem', padding: '1.2rem' }} disabled={isProcessing}>
            {isProcessing ? 'Initializing Secure Gateway...' : `Pay ₹${bookingDetails.totalPrice.toLocaleString()} with Razorpay`}
          </button>
        </form>
      </div>
    </div>
  );
}
