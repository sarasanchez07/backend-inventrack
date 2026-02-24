import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import './AuthPages.css';
import { Mail, Lock, Loader2 } from 'lucide-react';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await authService.login(email, password);
            login(data.user);

            // Redirigir según el rol real devuelto por el backend
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/personal');
            }
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Credenciales incorrectas. Verifique e intente de nuevo.';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Iniciar Sesión">
            <form className="auth-form" onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                        type="email"
                        placeholder="cliente@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Iniciando...
                        </>
                    ) : (
                        'Inicio Sesión'
                    )}
                </button>

                <div className="auth-footer">
                    <Link to="/forgot-password">¿Olvidó su Contraseña?</Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
