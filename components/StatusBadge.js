export default function StatusBadge({ status }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'New Lead':
        return { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' };
      case 'Researched':
        return { bg: 'var(--accent-primary-alpha)', color: 'var(--accent-primary)' };
      case 'Outreach Sent':
        return { bg: 'var(--accent-indigo-alpha)', color: 'var(--accent-indigo)' };
      case 'Replied':
        return { bg: 'var(--accent-cyan-alpha)', color: 'var(--accent-cyan)' };
      case 'Qualified':
        return { bg: 'var(--accent-warning-alpha)', color: 'var(--accent-warning)' };
      case 'Booked':
      case 'Closed Won':
        return { bg: 'var(--accent-success-alpha)', color: 'var(--accent-success)' };
      case 'Proposal Sent':
        return { bg: 'var(--accent-purple-alpha)', color: 'var(--accent-purple)' };
      case 'Closed Lost':
        return { bg: 'var(--accent-danger-alpha)', color: 'var(--accent-danger)' };
      default:
        // Also handle opportunity levels: low, medium, high, critical
        if (status === 'critical') return { bg: 'var(--accent-danger-alpha)', color: 'var(--accent-danger)' };
        if (status === 'high') return { bg: 'var(--accent-warning-alpha)', color: 'var(--accent-warning)' };
        if (status === 'medium') return { bg: 'var(--accent-primary-alpha)', color: 'var(--accent-primary)' };
        if (status === 'low') return { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' };
        
        return { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' };
    }
  };

  const style = getBadgeStyle(status);

  return (
    <span 
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        border: `1px solid ${style.color}`,
        opacity: 0.9
      }}
    >
      {status}
    </span>
  );
}
