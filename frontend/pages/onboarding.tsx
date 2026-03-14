import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuthStore } from '../lib/store/authStore';

export default function Onboarding() {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    company: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.isOnboarded) {
      router.push('/verify');
    }
  }, [isAuthenticated, user, router]);

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('NO_TOKEN_FOUND');

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        { ...formData, isOnboarded: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data.user);
      router.push('/verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'FAILED_TO_TRANSMIT_DATA');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.isOnboarded) return (
    <div className="flex h-screen items-center justify-center font-mono uppercase font-bold tracking-widest bg-white">
      LOADING_SYSTEM...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-black selection:bg-black selection:text-white items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-center">AUTHAI.PRO</h1>
        <div className="w-full h-1 bg-black mb-6"></div>
        <p className="font-mono text-sm text-center mb-8 uppercase font-bold">&gt;_ PROFILE_CONFIGURATION</p>

        {error && (
          <div className="mb-6 p-3 border-2 border-black bg-[#ff6b6b] text-white font-mono text-xs font-bold uppercase">
            &gt; ERR: {error}
          </div>
        )}

        <form onSubmit={handleCompleteOnboarding} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_ORGANIZATION</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="&gt; INPUT_CORP_IDENTIFIER"
              className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm placeholder-gray-400 uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_USER_ROLE</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="&gt; INPUT_DESIGNATION"
              className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm placeholder-gray-400 uppercase"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 border-4 border-black bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 text-sm shadow-[4px_4px_0_0_#000] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] mt-6"
          >
            {loading ? 'PROCESSING...' : 'FINALIZE PROFILE'}
          </button>
        </form>
      </div>
    </div>
  );
}
