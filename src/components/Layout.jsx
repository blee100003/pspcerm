import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, FileText, CheckCircle2, LogOut, FolderKanban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();


    const handleLogout = () => {
        localStorage.removeItem('plansculpt_auth'); // Legacy cleanup
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Hard reload to clear state
    };

    const getPageTitle = () => {
        switch (location.pathname.split('/')[1]) {
            case 'dashboard': return 'Dashboard';
            case 'hr': return 'HR Management';
            case 'finance': return 'Financial Management';
            case 'invoicing': return 'Invoicing';
            case 'users': return 'User Management';
            case 'projects': return 'Projects';
            default: return 'Plansculpt ERM';
        }
    };



    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="brand">
                        <CheckCircle2 size={28} className="brand-icon" />
                        <span>Plansculpt</span>
                    </div>
                </div>

                <nav className="nav-links">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/hr" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>HR Management</span>
                    </NavLink>

                    <NavLink to="/finance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CreditCard size={20} />
                        <span>Finance</span>
                    </NavLink>

                    <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FolderKanban size={20} />
                        <span>Projects</span>
                    </NavLink>

                    <NavLink to="/invoicing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Invoicing</span>
                    </NavLink>

                    {user?.role === 'admin' && (
                        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Users size={20} />
                            <span>Users</span>
                        </NavLink>
                    )}

                    <button onClick={handleLogout} className="nav-item" style={{ marginTop: 'auto', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem', fontFamily: 'inherit' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            <div className="main-content">
                <header className="top-header">
                    <h2 className="page-title">{getPageTitle()}</h2>



                    <div className="user-profile">
                        <span style={{ marginRight: '10px', fontSize: '14px', color: '#666' }}>
                            {user?.username} ({user?.role})
                        </span>
                    </div>
                </header>

                <main className="content-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
