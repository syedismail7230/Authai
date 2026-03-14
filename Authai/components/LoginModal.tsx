import React, { useState } from 'react';
import { Lock, User, Key, X, ShieldAlert, UserPlus, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../services/geminiService';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (email: string, isAdmin: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'LOGIN') {
                const data = await loginUser(email, password);
                onLogin(data.user.email, data.user.role === 'ADMIN');
                onClose();
            } else {
                const data = await registerUser(email, password);
                setSuccessMsg('IDENTITY CREATED. INITIALIZING SESSION...');
                setTimeout(() => {
                    onLogin(data.user.email, data.user.role === 'ADMIN');
                    onClose();
                }, 1000);
            }
        } catch (err: any) {
            setError(err.message || 'ACCESS DENIED');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
        setError('');
        setSuccessMsg('');
    };

    return (
        <div className="neo-modal-overlay">
            <div className="bg-white border-4 border-black shadow-neo w-full max-w-md relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white border-2 border-black hover:bg-neo-red hover:text-white transition-colors p-1 z-10"
                >
                    <X size={24} />
                </button>

                <div className="bg-black text-white p-6 border-b-4 border-black relative check-pattern">
                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        {mode === 'LOGIN' ? <Lock size={28} /> : <UserPlus size={28} />}
                        {mode === 'LOGIN' ? 'SECURE LOGIN' : 'NEW IDENTITY'}
                    </h2>
                    <p className="font-mono text-xs text-neo-green mt-2 opacity-80 flex items-center gap-2">
                        <span className="animate-pulse">●</span>
                        {mode === 'LOGIN' ? 'ENCRYPTED CONNECTION ESTABLISHED' : 'REGISTRATION PROTOCOL ACTIVE'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-neo-red/10 border-4 border-neo-red p-4 flex items-start gap-3 text-neo-red text-sm font-bold font-mono">
                            <ShieldAlert size={20} className="shrink-0" />
                            <span className="uppercase">{error}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="bg-neo-green/10 border-4 border-neo-green p-4 flex items-start gap-3 text-neo-green-dark text-sm font-bold font-mono">
                            <ShieldAlert size={20} className="shrink-0" />
                            <span className="uppercase">{successMsg}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase tracking-wide">User Identifier</label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="neo-input pl-12 bg-gray-50 focus:bg-white"
                                placeholder="ENTER EMAIL ADDRESS"
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100">
                                <User size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-black text-sm uppercase tracking-wide">Access Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="neo-input pl-12 bg-gray-50 focus:bg-white"
                                placeholder="ENTER PASSWORD"
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100">
                                <Key size={18} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full neo-btn-primary py-4 text-lg justify-between group"
                    >
                        <span>{loading ? 'PROCESSING...' : (mode === 'LOGIN' ? 'ESTABLISH SESSION' : 'CREATE PROFILE')}</span>
                        {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                    </button>

                    <div className="text-center pt-4 border-t-2 border-dashed border-gray-300">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm font-bold font-mono uppercase hover:text-neo-red hover:underline decoration-2 underline-offset-4 transition-colors"
                        >
                            {mode === 'LOGIN' ? 'NO IDENTITY FOUND? REGISTER ->' : '<- RETURN TO LOGIN SEQUENCE'}
                        </button>
                    </div>
                </form>

                <div className="p-3 bg-gray-100 border-t-4 border-black text-center">
                    <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                        Node_882 // Authorized Access Only // {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;