import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        email: '',
        phone: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = await login(formData.username, formData.password);
            if (res.success) {
                navigate('/');
            } else {
                setError(res.error);
            }
        } else {
            // Registration Validation
            if (formData.password.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            const res = await register({
                username: formData.username,
                password: formData.password,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob
            });

            if (res.success) {
                setIsLogin(true);
                setError('Registration successful. Please login.');
                setFormData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                    email: '',
                    phone: '',
                    dob: ''
                });
            } else {
                setError(res.error);
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: isLogin ? '400px' : '500px' }}>
                <h2 className="login-title">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><UserCheck size={18} /></span>
                                    <input required type="text" name="fullName" className="login-input" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <div className="input-wrapper">
                                    <span className="input-icon"><Mail size={18} /></span>
                                    <input required type="email" name="email" className="login-input" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon"><Phone size={18} /></span>
                                        <input required type="tel" name="phone" className="login-input" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon"><Calendar size={18} /></span>
                                        <input required type="date" name="dob" className="login-input" value={formData.dob} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><User size={18} /></span>
                            <input required type="text" name="username" className="login-input" placeholder="Username" value={formData.username} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon"><Lock size={18} /></span>
                            <input required type="password" name="password" className="login-input" placeholder="Password (min 8 chars)" value={formData.password} onChange={handleChange} />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon"><Lock size={18} /></span>
                                <input required type="password" name="confirmPassword" className="login-input" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <button
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="toggle-btn"
                >
                    {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>
            </div>
        </div>
    );
};

export default Login;
