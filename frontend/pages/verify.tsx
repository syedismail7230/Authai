import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../lib/store/authStore';
import ChatInterface from '../components/ChatInterface';

export default function VerifyPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  // We allow viewing the page, but interacting requires auth handled in ChatInterface

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-black selection:bg-black selection:text-white">
      {/* Brutalist Navbar */}
      <nav className="w-full bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-sm bg-black text-white">✓</div>
          <span className="font-black text-2xl tracking-tighter uppercase">AUTHAI.PRO</span>
        </div>
        <div className="flex items-center gap-6 font-bold text-sm tracking-wide">
          <a onClick={() => router.push('/verify')} className="border-b-2 border-black cursor-pointer">SCAN</a>
          <a onClick={() => router.push('/dashboard')} className="hover:underline cursor-pointer">DASHBOARD</a>
          {user?.role === 'admin' && (
            <a onClick={() => router.push('/admin')} className="hover:underline cursor-pointer text-red-600">ADMIN</a>
          )}
          <div className="border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] bg-white text-xs font-mono uppercase font-bold">
            &gt;_ SYS: ONLINE
          </div>
          {isAuthenticated && (
            <div className="border-2 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] bg-white text-xs font-mono uppercase font-bold cursor-pointer hover:bg-black hover:text-white transition-colors" onClick={() => router.push('/dashboard')}>
              CREDITS: {Math.floor((user?.wallet || 0) / 19)}
            </div>
          )}
          {isAuthenticated ? (
            <button onClick={() => { logout(); router.push('/auth/login'); }} className="hover:underline cursor-pointer uppercase font-bold">SIGN OUT</button>
          ) : (
            <button onClick={() => router.push('/auth/login')} className="hover:underline cursor-pointer uppercase font-bold">SIGN IN</button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-16 px-4 flex flex-col">
        {/* Header Text */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4">VERIFY AUTHENTICITY</h1>
          <p className="font-mono text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Advanced forensic analysis for Text, Image, Audio, and Video. Detects AI generation patterns using spectral and semantic entropy models.
          </p>
        </div>

        {/* Brutalist Chat Interface Box */}
        <ChatInterface />
      </main>

      {/* Footer */}
      <footer className="w-full border-t-4 border-black bg-[#f3f4f6] px-8 py-12 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-black uppercase mb-4 text-lg">AUTH_AUTHORITY</h3>
            <p className="font-mono text-sm text-gray-700">Global standard for AI forensics and digital provenance. ISO 27001 Compliant.</p>
          </div>
          <div>
            <h3 className="font-black uppercase mb-4 text-lg">LEGAL</h3>
            <ul className="font-mono text-sm text-gray-700 space-y-2">
              <li>EU AI Act Compliance</li>
              <li>Terms of Forensic Service</li>
              <li>Privacy Protocol</li>
            </ul>
          </div>
          <div className="text-right font-mono text-xs text-gray-500 flex flex-col justify-end">
            <p className="mb-2">SYSTEM ID: NODE_002_ALPHA</p>
            <p>© 2024 AuthAI.pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
