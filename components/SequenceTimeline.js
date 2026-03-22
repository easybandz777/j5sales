"use client";

import { CheckCircle2, Circle, Clock, Mail, Play, Pause } from 'lucide-react';
import './SequenceTimeline.css';

export default function SequenceTimeline() {
  const steps = [
    { id: 1, type: 'email', title: 'First Touchpoint', status: 'sent', date: 'Yesterday, 10:30 AM' },
    { id: 2, type: 'email', title: 'Value Add Follow-up', status: 'pending', date: 'Tomorrow, 9:00 AM', condition: 'If no reply after 2 days' },
    { id: 3, type: 'call', title: 'Manual Review & Call', status: 'upcoming', date: 'TBD', condition: 'If opened 3+ times' },
    { id: 4, type: 'email', title: 'Breakup Message', status: 'upcoming', date: 'TBD', condition: 'If no reply after 7 days' },
  ];

  return (
    <div className="sequence-timeline">
      <div className="sequence-controls">
        <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Pause size={12} style={{ marginRight: '4px' }} /> Pause</button>
        <span className="sequence-status active">Active</span>
      </div>

      <div className="timeline-items mt-6">
        {steps.map((step, index) => (
          <div key={step.id} className={`timeline-item ${step.status}`}>
            <div className="timeline-connector" />
            
            <div className={`timeline-icon ${step.status}`}>
              {step.status === 'sent' ? <CheckCircle2 size={16} /> : 
               step.status === 'pending' ? <Clock size={16} /> : 
               <Circle size={10} />}
            </div>
            
            <div className="timeline-content">
              <div className="timeline-header">
                <strong>{step.title}</strong>
              </div>
              <div className="timeline-meta text-muted">
                {step.type === 'email' ? <Mail size={12} /> : <Phone size={12} />}
                <span>{step.date}</span>
              </div>
              {step.condition && (
                <div className="timeline-condition">
                  {step.condition}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dummy Phone component since it's used above but not imported 
function Phone({ size, ...props }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
