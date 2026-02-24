import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import './AuthPages.css';
import { Lock } from 'lucide-react';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            alert('Contraseña restablecida');
            navigate('/login');
        } else {
            alert('Las contraseñas no coinciden');
        }
    };

    return (
        <AuthLayout title="Restablecer Contraseña">
            <p className="auth-description">
                Crea una nueva contraseña segura para tu cuenta
            </p>
            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="input-label">Nueva Contraseña</label>
                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <label className="input-label">Confirmar Contraseña</label>
                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                    Guardar Contraseña
                </button>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
