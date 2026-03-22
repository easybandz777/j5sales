"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EMPTY_FORM = {
  companyName: '', contactName: '', email: '', phone: '',
  website: '', niche: '', location: '', businessCategory: '',
  leadSource: 'Manual Entry', opportunityLevel: 'medium', notes: '',
};

export default function AddLeadModal({ isOpen, onClose, onLeadAdded, editLead }) {
  const isEdit = !!editLead;
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editLead) {
      setFormData({
        companyName: editLead.companyName || '',
        contactName: editLead.contactName || '',
        email: editLead.email || '',
        phone: editLead.phone || '',
        website: editLead.website || '',
        niche: editLead.niche || '',
        location: editLead.location || '',
        businessCategory: editLead.businessCategory || '',
        leadSource: editLead.leadSource || 'Manual Entry',
        opportunityLevel: editLead.opportunityLevel || 'medium',
        notes: editLead.notes || '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [editLead]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isEdit ? '/api/leads/' + editLead.id : '/api/leads';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save lead');
      }
      const lead = await res.json();
      onLeadAdded?.(lead);
      onClose();
      if (!isEdit) setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90vw' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 style={{ margin: 0 }}>{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="btn btn-ghost icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {error && <div style={{ color: 'var(--status-error)', marginBottom: 'var(--space-3)', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Company Name *</label>
              <input name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Acme Corp" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Contact Name *</label>
              <input name="contactName" value={formData.contactName} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@acme.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="555-0123" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Website</label>
              <input name="website" value={formData.website} onChange={handleChange} placeholder="https://acme.com" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Niche / Industry</label>
              <input name="niche" value={formData.niche} onChange={handleChange} placeholder="Manufacturing" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Location</label>
              <input name="location" value={formData.location} onChange={handleChange} placeholder="Chicago, IL" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Business Category</label>
              <input name="businessCategory" value={formData.businessCategory} onChange={handleChange} placeholder="B2B Wholesale" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lead Source</label>
              <select name="leadSource" value={formData.leadSource} onChange={handleChange}>
                <option value="Manual Entry">Manual Entry</option>
                <option value="Apollo Data">Apollo Data</option>
                <option value="Inbound Form">Inbound Form</option>
                <option value="Cold Outbound">Cold Outbound</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Opportunity Level</label>
              <select name="opportunityLevel" value={formData.opportunityLevel} onChange={handleChange}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Initial observations..." style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
