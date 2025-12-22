import React, { useState } from 'react';
import { Lock, User, Key, X, ShieldAlert } from 'lucide-react';
import { loginUser } from '../services/geminiService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, isAdmin: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const data = await loginUser(email, password);
        onLogin(data.user.email, data.user.isAdmin);
        onClose();
    } catch (err) {
        setError('ACCESS DENIED: Invalid credentials or connection refused.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-neo-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border-4 border-neo-black shadow-neo w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 hover:bg-neo-red hover:text-white border-2 border-transparent p-1 transition-colors">
            <X size={24} />
        </button>

        <div className="bg-neo-black text-white p-6 border-b-4 border-neo-black">
            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Lock size={24} /> SECURE LOGIN
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-1">IDENTITY VERIFICATION REQUIRED</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
                <div className="bg-neo-red/10 border-l-4 border-neo-red p-3 flex items-start gap-2 text-neo-red text-sm font-bold animate-pulse">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label className="font-bold text-sm">USER_ID / EMAIL</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-neo-grey border-2 border-neo-black p-3 pl-10 font-mono focus:outline-none focus:ring-2 focus:ring-neo-black"
                        placeholder="ENTER IDENTIFIER"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-bold text-sm">ACCESS_KEY / PASSWORD</label>
                <div className="relative">
                    <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-neo-grey border-2 border-neo-black p-3 pl-10 font-mono focus:outline-none focus:ring-2 focus:ring-neo-black"
                        placeholder="ENTER KEY"
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-neo-black text-white py-4 font-black uppercase tracking-wider hover:bg-neo-green hover:text-neo-black border-2 border-transparent hover:border-neo-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] hover:shadow-none translate-y-0 hover:translate-y-1"
            >
                {loading ? 'AUTHENTICATING...' : 'ESTABLISH SESSION'}
            </button>
        </form>
        
        <div className="p-4 bg-neo-grey border-t-4 border-neo-black text-center">
            <p className="font-mono text-[10px] text-gray-500">AUTHORIZED PERSONNEL ONLY. ALL ATTEMPTS LOGGED.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;