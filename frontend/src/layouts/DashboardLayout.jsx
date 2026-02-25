import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Tags,
    BarChart3,
    Users,
    ArrowRightLeft,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Box,
    Settings
} from 'lucide-react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, role = 'admin', isSpecificView = false }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, roles: ['admin'] },
        { name: 'Dashboard', path: '/personal', icon: LayoutDashboard, roles: ['personal', 'maestro', 'jefe', 'estudiante'] },
        { name: 'Productos', path: '/products', icon: Package, roles: ['admin', 'personal', 'maestro', 'jefe', 'estudiante'] },
        { name: 'Categorias', path: '/categories', icon: Tags, roles: ['admin', 'personal', 'maestro', 'jefe', 'estudiante'] },
        { name: 'Reporte', path: '/reports', icon: BarChart3, roles: ['admin', 'personal', 'maestro', 'jefe', 'estudiante'] },
        { name: 'Personal', path: '/staff', icon: Users, roles: ['admin'] },
        { name: 'Movimientos', path: '/movements', icon: ArrowRightLeft, roles: ['admin', 'personal', 'maestro', 'jefe', 'estudiante'] },
        { name: 'Configuracion', path: '/settings', icon: Settings, roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item => {
        // Si estamos en vista específica (dentro de un inventario), 
        // filtramos como si el rol fuera personal para todos.
        if (isSpecificView) {
            return item.roles.includes('personal') || item.roles.includes('estudiante') || item.roles.includes('jefe') || item.roles.includes('maestro');
        }
        return item.roles.includes(role);
    });

    return (
        <div className="dashboard-container">
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-box">
                        <Box size={32} color="#f38d31" />
                    </div>
                    {!collapsed && (
                        <div className="brand-info">
                            <span className="brand-name">InvenTrack</span>
                            <span className="brand-tagline">Sistema de gestion</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={22} className="nav-icon" />
                            {!collapsed && <span className="nav-text">{item.name}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-link logout-btn" onClick={handleLogout}>
                        <LogOut size={22} className="nav-icon" />
                        {!collapsed && <span className="nav-text">Salir</span>}
                    </button>

                    <button className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
