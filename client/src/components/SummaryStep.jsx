import React from 'react';

const SummaryStep = ({ selectedEvent, params, filters, totalPrice, setStep, setSelectedEvent }) => {
  return (
    <div className="auth-wrapper">
       <div className="auth-panel" style={{ maxWidth: '750px' }}>
          <div className="badge">Success</div>
          <h2 style={{ fontSize: '3.5rem' }}>Reservation Secured.</h2>
          <p style={{ fontSize: '1.2rem', margin: '1.5rem 0 3rem' }}>Your masterplan for the {selectedEvent?.name} has been processed. A concierge will contact you within the hour.</p>
          <div style={{ background: '#FFF6D9', padding: '2rem', borderRadius: '16px', textAlign: 'left', marginBottom: '3rem' }}>
             <div className="bill-line"><strong>Event Type</strong> <span>{selectedEvent?.name}</span></div>
             <div className="bill-line"><strong>Venue</strong> <span>{params.venue?.name}</span></div>
             <div className="bill-line"><strong>Catering</strong> <span>{params.catering?.name}</span></div>
             <div className="bill-line"><strong>Decorations</strong> <span>{params.decorations?.name}</span></div>
             <div className="bill-line"><strong>Entertainment</strong> <span>{params.entertainment?.name}</span></div>
             <div className="bill-line"><strong>Photography</strong> <span>{params.photography?.name}</span></div>
             <div className="bill-line"><strong>Guests</strong> <span>{filters.guestCount}</span></div>
             <div className="bill-line"><strong>Target Region</strong> <span>{filters.location || 'TBA'}</span></div>
             <div className="bill-line"><strong>Start Date</strong> <span>{filters.startDateTime ? new Date(filters.startDateTime).toLocaleString() : 'TBA'}</span></div>
             <div className="bill-line"><strong>End Date</strong> <span>{filters.endDateTime ? new Date(filters.endDateTime).toLocaleString() : 'TBA'}</span></div>
             
             <div className="bill-line" style={{ color: 'var(--primary-color)', fontSize: '1.4rem', fontWeight: 900, borderTop: '1px solid #DDD', paddingTop: '1rem', marginTop: '1rem' }}>
              <strong>Final Investment Paid</strong> 
              <span>₹{totalPrice.toLocaleString()}</span>
             </div>
          </div>
          <button className="btn-secondary" onClick={() => { setStep('landing'); setSelectedEvent(null); }}>The Journey Continues</button>
       </div>
    </div>
  );
};

export default SummaryStep;
