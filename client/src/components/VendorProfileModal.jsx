import React, { useState } from 'react';
import axios from 'axios';
import { PREDEFINED_FEATURES } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const VendorProfileModal = ({ user, setUser, close }) => {
  const [description, setDescription] = useState(user.description || '');
  const [price, setPrice] = useState(user.price || 0);
  const [features, setFeatures] = useState(user.features || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user.imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleFeatureToggle = (feat) => {
    setFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('price', Number(price));
      formData.append('features', JSON.stringify(features));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await axios.put(`${API_URL}/vendors/${user._id}/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Preserve appRole locally and update user
      setUser({ ...data.vendor, appRole: user.appRole });
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
      <div className="param-card" style={{ background: '#FFF', padding: '2.5rem', borderRadius: '16px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s', position: 'relative' }}>
        <button onClick={close} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#888', lineHeight: 1 }}>&times;</button>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Edit Digital Identity</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Refine how luxury clients perceive your {user.category} service.</p>
        
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '1rem', fontSize: '0.9rem' }}>Service Showcase Image</label>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: '#f5f5f5', border: '1px solid #EEE', flexShrink: 0 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAA', fontSize: '0.8rem' }}>No Image</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                  id="vendor-image-upload"
                />
                <label 
                  htmlFor="vendor-image-upload" 
                  className="btn-secondary" 
                  style={{ display: 'inline-block', padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Choose New Portrait
                </label>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#999' }}>Recommended: 16:9 ratio, high resolution</p>
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Business Pitch</label>
            <textarea 
              className="input-field" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              required 
              rows="4" 
              style={{ resize: 'vertical', minHeight: '100px' }} 
            />
          </div>

          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Base Starting Price (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              required 
            />
          </div>


          <div>
            <label style={{ fontWeight: 800, display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem' }}>Service Tiers & Features</label>
            {user.category && PREDEFINED_FEATURES[user.category] ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {PREDEFINED_FEATURES[user.category].map(feat => (
                  <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer', padding: '8px 12px', background: features.includes(feat) ? 'var(--base-bg)' : '#fcfcfc', border: features.includes(feat) ? '1px solid var(--primary-color)' : '1px solid #EEE', borderRadius: '8px', transition: 'all 0.2s' }}>
                    <input type="checkbox" checked={features.includes(feat)} onChange={() => handleFeatureToggle(feat)} style={{ accentColor: 'var(--primary-color)' }} />
                    <span style={{ fontWeight: features.includes(feat) ? 700 : 500 }}>{feat}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9rem' }}>No predefined features for this category.</p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isSaving} style={{ marginTop: '1rem', padding: '1rem' }}>
            {isSaving ? 'Deploying Changes...' : 'Save Profile Integrity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorProfileModal;
