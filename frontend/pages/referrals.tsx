import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store/authStore';
import Link from 'next/link';

export default function Referrals() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return (
    <div className="flex h-screen items-center justify-center font-mono uppercase font-bold tracking-widest bg-white text-black">
      LOADING_SYSTEM...
    </div>
  );

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${user?.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            🎁 PORTAL_INVITES
        </h1>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#000] p-8 mb-12">
          <h2 className="text-2xl font-black mb-4 uppercase tracking-widest">NETWORK_EXPANSION</h2>
          <p className="font-mono text-sm font-bold uppercase tracking-widest text-gray-700 mb-8 pb-4 border-b-4 border-black">
            &gt; TRANSMIT REFERRAL SIGNAL. RECEIVE ₹19 (1 SCAN CREDIT) PER ACQUISITION.
          </p>

          <div className="bg-[#f9f9f9] border-4 border-black p-6 mb-8 relative">
            <p className="font-mono text-xs font-black uppercase tracking-widest mb-2">SYSTEM_REFERRAL_URL</p>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 p-4 border-2 border-black bg-white font-mono text-sm focus:outline-none"
              />
              <button
                onClick={copyToClipboard}
                className={`px-8 py-4 border-4 border-black font-black uppercase tracking-widest transition-colors shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] ${
                    copied ? 'bg-[#ddffdd] text-green-900' : 'bg-[#ff6b6b] text-white hover:bg-[#ff5252]'
                }`}
              >
                {copied ? '[ COPIED_TO_CLIPBOARD ]' : 'COPY_SIGNAL'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black text-white p-6 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]">
              <p className="font-mono text-xs font-black uppercase tracking-widest mb-2 text-gray-400">ASSIGNED_NODE_ID</p>
              <p className="text-3xl font-black font-mono">{user?.referralCode}</p>
            </div>
            <div className="bg-white text-black p-6 border-4 border-black shadow-[6px_6px_0_0_#000]">
              <p className="font-mono text-xs font-black uppercase tracking-widest mb-2 text-gray-500">ACTIVE_ACQUISITIONS</p>
              <p className="text-3xl font-black font-mono">0.0_CALC</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#000] p-8">
          <h3 className="text-2xl font-black mb-6 uppercase tracking-widest border-b-4 border-black pb-4">ACQUISITION_PROTOCOL</h3>
          <ol className="space-y-6 font-mono text-sm font-bold uppercase tracking-widest">
            <li className="flex gap-4 items-center">
              <span className="flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center font-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">1</span>
              <span>BROADCAST YOUR REFERRAL SIGNAL TO EXTERNAL NODES</span>
            </li>
            <li className="flex gap-4 items-center">
              <span className="flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center font-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">2</span>
              <span>NODE ENTERS SYSTEM VIA YOUR SIGNAL</span>
            </li>
            <li className="flex gap-4 items-center">
              <span className="flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center font-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">3</span>
              <span>SYNCHRONOUS TRANSFER OF ₹19 CREDITS TO BOTH PARTIES</span>
            </li>
            <li className="flex gap-4 items-center">
              <span className="flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center font-black bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]">4</span>
              <span>CREDITS UTILIZED FOR FORENSIC ANALYSIS</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}
