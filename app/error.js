"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: '16px',
      fontFamily: 'Inter, sans-serif', color: '#f3f4f6',
    }}>
      <div style={{
        padding: '12px 16px', borderRadius: '8px',
        backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
        maxWidth: '500px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Something went wrong</h2>
        <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '16px' }}>{error?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          style={{
            padding: '8px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem',
            backgroundColor: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
