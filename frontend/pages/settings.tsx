import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuthStore } from '../lib/store/authStore';
import Link from 'next/link';

export default function Settings() {
  const { isAuthenticated, user, logout, updateUser } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        role: user.role || '',
      });
    }
  }, [isAuthenticated, user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No token found');

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser(res.data.user);
      setMessage('SYS_CONFIG_UPDATED');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'CONFIG_UPDATE_FAILED');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return (
    <div className="flex h-screen items-center justify-center font-mono uppercase font-bold tracking-widest bg-white text-black">
      LOADING_SYSTEM...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-black selection:bg-black selection:text-white relative">
      <nav className="w-full bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-sm bg-black text-white">✓</div>
          <span className="font-black text-2xl tracking-tighter uppercase">AUTHAI.PRO</span>
        </div>
        <div className="flex items-center gap-6 font-bold text-sm tracking-wide">
          <a onClick={() => router.push('/verify')} className="hover:underline cursor-pointer">SCAN</a>
          <a onClick={() => router.push('/dashboard')} className="hover:underline cursor-pointer">DASHBOARD</a>
          {user?.role === 'admin' && (
             <a onClick={() => router.push('/admin')} className="hover:underline cursor-pointer text-red-600">ADMIN</a>
          )}
          <div className="border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] bg-white text-xs font-mono uppercase font-bold">
            &gt;_ SYS: ONLINE
          </div>
          <div className="border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] bg-white text-xs font-mono uppercase font-bold cursor-pointer hover:bg-black hover:text-white transition-colors" onClick={() => router.push('/dashboard')}>
            CREDITS: {Math.floor((user?.wallet || 0) / 19)}
          </div>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="hover:underline cursor-pointer uppercase font-bold">SIGN OUT</button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto py-12 px-4 flex flex-col">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 bg-black text-white inline-block px-4 py-2 self-start border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]">
            ⚙️ SYS_CONFIG
        </h1>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#000] p-8 mb-12 relative">
          <h2 className="text-2xl font-black mb-6 uppercase tracking-widest border-b-4 border-black pb-4">ID_PROFILES</h2>
          
          {message && (
            <div className={`mb-6 p-4 border-2 border-black font-mono text-sm font-bold uppercase tracking-widest ${message.includes('UPDATED') ? 'bg-[#ddffdd] text-green-800' : 'bg-[#ffdddd] text-red-800'}`}>
              &gt; {message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_USR_EMAIL [LOCKED]</label>
              <input type="email" value={user?.email} disabled className="w-full p-4 border-2 border-black bg-gray-200 font-mono text-sm opacity-70 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_USR_NAME</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm uppercase" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_ORGANIZATION</label>
              <input 
                type="text" 
                value={formData.company} 
                onChange={e => setFormData({...formData, company: e.target.value})} 
                className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm uppercase" 
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2 font-mono">SYS_USER_ROLE</label>
              <input 
                type="text" 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                className="w-full p-4 border-2 border-black bg-[#f9f9f9] focus:outline-none focus:bg-white focus:border-black font-mono text-sm uppercase" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="mt-8 w-full py-4 border-4 border-black bg-black text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 text-sm shadow-[4px_4px_0_0_#000] hover:shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]"
            >
              {loading ? 'PROCESSING...' : 'OVERWRITE CONFIG'}
            </button>
          </form>
        </div>

        <div className="bg-[#ffdddd] border-4 border-black shadow-[12px_12px_0_0_#000] p-8">
          <h2 className="text-2xl font-black mb-6 uppercase tracking-widest border-b-4 border-black pb-4 text-red-900 border-red-900">DANGER_ZONE</h2>
          <p className="font-mono text-sm text-red-800 mb-6 font-bold uppercase tracking-widest">
            &gt; TERMINATING SESSION WILL REQUIRE SYSTEM RE-AUTHENTICATION.
          </p>
          <button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="w-full py-4 border-4 border-red-900 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-[4px_4px_0_0_#7f1d1d] hover:shadow-[4px_4px_0_0_rgba(127,29,29,0.2)]"
          >
            TERMINATE SESSION
          </button>
        </div>
      </main>
    </div>
  );
}
