import React from 'react';
import { Building2, FileBarChart } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Building2 size={32} />
            <h1>Vendor Procurement System</h1>
          </div>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <FileBarChart size={20} />
              <span>Procurement item by vendor</span>
            </div>
          </nav>
        </aside>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;