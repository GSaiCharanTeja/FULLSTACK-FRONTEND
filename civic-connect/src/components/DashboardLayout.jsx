import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, navLinks, activeSection, onSectionChange, headerTitle, notifCount = 0 }) {
    const { currentUser, logout } = useAuth();

    if (!currentUser) return null;

    return (
        <div className="app-layout">
            <aside className="sidebar" id="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-mark">
                        <div className="logo-icon">🏛️</div>
                        <div>
                            <span className="logo-text">CivicConnect</span>
                            <span className="logo-role-badge" id="sidebar-constituency">

                                {currentUser.constituency || (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1))}

                                {currentUser.constituency || (currentUser.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : 'User')}
                            </span>
                        </div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navLinks.map((link, idx) => {
                        if (link.type === 'label') {
                            return <span key={idx} className="nav-section-label">{link.label}</span>;
                        }
                        return (
                            <a
                                key={idx}
                                href="#"
                                className={activeSection === link.id ? 'active' : ''}
                                onClick={(e) => { e.preventDefault(); onSectionChange(link.id); }}
                            >
                                <span className="nav-icon">{link.icon}</span> {link.label}
                                {link.badge !== undefined && (
                                    <span className="nav-badge" id={`badge-${link.id}`}>{link.badge}</span>
                                )}
                            </a>
                        );
                    })}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info-card">
                        <div className="user-avatar" id="user-avatar">
                            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <div className="user-name" id="user-name">{currentUser.name || 'Loading...'}</div>
                            

                            <div className="user-role" style={{ textTransform: 'capitalize' }}>{currentUser.role || "User"}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>🚪 Sign Out</button>
                </div>
            </aside>

            <div className="main-content">
                <header className="topbar">
                    <span className="topbar-title" id="topbar-title">{headerTitle}</span>
                    <button className="notification-btn" onClick={() => onSectionChange('feed')}>
                        📰 {notifCount > 0 && <span id="notif-count" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginLeft: '4px' }}>{notifCount}</span>}
                        {notifCount > 0 && <div className="notif-dot"></div>}
                    </button>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
