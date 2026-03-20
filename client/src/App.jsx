import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import ChatWidget from './components/ChatWidget';
import PaymentStep from './components/PaymentStep';
import LandingPage from './components/LandingPage';
import AuthForms from './components/AuthForms';
import WizardSelection from './components/WizardSelection';
import SummaryStep from './components/SummaryStep';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const EVENT_TYPES = [
  { id: 'Marriages', name: 'Royale Marriage', basePrice: 1200000, image: '/assets/wedding_event_card_1773756867430.png', desc: 'An ethereal celebration of love with majestic decor and royal treatment.' },
  { id: 'Conferences', name: 'Elite Conference', basePrice: 2000000, image: '/assets/corporate_event_card_1773756889132.png', desc: 'Sophisticated corporate gatherings for the world\'s most influential leaders.' },
  { id: 'Birthdays', name: 'Milestone Birthday', basePrice: 400000, image: '/assets/wedding_event_card_1773756867430.png', desc: 'Celebrate life\'s greatest moments with a bespoke party like no other.' }
];

function App() {
  const [step, setStep] = useState('landing');
  
  // Auth state
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    guestCount: 100,
    budget: 4000000,
    startDateTime: '',
    endDateTime: '',
    location: ''
  });

  // Parameter state
  const [wizardStep, setWizardStep] = useState(0);
  const [showConstraintsPopup, setShowConstraintsPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [vendors, setVendors] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVendorModal, setSelectedVendorModal] = useState(null);

  const WIZARD_STEPS = [
    { id: 'venue', title: 'Venue Selection' },
    { id: 'catering', title: 'Culinary Experience' },
    { id: 'decorations', title: 'Aesthetic Design' },
    { id: 'entertainment', title: 'Entertainment' },
    { id: 'photography', title: 'Memory Capture' },
    { id: 'review', title: 'Review & Compute' }
  ];
  const [params, setParams] = useState({
    venue: null,
    catering: null,
    decorations: null,
    entertainment: null,
    photography: null
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/vendors`);
        setVendors(data);
      } catch (err) {
        console.error('Failed to load vendors', err);
      }
    })();
  }, []);

  const [bookingId, setBookingId] = useState(null);

  const totalPrice = useMemo(() => {
    if (!selectedEvent) return 0;
    return selectedEvent.basePrice + 
           (params.venue?.price || 0) + 
           ((params.catering?.price || 0) * filters.guestCount) + 
           (params.decorations?.price || 0) + 
           (params.entertainment?.price || 0) + 
           (params.photography?.price || 0);
  }, [selectedEvent, filters.guestCount, params]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(scrollToTop, [step]);

  // Booking Handlers
  const handleCreateBooking = async () => {
    if (!user) {
      alert('Please log in or sign up to finalize your reservation.');
      setStep('login');
      return;
    }

    try {
      const payload = {
        user: user._id,
        eventType: selectedEvent.id,
        eventParams: {
          venue: params.venue._id,
          catering: params.catering._id,
          decorations: params.decorations._id,
          entertainment: params.entertainment._id,
          photography: params.photography._id
        },
        filters,
        totalPrice
      };
      const { data } = await axios.post(`${API_URL}/bookings`, payload);
      setBookingId(data.booking._id);
      setStep('payment');
    } catch (err) {
      alert('Error creating booking');
      console.error(err);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      if (bookingId) {
        await axios.post(`${API_URL}/bookings/${bookingId}/pay`);
      }
      setStep('summary');
    } catch (error) {
      alert('Error finalizing payment on server');
    }
  };

  const updateParam = (key, val) => setParams(prev => ({ ...prev, [key]: val }));
  const updateFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  return (
    <div className="app-container">
      <header>
        <div className="logo" onClick={() => setStep('landing')}>LuxeGather</div>
        <nav className="nav-links" style={{ gap: '1.2rem', overflowX: 'visible', whiteSpace: 'nowrap' }}>
          <a href="#home" onClick={() => setStep('landing')}>Home</a>
          
          <div className="nav-dropdown">
            <span style={{ fontWeight: 600, color: 'var(--text-dark)', padding: '0 0.5rem' }}>Services ▾</span>
            <div className="nav-dropdown-content">
              <a href="#venue" onClick={() => setStep('landing')}>Venue Selection</a>
              <a href="#catering" onClick={() => setStep('landing')}>Culinary</a>
              <a href="#decorations" onClick={() => setStep('landing')}>Aesthetics</a>
              <a href="#entertainment" onClick={() => setStep('landing')}>Entertainment</a>
              <a href="#photography" onClick={() => setStep('landing')}>Photography</a>
            </div>
          </div>
          
          <a href="#reviews" onClick={() => setStep('landing')}>Reviews</a>
          <a href="#about-us" onClick={() => setStep('landing')}>About Us</a>
          <a href="#contact-us" onClick={() => setStep('landing')}>Contact Us</a>
          {user ? (
            <div className="user-profile" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
               <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{user.username.toUpperCase()}</span>
               <button className="btn-secondary" onClick={() => { setUser(null); setStep('landing'); }} style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', borderWidth: '1px' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
              <button className="btn-secondary" onClick={() => setStep('login')} style={{ padding: '0.5rem 1.2rem', borderWidth: '1px' }}>Log In</button>
              <button className="btn-primary" onClick={() => setStep('login')} style={{ padding: '0.5rem 1.2rem' }}>Sign Up</button>
            </div>
          )}
        </nav>
      </header>

      <main>
        {step === 'landing' && <LandingPage setStep={setStep} vendors={vendors} selectedVendorModal={selectedVendorModal} setSelectedVendorModal={setSelectedVendorModal} />}
        
        {['login', 'otp', 'profile'].includes(step) && (
          <AuthForms step={step} setStep={setStep} setUser={setUser} identifier={identifier} setIdentifier={setIdentifier} otp={otp} setOtp={setOtp} username={username} setUsername={setUsername} />
        )}

        {step === 'selection' && (
          <WizardSelection 
            EVENT_TYPES={EVENT_TYPES} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent}
            wizardStep={wizardStep} setWizardStep={setWizardStep} WIZARD_STEPS={WIZARD_STEPS}
            showConstraintsPopup={showConstraintsPopup} setShowConstraintsPopup={setShowConstraintsPopup}
            filters={filters} updateFilter={updateFilter} vendors={vendors}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature}
            sortOrder={sortOrder} setSortOrder={setSortOrder} params={params} updateParam={updateParam}
            totalPrice={totalPrice} handleCreateBooking={handleCreateBooking}
          />
        )}

        {step === 'payment' && (
          <PaymentStep bookingDetails={{ totalPrice }} onPaymentSuccess={handlePaymentSuccess} onCancel={() => setStep('selection')} />
        )}

        {step === 'summary' && (
          <SummaryStep selectedEvent={selectedEvent} params={params} filters={filters} totalPrice={totalPrice} setStep={setStep} setSelectedEvent={setSelectedEvent} />
        )}
      </main>

      <footer style={{ background: 'var(--header-bg)', padding: '80px 5%', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', maxWidth: '1200px', margin: '0 auto' }}>
           <div>
             <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '1.5rem' }}>LuxeGather</h4>
             <p style={{ opacity: 0.6, lineHeight: 1.6 }}>Crafting extraordinary legacies since 1998. The absolute pinnacle of bespoke event architecture.</p>
             <p style={{ opacity: 0.4, marginTop: '2rem', fontSize: '0.85rem' }}>&copy; {new Date().getFullYear()} LuxeGather Holdings LLC.</p>
           </div>
           <div>
             <h5 style={{ fontWeight: 800, marginBottom: '1.2rem' }}>Platform</h5>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', opacity: 0.6, padding: 0 }}>
               <li><a href="#home" onClick={() => setStep('landing')} style={{ color: 'inherit', textDecoration: 'none' }}>Home</a></li>
               <li><a href="#venue" onClick={() => setStep('landing')} style={{ color: 'inherit', textDecoration: 'none' }}>Services</a></li>
               <li><a href="#reviews" onClick={() => setStep('landing')} style={{ color: 'inherit', textDecoration: 'none' }}>Testimonials</a></li>
             </ul>
           </div>
           <div>
             <h5 style={{ fontWeight: 800, marginBottom: '1.2rem' }}>Company</h5>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem', opacity: 0.6, padding: 0 }}>
               <li><a href="#about-us" onClick={() => setStep('landing')} style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a></li>
               <li><a href="#contact-us" onClick={() => setStep('landing')} style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</a></li>
               <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a></li>
             </ul>
           </div>
        </div>
      </footer>
      
      <ChatWidget />
      
      {selectedVendorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="param-card" style={{ background: '#FFF', padding: 0, borderRadius: '16px', maxWidth: '600px', width: '90%', animation: 'slideUp 0.3s', overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => setSelectedVendorModal(null)} 
              style={{ position: 'absolute', top: '15px', right: '20px', background: 'rgba(0,0,0,0.5)', color: '#FFF', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', zIndex: 1 }}
            >&times;</button>
            <img src={selectedVendorModal.image || selectedVendorModal.fallbackImg || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop'} alt={selectedVendorModal.name} style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block' }} />
            
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedVendorModal.name}</h3>
              <p style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                 Starting at ₹{selectedVendorModal.price.toLocaleString()}{selectedVendorModal.categoryId === 'catering' ? ' / person' : ''}
              </p>
              <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6, marginBottom: '2rem' }}>
                {selectedVendorModal.description}
              </p>
              
              <h4 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>Available Features</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(selectedVendorModal.features || []).map(f => (
                  <span key={f} style={{ background: 'var(--base-bg)', padding: '5px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600 }}>{f}</span>
                ))}
              </div>
              <button className="btn-primary" onClick={() => { setSelectedVendorModal(null); setStep('selection'); }} style={{ width: '100%', marginTop: '2rem', padding: '1rem' }}>
                Experience with LuxeGather
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
