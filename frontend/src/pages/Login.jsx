import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isRegistering) {
                if (!companyName.trim()) {
                    throw new Error("Company Name is required");
                }
                // By default, open registration creates Admin users or Tenants.
                await api.post('/auth/register', { email, password, role: 'Admin', tenant_name: companyName.trim() });
            }

            const role = await login(email, password);
            navigate(role === 'Admin' ? '/admin/dashboard' : '/customer/invoices');
        } catch (err) {
            setError(err?.response?.data?.error || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-hero-gradient">

            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-light/60 mix-blend-multiply filter blur-[100px] animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/50 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-100/50 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>

            <div className="relative w-full max-w-md px-6 z-10">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-gradient-to-br from-brand to-brand-dark shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
                        {isRegistering ? 'Create an account' : 'Welcome back'}
                    </h2>
                    <p className="text-lg text-gray-500">
                        {isRegistering ? 'Setup your admin workspace' : 'Sign in to your dashboard'}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
                                <p className="text-sm font-medium text-rose-800">{error.message || error}</p>
                            </div>
                        )}

                        {isRegistering && (
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Company Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="input-field py-3.5 pl-4"
                                        placeholder="Acme Corporation"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11 py-3.5"
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 py-3.5"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {!isRegistering && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-brand hover:text-brand-dark transition-colors">Forgot password?</a>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center">
                                {loading ? 'Processing...' : (isRegistering ? 'Create Admin Account' : 'Sign In')}
                                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">
                            {isRegistering ? "Already have an account?" : "No account yet?"}
                        </span>{' '}
                        <button
                            onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                            className="font-semibold text-brand hover:text-brand-dark transition-colors"
                        >
                            {isRegistering ? "Sign in instead" : "Create one"}
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-gray-500 mt-8 font-medium">
                    Secure Multi-Tenant Architecture © 2026
                </p>
            </div>
        </div>
    );
};

export default Login;
