import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuthStore } from '../lib/store/authStore';
import { useVerificationStore } from '../lib/store/verificationStore';

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { verifications } = useVerificationStore();
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

  const stats = {
    totalVerifications: verifications.length,
    aiDetected: verifications.filter(v => v.classification === 'Fully AI-Generated').length,
    humanCreated: verifications.filter(v => v.classification === 'Human-Created').length,
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
          <a onClick={() => router.push('/dashboard')} className="border-b-2 border-black cursor-pointer">DASHBOARD</a>
          {user?.role === 'admin' && (
             <a onClick={() => router.push('/admin')} className="hover:underline cursor-pointer text-red-600">ADMIN</a>
          )}
          <div className="border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] bg-white text-xs font-mono uppercase font-bold">
            &gt;_ SYS: ONLINE
          </div>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="hover:underline cursor-pointer uppercase font-bold">SIGN OUT</button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto py-12 px-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter">NODE_DASHBOARD</h1>
            <div className="bg-black text-white px-4 py-2 font-mono text-sm tracking-widest font-bold border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
                USR: {user?.name?.toUpperCase()}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2">CREDIT_BALANCE</p>
                <p className="text-4xl font-black">₹{user?.wallet}</p>
                <div className="mt-4 border-t-2 border-black pt-2 font-mono text-xs text-gray-500">
                    &gt; {Math.floor((user?.wallet || 0) / 19)} SCANS AVAILABLE
                </div>
            </div>
            <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2">TOTAL_SCANS</p>
                <p className="text-4xl font-black">{stats.totalVerifications}</p>
            </div>
            <div className="bg-[#ffdddd] border-4 border-black shadow-[8px_8px_0_0_#000] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2">SYNTHETIC_DETECTED</p>
                <p className="text-4xl font-black text-red-600">{stats.aiDetected}</p>
            </div>
            <div className="bg-[#ddffdd] border-4 border-black shadow-[8px_8px_0_0_#000] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2">NATURAL_DETECTED</p>
                <p className="text-4xl font-black text-green-700">{stats.humanCreated}</p>
            </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_0_#000] mb-12">
            <div className="border-b-4 border-black p-4 bg-[#f9f9f9]">
                <h2 className="font-black uppercase tracking-widest text-xl">RECENT_LOGS</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-4 border-black font-mono text-xs uppercase bg-[#f3f4f6]">
                            <th className="p-4 border-r-2 border-black w-24">DATE</th>
                            <th className="p-4 border-r-2 border-black w-24">TYPE</th>
                            <th className="p-4 border-r-2 border-black">CLASSIFICATION</th>
                            <th className="p-4 w-24">SCORE</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {verifications.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500 font-bold tracking-widest">
                                    &gt; NO_DATA_AVAILABLE
                                </td>
                            </tr>
                        ) : (
                            verifications.map((v) => (
                                <tr key={v.id} className="border-b-2 border-gray-200 hover:bg-[#f9f9f9] transition-colors">
                                    <td className="p-4 border-r-2 border-gray-200">{new Date(v.timestamp).toLocaleDateString()}</td>
                                    <td className="p-4 border-r-2 border-gray-200 uppercase font-black">{v.type}</td>
                                    <td className="p-4 border-r-2 border-gray-200 font-bold">{v.classification}</td>
                                    <td className="p-4 font-black">{v.aiScore}%</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${user?.role === 'admin' ? '4' : '3'} gap-6`}>
            <Link href="/verify" className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all flex flex-col items-center justify-center text-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔍</span>
                <span className="font-black uppercase tracking-widest">NEW_SCAN</span>
            </Link>
            <Link href="/settings" className="bg-white text-black p-6 border-4 border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all flex flex-col items-center justify-center text-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚙️</span>
                <span className="font-black uppercase tracking-widest">SYS_CONFIG</span>
            </Link>
            <Link href="/referrals" className="bg-white text-black p-6 border-4 border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all flex flex-col items-center justify-center text-center group">
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎁</span>
                <span className="font-black uppercase tracking-widest">PORTAL_INVITES</span>
            </Link>
            {user?.role === 'admin' && (
                <Link href="/admin" className="bg-[#ff6b6b] text-black p-6 border-4 border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all flex flex-col items-center justify-center text-center group">
                    <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🛠</span>
                    <span className="font-black uppercase tracking-widest">ROOT_CONSOLE</span>
                </Link>
            )}
        </div>
      </main>
    </div>
  );
}
