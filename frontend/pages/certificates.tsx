import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store/authStore';
import { useVerificationStore } from '../lib/store/verificationStore';

export default function Certificates() {
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
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="hover:underline cursor-pointer uppercase font-bold">SIGN OUT</button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 flex flex-col">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 bg-black text-white inline-block px-4 py-2 self-start border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]">
            📜 ISSUED_CERTIFICATES
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {verifications.length === 0 ? (
            <div className="col-span-full border-4 border-black bg-white p-12 text-center shadow-[12px_12px_0_0_#000]">
              <p className="font-mono text-lg font-bold uppercase tracking-widest text-gray-500">&gt; NO_RECORDS_FOUND_IN_REGISTRY</p>
            </div>
          ) : (
            verifications.map((verification) => (
              <div key={verification.id} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all flex flex-col">
                <div className="mb-6 flex justify-between items-start">
                  <span className="inline-block px-3 py-1 bg-black text-white font-mono text-xs font-bold uppercase tracking-widest border-2 border-black">
                    {verification.type}
                  </span>
                  <span className="font-mono text-xs text-gray-400 font-bold">{new Date(verification.timestamp).toLocaleDateString()}</span>
                </div>
                
                <h3 className="font-black text-xl mb-4 uppercase tracking-tight line-clamp-1" title={verification.id}>
                  CERT_ID: {verification.id.slice(0, 8)}...
                </h3>
                
                <div className="space-y-3 font-mono text-sm mb-8 bg-[#f9f9f9] border-2 border-black p-4">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-500">CLASS:</span> 
                    <span className="font-bold">{verification.classification.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-500">SYS_SCORE:</span> 
                    <span className="font-bold">{verification.aiScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CONFIDENCE:</span> 
                    <span className="font-bold">{verification.confidence}%</span>
                  </div>
                </div>

                <button className="mt-auto w-full px-4 py-3 bg-[#ff6b6b] border-4 border-black font-black uppercase tracking-widest text-sm shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] hover:bg-[#ff5252] transition-all">
                  [ DOWNLOAD_PDF ]
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
