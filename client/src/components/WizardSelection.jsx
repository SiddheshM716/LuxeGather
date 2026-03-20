import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const WizardSelection = ({
  EVENT_TYPES, selectedEvent, setSelectedEvent, wizardStep, setWizardStep,
  WIZARD_STEPS, showConstraintsPopup, setShowConstraintsPopup,
  filters, updateFilter, vendors, searchQuery, setSearchQuery,
  selectedFeature, setSelectedFeature, sortOrder, setSortOrder,
  params, updateParam, totalPrice, handleCreateBooking
}) => {
  return (
    <div className="wizard-container">
      <div className="wizard-main">
        {!selectedEvent ? (
          <div style={{ animation: 'slideUp 0.5s ease' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '2rem' }}>What are we hosting?</h2>
            <div className="selection-grid" style={{ padding: 0 }}>
              {EVENT_TYPES.map(type => (
                <div key={type.id} className="event-card" onClick={() => { setSelectedEvent(type); setWizardStep(0); }}>
                  <img src={type.image} alt={type.name} />
                  <div className="event-card-content">
                    <h3>{type.name}</h3>
                    <p>Starting at ₹{type.basePrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', color: '#666', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              ← DISCARD SELECTION
            </button>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem' }}>Personalize your {selectedEvent.name}</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Refining the details of your masterplan.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div className="stepper" style={{ marginBottom: 0, flex: 1 }}>
                {WIZARD_STEPS.map((s, i) => (
                  <div key={s.id} className={`step-indicator ${i <= wizardStep ? 'active' : ''}`} style={{ cursor: 'pointer' }} onClick={() => i <= wizardStep && setWizardStep(i)}></div>
                ))}
              </div>
              <button className="btn-secondary" onClick={() => setShowConstraintsPopup(true)} style={{ marginLeft: '1rem', padding: '0.4rem 1rem' }}>
                Event Details
              </button>
            </div>
            
            {showConstraintsPopup && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="param-card" style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', maxWidth: '800px', width: '90%', animation: 'slideUp 0.3s', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800, margin: 0 }}>Event Details</h3>
                    <button onClick={() => setShowConstraintsPopup(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#888' }}>&times;</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Guest Count ({filters.guestCount})</label>
                      <input type="range" min="10" max="2000" step="10" value={filters.guestCount} onChange={(e) => updateFilter('guestCount', Number(e.target.value))} style={{ accentColor: 'var(--primary-color)', width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Overall Budget (₹)</label>
                      <input type="number" className="input-field" value={filters.budget} onChange={(e) => updateFilter('budget', Number(e.target.value))} />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Start Date & Time</label>
                      <DatePicker 
                        selected={filters.startDateTime ? new Date(filters.startDateTime) : null}
                        onChange={(date) => updateFilter('startDateTime', date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="input-field"
                        placeholderText="Select start time"
                        minDate={new Date()}
                        wrapperClassName="date-picker-wrapper"
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>End Date & Time</label>
                      <DatePicker 
                        selected={filters.endDateTime ? new Date(filters.endDateTime) : null}
                        onChange={(date) => updateFilter('endDateTime', date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="input-field"
                        placeholderText="Select end time"
                        minDate={filters.startDateTime ? new Date(filters.startDateTime) : new Date()}
                        wrapperClassName="date-picker-wrapper"
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Target City/Area</label>
                      <input type="text" className="input-field" placeholder="e.g. Mumbai, India" value={filters.location} onChange={(e) => updateFilter('location', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => setShowConstraintsPopup(false)} style={{ marginTop: '2rem', width: '100%' }}>Update Details</button>
                </div>
              </div>
            )}

            {wizardStep >= 0 && wizardStep <= 4 && (() => {
              const currentId = WIZARD_STEPS[wizardStep].id;
              const currentVendors = vendors?.[currentId] || [];
              const allFeatures = Array.from(new Set(currentVendors.flatMap(v => v.features || [])));

              return (
                <div className="param-card" style={{ animation: 'fadeIn 0.3s' }}>
                  <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', margin: 0 }}>{WIZARD_STEPS[wizardStep].title}</h3>
                  
                  {/* Filters Row */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <input type="text" className="input-field" placeholder="Search vendors..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, minWidth: '200px', marginBottom: 0, padding: '0.6rem 1rem' }} />
                    <select className="input-field" value={selectedFeature} onChange={e => setSelectedFeature(e.target.value)} style={{ width: 'auto', minWidth: '200px', marginBottom: 0 }}>
                      <option value="">All Features</option>
                      {allFeatures.map(f => (<option key={f} value={f}>{f}</option>))}
                    </select>
                    <select className="input-field" value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={{ width: 'auto', minWidth: '150px', marginBottom: 0 }}>
                      <option value="recommended">Recommended</option>
                      <option value="priceAsc">Price: Low to High</option>
                      <option value="priceDesc">Price: High to Low</option>
                    </select>
                  </div>
                  
                  <div className="vendor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {currentVendors
                      .filter(opt => opt.name.toLowerCase().includes(searchQuery.toLowerCase()) || opt.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
                      .filter(opt => selectedFeature === '' || opt.features.includes(selectedFeature))
                      .sort((a, b) => {
                        if (sortOrder === 'priceAsc') return a.price - b.price;
                        if (sortOrder === 'priceDesc') return b.price - a.price;
                        return 0;
                      })
                      .map(opt => {
                        const pKey = WIZARD_STEPS[wizardStep].id;
                      return (
                        <div 
                          key={opt._id} 
                          className={`vendor-card ${params[pKey]?._id === opt._id ? 'selected' : ''}`} 
                          style={{ 
                            border: params[pKey]?._id === opt._id ? '2px solid var(--primary-color)' : '1px solid #EEE', 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            background: '#FFF',
                            boxShadow: params[pKey]?._id === opt._id ? '0 10px 20px rgba(171, 22, 22, 0.1)' : '0 4px 6px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease'
                          }} 
                          onClick={() => updateParam(pKey, opt)}
                        >
                          {opt.imageUrl && (
                            <div style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
                              <img src={opt.imageUrl} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: params[pKey]?._id === opt._id ? 'scale(1.05)' : 'scale(1)' }} />
                            </div>
                          )}
                          
                          <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                              <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0, paddingRight: '10px' }}>{opt.name}</h4>
                              <span style={{ fontWeight: 800, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                                +₹{opt.price.toLocaleString()}{pKey === 'catering' ? ' / person' : ''}
                              </span>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '40px' }}>{opt.description}</p>
                            
                            {opt.features && opt.features.length > 0 && (
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {opt.features.map((feature, idx) => (
                                  <li key={idx} style={{ fontSize: '0.8rem', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: 'var(--gold-accent)' }}>•</span> {feature}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {wizardStep === 5 && (
              <div className="param-card" style={{ animation: 'fadeIn 0.3s' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Review Selection</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid #EEE', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#888', fontSize: '0.85rem', display: 'block' }}>Event Constraints</span>
                      <strong>{filters.guestCount} Guests</strong>, Budget: ₹{filters.budget.toLocaleString()}
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => setShowConstraintsPopup(true)}>Edit</button>
                  </div>
                  {WIZARD_STEPS.slice(0, 5).map((stepObj, idx) => (
                    <div key={stepObj.id} style={{ padding: '1rem', border: '1px solid #EEE', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#888', fontSize: '0.85rem', display: 'block' }}>{stepObj.title}</span>
                        <strong>{params[stepObj.id]?.name || 'Pending Selection'}</strong>
                        {params[stepObj.id] && <span style={{ marginLeft: '10px', color: 'var(--primary-color)' }}>+₹{params[stepObj.id].price.toLocaleString()}</span>}
                      </div>
                      <button className="btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => setWizardStep(idx)}>Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => setWizardStep(prev => Math.max(0, prev - 1))} disabled={wizardStep === 0}>Back</button>
              {wizardStep < 5 ? (
                <button className="btn-primary" onClick={() => { setSearchQuery(''); setSortOrder('recommended'); setSelectedFeature(''); setWizardStep(prev => prev + 1); }}>Next</button>
              ) : (
                <button className="btn-primary" onClick={handleCreateBooking}>Proceed to Secure</button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="floating-calc">
         <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', borderBottom: '1px solid #EEE', paddingBottom: '1rem' }}>Investment Summary</h3>
         {selectedEvent ? (
           <>
             <div className="bill-line"><span>{selectedEvent.name}</span> <span>₹{selectedEvent.basePrice.toLocaleString()}</span></div>
             <div className="bill-line" style={{ opacity: params.venue ? 1 : 0.5 }}><span>{params.venue?.name || 'Venue (Pending)'}</span> <span>₹{(params.venue?.price || 0).toLocaleString()}</span></div>
             <div className="bill-line" style={{ opacity: params.decorations ? 1 : 0.5 }}><span>{params.decorations?.name || 'Decorations (Pending)'}</span> <span>₹{(params.decorations?.price || 0).toLocaleString()}</span></div>
             <div className="bill-line" style={{ opacity: params.catering ? 1 : 0.5 }}><span>{params.catering ? `Catering (${filters.guestCount} Guests)` : 'Catering (Pending)'}</span> <span>₹{((params.catering?.price || 0) * filters.guestCount).toLocaleString()}</span></div>
             <div className="bill-line" style={{ opacity: params.entertainment ? 1 : 0.5 }}><span>{params.entertainment?.name || 'Entertainment (Pending)'}</span> <span>₹{(params.entertainment?.price || 0).toLocaleString()}</span></div>
             <div className="bill-line" style={{ opacity: params.photography ? 1 : 0.5 }}><span>{params.photography?.name || 'Photography (Pending)'}</span> <span>₹{(params.photography?.price || 0).toLocaleString()}</span></div>
             
             <div className="bill-line total">
              <span>Total Estimated</span> 
              <span style={{ color: totalPrice > filters.budget ? 'red' : 'inherit' }}>₹{totalPrice.toLocaleString()}</span>
             </div>
             {totalPrice > filters.budget && (
               <p style={{ color: 'red', fontSize: '0.8rem', textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>Exceeds Target Budget</p>
             )}
           </>
         ) : (
           <p style={{ textAlign: 'center', margin: '4rem 0', opacity: 0.5 }}>Select an experience to view investment breakdown.</p>
         )}
      </aside>
    </div>
  );
};

export default WizardSelection;
