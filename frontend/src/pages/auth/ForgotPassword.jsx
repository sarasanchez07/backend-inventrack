import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import './AuthPages.css';
import { Mail } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Correo enviado');
    };

    return (
        <AuthLayout title="¿Olvidaste tu contraseña?">
            <p className="auth-description">
                Ingresa tu correo para recibir tu mensaje de recuperación de contraseña y vuelve a gestionar tu inventario.
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="input-label">Correo Electrónico</label>
                <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                    Enviar Correo
                </button>

                <Link to="/login" className="btn btn-outline btn-block mt-3 text-center">
                    Volver a Inicio de Sesión
                </Link>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
