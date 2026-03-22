"use client";

import { Mail, Phone, Calendar, User, Briefcase, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import OfferMapper from './OfferMapper';
import './ProspectProfile.css';

export default function ProspectProfile({ lead, activeTab }) {
  
  if (activeTab === 'overview') {
    return (
      <div className="profile-grid">
        <div className="panel p-6">
          <h3 className="section-title">Contact Information</h3>
          <div className="info-list">
            <div className="info-item">
              <User size={16} className="text-muted" />
              <div>
                <span className="info-label">Primary Contact</span>
                <span className="info-value">{lead.contactName}</span>
              </div>
            </div>
            <div className="info-item">
              <Mail size={16} className="text-muted" />
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{lead.email}</span>
              </div>
            </div>
            <div className="info-item">
              <Phone size={16} className="text-muted" />
              <div>
                <span className="info-label">Phone</span>
                <span className="info-value">{lead.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <h3 className="section-title">Company Details</h3>
          <div className="info-list">
            <div className="info-item">
              <Briefcase size={16} className="text-muted" />
              <div>
                <span className="info-label">Category</span>
                <span className="info-value">{lead.businessCategory}</span>
              </div>
            </div>
            <div className="info-item">
              <FileText size={16} className="text-muted" />
              <div>
                <span className="info-label">Lead Source</span>
                <span className="info-value">{lead.leadSource}</span>
              </div>
            </div>
            <div className="info-item">
              <Calendar size={16} className="text-muted" />
              <div>
                <span className="info-label">Added On</span>
                <span className="info-value">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'analysis') {
    const defaultCategories = ['websiteQuality', 'bookingFlow', 'productDisplay', 'contactFlow', 'customerAcquisition'];
    const analysis = lead.analysis || {};

    return (
      <div className="panel p-6">
        <div className="header-row">
          <div>
            <h3 className="section-title" style={{ marginBottom: '4px' }}>Business Weakness Audit</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Diagnosed pain points to focus on in outreach.</p>
          </div>
          <button className="btn btn-secondary">Edit Audit</button>
        </div>
        
        <div className="audit-list">
          {defaultCategories.map(cat => {
            const data = analysis[cat];
            const label = cat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            if (!data) return null;

            return (
              <div key={cat} className={`audit-item rating-${data.rating}`}>
                <div className="audit-icon">
                  {data.rating === 'poor' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <h4>{label}</h4>
                    <span className={`audit-badge bg-${data.rating}`}>{data.rating}</span>
                  </div>
                  <p>{data.notes}</p>
                </div>
              </div>
            );
          })}

          {Object.keys(analysis).length === 0 && (
            <div className="empty-state">
              <p className="text-muted">No analysis performed yet. Conduct an audit to find outreach angles.</p>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Start Audit</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'outreach') {
    return (
      <div className="panel empty-state">
        <Mail size={32} className="text-muted" style={{ marginBottom: 'var(--space-4)' }} />
        <h3>No Outreach Yet</h3>
        <p className="text-muted" style={{ maxWidth: '400px', margin: 'var(--space-2) auto var(--space-6)' }}>
          Generate a personalized email sequence using the LLM engine based on the weakness audit.
        </p>
        <button className="btn btn-primary">Generate Outreach</button>
      </div>
    );
  }

  if (activeTab === 'notes') {
    return (
      <div className="panel p-6">
        <h3 className="section-title">Internal Notes & History</h3>
        <div className="notes-container">
          {lead.notes ? (
            <div className="note-card">
              <div className="note-header">
                <span className="note-author">System</span>
                <span className="note-date">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="note-body">{lead.notes}</p>
            </div>
          ) : (
            <p className="text-muted">No notes yet.</p>
          )}
          
          <div className="add-note-box" style={{ marginTop: 'var(--space-6)' }}>
            <textarea placeholder="Type a note..." rows={3} style={{ width: '100%', marginBottom: 'var(--space-3)' }}></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary">Add Note</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'offer') {
    return <OfferMapper lead={lead} />;
  }

  return null;
}
