"use client";

import { useRouter } from 'next/navigation';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './LeadTable.css';

export default function LeadTable({ leads }) {
  const router = useRouter();

  const handleRowClick = (id) => {
    router.push(`/leads/${id}`);
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="panel empty-state">
        <p className="text-muted">No leads found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="panel table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Niche</th>
            <th>Opportunity</th>
            <th>Pipeline Stage</th>
            <th>Last Activity</th>
            <th width="50"></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} onClick={() => handleRowClick(lead.id)} className="clickable-row">
              <td>
                <div className="company-cell">
                  <strong>{lead.companyName}</strong>
                  {lead.website && (
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="website-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      <span className="sr-only">{lead.website}</span>
                    </a>
                  )}
                </div>
              </td>
              <td>
                <div className="contact-cell">
                  <span>{lead.contactName}</span>
                  <span className="text-muted small">{lead.email}</span>
                </div>
              </td>
              <td>
                <span className="niche-badge">{lead.niche}</span>
              </td>
              <td>
                <StatusBadge status={lead.opportunityLevel} />
              </td>
              <td>
                <StatusBadge status={lead.stage} />
              </td>
              <td>
                <span className="text-muted">
                  {new Date(lead.lastActivityAt).toLocaleDateString()}
                </span>
              </td>
              <td>
                <button className="icon-btn" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
