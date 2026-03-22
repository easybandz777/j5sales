"use client";

import { useState } from 'react';
import { Users, Bot, Key, UserCircle } from 'lucide-react';
import PromptRulesEditor from '@/components/PromptRulesEditor';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('rules');

  const tabs = [
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'rules', label: 'Prompt Engine', icon: Bot },
    { id: 'api', label: 'API Integrations', icon: Key },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <div className="settings-page">
      <div className="header-row">
        <div>
          <h1>Settings</h1>
          <p className="text-muted">Manage your team, LLM prompt rules, and integrations.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--space-8)', alignItems: 'start' }}>
        
        {/* Settings Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === tab.id ? 'var(--bg-hover)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : 'text-muted'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="settings-content">
          {activeTab === 'team' && (
            <div className="panel p-6">
              <h3 className="section-title">Team Management</h3>
              <p className="text-muted" style={{ marginBottom: 'var(--space-4)' }}>Manage sales reps, managers, and admin access.</p>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Name</th>
                    <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Email</th>
                    <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Role</th>
                    <th style={{ padding: 'var(--space-3)', fontWeight: 500 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'John Doe', email: 'john@j5sales.com', role: 'Sales Rep', status: 'Active' },
                    { name: 'Sarah Manager', email: 'sarah@j5sales.com', role: 'Sales Manager', status: 'Active' },
                    { name: 'Admin Guy', email: 'admin@j5sales.com', role: 'Admin', status: 'Active' },
                  ].map((user, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: 'var(--space-4)', fontWeight: 500 }}>{user.name}</td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)' }}>{user.email}</td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span style={{ 
                          backgroundColor: user.role === 'Admin' ? 'var(--accent-purple-alpha)' : 'var(--bg-elevated)', 
                          color: user.role === 'Admin' ? 'var(--accent-purple)' : 'var(--text-primary)',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' 
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}><span style={{ color: 'var(--accent-success)', fontSize: '0.75rem', fontWeight: 600 }}>{user.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'rules' && <PromptRulesEditor />}

          {activeTab === 'api' && (
            <div className="panel p-6">
              <h3 className="section-title">API Integrations</h3>
              
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>LLM Provider (OpenAI)</label>
                <input type="password" defaultValue="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx" className="input" style={{ width: '100%', maxWidth: '400px' }} />
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Used for the Outreach Generator.</p>
              </div>

              <div>
                <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Apollo Data API</label>
                <input type="password" placeholder="Enter API Key" className="input" style={{ width: '100%', maxWidth: '400px' }} />
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px' }}>Used for importing lead data.</p>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="panel p-6">
              <h3 className="section-title">My Profile</h3>
              <p className="text-muted">Personal settings placeholder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
