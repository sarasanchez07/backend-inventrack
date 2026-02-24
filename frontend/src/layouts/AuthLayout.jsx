import React from 'react';
import './AuthLayout.css';
import patternImg from '../assets/pattern.png';
import logoImg from '../assets/logo.png';

const AuthLayout = ({ children, title }) => {
    return (
        <div className="auth-container">
            <div className="auth-sidebar" style={{ backgroundImage: `url(${patternImg})` }}>
                <div className="auth-sidebar-overlay">
                    <div className="auth-brand">
                        <img src={logoImg} alt="InvenTrack Logo" className="auth-logo" />
                        <h1 className="auth-app-name">InvenTrack</h1>
                        <p className="auth-subtitle">Bienvenidos a InvenTrack</p>
                    </div>
                </div>
            </div>
            <div className="auth-content">
                <div className="auth-card">
                    <h2 className="auth-form-title">{title}</h2>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
