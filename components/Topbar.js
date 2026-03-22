"use client";

import { Search, Bell, Menu } from 'lucide-react';
import './Topbar.css';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-menu-btn">
          <Menu size={20} />
        </button>
        
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search leads, companies, or contacts..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="topbar-right">
        <div className="role-badge">
          Admin View
        </div>
        
        <button className="icon-btn relative">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>
      </div>
    </header>
  );
}
