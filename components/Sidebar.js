"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  KanbanSquare, 
  Send, 
  Settings,
  Hexagon,
  Sparkles
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/' },
    { label: 'Leads', icon: Users, path: '/leads' },
    { label: 'Prospecting', icon: Sparkles, path: '/prospecting' },
    { label: 'Pipeline', icon: KanbanSquare, path: '/pipeline' },
    { label: 'Outreach', icon: Send, path: '/outreach' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Hexagon className="logo-icon" size={24} />
        <span className="logo-text">J5 Sales OS</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-mini">
          <div className="avatar">JD</div>
          <div className="user-details">
            <span className="user-name">John Doe</span>
            <span className="user-role">Sales Rep</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
