"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, Building, Calendar, Edit3 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ProspectProfile from '@/components/ProspectProfile';
import AddLeadModal from '@/components/AddLeadModal';

export default function LeadDetailPage({ params }) {
  const resolvedParams = use(params);
  const leadId = resolvedParams.id;
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch('/api/leads/' + leadId);
        if (res.ok) {
          setLead(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch lead:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLead();
  }, [leadId]);

  if (loading) {
    return <div className="panel" style={{ padding: 'var(--space-8)', textAlign: 'center' }}><p className="text-muted">Loading lead...</p></div>;
  }

  if (!lead) {
    notFound();
  }

  return (
    <div className="lead-detail-page">
      <div className="breadcrumb">
        <Link href="/leads" className="btn btn-ghost" style={{ padding: '0', marginBottom: 'var(--space-4)' }}>
          <ArrowLeft size={16} />
          Back to Leads
        </Link>
      </div>

      <div className="header-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <h1>{lead.companyName}</h1>
            <StatusBadge status={lead.stage} />
            <StatusBadge status={lead.opportunityLevel} />
          </div>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><Building size={14} /> {lead.niche}</span>
            {lead.location && <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}><MapPin size={14} /> {lead.location}</span>}
            {lead.website && (
              <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--accent-primary)' }}>
                <ExternalLink size={14} /> Website
              </a>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>
            <Edit3 size={16} /> Edit Lead
          </button>
        </div>
      </div>

      <div className="tabs-container" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-6)' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'analysis', label: 'Business Analysis' },
          { id: 'outreach', label: 'Outreach' },
          { id: 'notes', label: 'Notes' },
          { id: 'offer', label: 'Offer Mapping' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: 'var(--space-3) 0',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === tab.id ? '600' : '500',
              backgroundColor: 'transparent',
              fontSize: '0.875rem',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ProspectProfile lead={lead} activeTab={activeTab} />

      <AddLeadModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        editLead={lead}
        onLeadAdded={(updated) => setLead(updated)}
      />
    </div>
  );
}
