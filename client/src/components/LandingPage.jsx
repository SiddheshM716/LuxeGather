import React, { useState } from 'react';

const LandingPage = ({ setStep, vendors, selectedVendorModal, setSelectedVendorModal }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <>
      <section id="home" className="hero">
        <div className="hero-content">
          <h2>Elegance <br/>Redefined.</h2>
          <p>The world's most exclusive platform for bespoke events. We don't just plan gatherings; we craft legacies of luxury and moments that transcend time.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setStep('selection')}>Start Your Legacy</button>
          </div>
        </div>
        <div className="hero-image-container">
          <img src="/assets/luxury_event_hero_1773756847176.png" className="hero-main-img" alt="Luxury Event" />
        </div>
      </section>
      
      {[{ id: 'venue', title: 'Exquisite Venues', desc: 'From private islands to historic palaces, discover spaces that inspire awe.', bg: '#FFF' },
        { id: 'catering', title: 'Culinary Excellence', desc: 'Michelin-starred chefs carefully crafting menus for the most discerning palates.', bg: 'var(--base-bg)' },
        { id: 'decorations', title: 'Aesthetic Design', desc: 'Transforming spaces with bespoke floral and ambient lighting architectures.', bg: '#FFF' },
        { id: 'entertainment', title: 'World-Class Entertainment', desc: 'A-list artist bookings, symphony orchestras, and electric live acts.', bg: 'var(--base-bg)' },
        { id: 'photography', title: 'Memory Capture', desc: 'Cinematographers and fashion editorial photographers sealing moments in time.', bg: '#FFF' }
      ].map(cat => {
        const defaultImages = {
          venue: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600'],
          catering: ['https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&q=80&w=600'],
          decorations: ['https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&q=80&w=600'],
          entertainment: ['https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600'],
          photography: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=600', 'https://images.unsplash.com/photo-1533142266401-9231f2adbc4c?auto=format&fit=crop&q=80&w=600']
        };
        return (
          <section key={cat.id} id={cat.id} style={{ padding: '6rem 5%', background: cat.bg }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>{cat.title}</h2>
              <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>{cat.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {(vendors?.[cat.id] || []).slice(0, expandedCategories[cat.id] ? undefined : 3).map((v, idx) => {
                  const fallbackImg = defaultImages[cat.id][idx % 3];
                  return (
                    <div key={v._id} className="event-card" onClick={() => setSelectedVendorModal({...v, categoryId: cat.id, fallbackImg})}>
                      <img src={v.imageUrl || v.image || fallbackImg} alt={v.name} style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                      <div className="event-card-content" style={{ textAlign: 'left', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{v.name}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#f39c12', fontWeight: 700 }}>
                            ★ {v.rating ? v.rating.toFixed(1) : '5.0'} 
                            <span style={{ color: '#888', fontWeight: 500, fontSize: '0.8rem' }}>({v.ratingCount || 1})</span>
                          </div>
                        </div>
                        <p style={{ height: '45px', overflow: 'hidden', color: '#666', fontSize: '0.95rem', marginBottom: '1rem' }}>{v.description}</p>
                        <p style={{ fontWeight: 800, color: 'var(--primary-color)', margin: 0 }}>Click For Details →</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {vendors?.[cat.id] && vendors[cat.id].length > 3 && (
                <div style={{ marginTop: '3rem' }}>
                  <button className="btn-secondary" onClick={() => toggleExpand(cat.id)} style={{ padding: '0.6rem 2rem', fontWeight: 800 }}>
                    {expandedCategories[cat.id] ? 'Show Less' : `Show All ${vendors[cat.id].length} Providers`}
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section id="reviews" style={{ padding: '6rem 5%', background: 'var(--base-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, textAlign: 'center', marginBottom: '3rem' }}>Words of Acclaim</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
             {[
               { name: 'Alexander Sterling', role: 'CEO, Horizon Capital', quote: 'LuxeGather orchestrated our annual gala flawlessly. The attention to detail is unparalleled in the industry.' },
               { name: 'Sophia Laurent', role: 'Bride', quote: 'Our wedding was an absolute dream. Every vendor they provided was top-tier. True luxury.' },
               { name: 'Marcus Chen', role: 'Philanthropist', quote: 'The sheer elegance and seamless execution of our charity event left guests speechless.' }
             ].map((review, i) => (
               <div key={i} className="param-card" style={{ background: '#FFF' }}>
                 <div style={{ color: 'var(--gold-accent)', fontSize: '3rem', marginBottom: '1rem', lineHeight: 0.5, marginTop: '1rem' }}>"</div>
                 <p style={{ fontSize: '1.2rem', color: '#444', fontStyle: 'italic', marginBottom: '2rem' }}>{review.quote}</p>
                 <h4 style={{ fontWeight: 800, margin: 0 }}>{review.name}</h4>
                 <span style={{ color: '#888', fontSize: '0.9rem' }}>{review.role}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section id="about-us" style={{ padding: '6rem 5%', background: '#FFF' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Our Legacy</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.8 }}>
            LuxeGather was founded on a simple principle: true luxury is intensely personal. Since 1998, our concierge architects have orchestrated the world's most exclusive gatherings. We connect discerning clients with unparalleled venues, Michelin-starred chefs, and world-class entertainers to craft legacies, not just events.
          </p>
        </div>
      </section>

      <section id="contact-us" style={{ padding: '6rem 5%', background: '#111', color: '#FFF' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>Concierge Support</h2>
          <p style={{ opacity: 0.8, marginBottom: '3rem', fontSize: '1.1rem' }}>Available 24/7 for our esteemed clientele.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.5rem' }}>Global Hotline</h4>
              <p>+1 (800) LUXE-GATHER</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.5rem' }}>Private Email</h4>
              <p>concierge@luxegather.com</p>
            </div>
            <div>
              <h4 style={{ color: 'var(--gold-accent)', marginBottom: '0.5rem' }}>Headquarters</h4>
              <p>100 Fifth Avenue, New York, NY</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
