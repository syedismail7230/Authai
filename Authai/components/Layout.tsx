import React, { useState } from 'react';
import { Terminal, User, Shield, Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export interface UserState {
  email: string;
  isAdmin: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  credits: number;
  currentView: string;
  user: UserState | null;
  onNavigate: (view: 'home' | 'verify' | 'admin' | 'profile' | 'eu-compliance' | 'terms' | 'privacy') => void;
  onLoginClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, credits, currentView, user, onNavigate, onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: any) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-black font-sans selection:bg-neo-black selection:text-neo-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white border-b-4 border-black px-4 py-3 flex justify-between items-center shadow-neo-sm">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-black text-white p-2 border-2 border-transparent group-hover:bg-neo-red transition-colors">
            <Logo size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            AuthAI<span className="text-neo-red">.pro</span>
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-6 mr-6">
            {['home', 'verify'].map((view) => (
              <button
                key={view}
                onClick={() => onNavigate(view as any)}
                className={`font-bold text-sm uppercase hover:text-neo-red transition-colors ${currentView === view ? 'border-b-4 border-black' : ''}`}
              >
                {view === 'home' ? 'Scan' : 'Verify'}
              </button>
            ))}

            {user?.isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`font-bold text-sm uppercase hover:text-neo-red flex items-center gap-1 ${currentView === 'admin' ? 'border-b-4 border-black' : ''}`}
              >
                <Shield size={14} /> Dashboard
              </button>
            )}

            {user && !user.isAdmin && (
              <button
                onClick={() => onNavigate('profile')}
                className={`font-bold text-sm uppercase hover:text-neo-red flex items-center gap-1 ${currentView === 'profile' ? 'border-b-4 border-black' : ''}`}
              >
                <User size={14} /> Profile
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-sm border-2 border-black px-3 py-1 bg-gray-100">
            <Terminal size={14} />
            <span className="animate-pulse text-neo-green">●</span>
            <span>SYS: ONLINE</span>
          </div>

          <div className="font-bold border-2 border-black px-4 py-2 bg-neo-yellow shadow-neo-sm text-sm">
            CREDITS: {credits}
          </div>

          {!user ? (
            <button
              onClick={onLoginClick}
              className="neo-btn-primary py-2 px-4 text-sm"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => onNavigate('profile')} // Clicking user button goes to profile
              className="bg-black text-white p-2 hover:bg-neo-red transition-colors border-2 border-black"
            >
              <User size={20} />
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 border-2 border-black hover:bg-gray-100 active:bg-black active:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-[300px] h-full bg-white border-l-4 border-black shadow-neo flex flex-col p-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 border-2 border-black hover:bg-neo-red hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <button onClick={() => handleMobileNav('home')} className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 group">
                <span className="font-bold uppercase">Scan Content</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button onClick={() => handleMobileNav('verify')} className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 group">
                <span className="font-bold uppercase">Verify Certificate</span>
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {user && (
                <button onClick={() => handleMobileNav('profile')} className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 group">
                  <span className="font-bold uppercase">My Profile</span>
                  <User size={16} />
                </button>
              )}
            </div>

            <div className="mt-auto pt-6 border-t-4 border-black">
              {!user ? (
                <button
                  onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                  className="w-full neo-btn-primary justify-center"
                >
                  Sign In
                </button>
              ) : (
                <div className="text-center font-mono text-sm opacity-60">
                  Logged in as {user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-[80vh]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white mt-12 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-black text-xl mb-4">AUTH_AUTHORITY</h2>
            <p className="font-mono text-sm opacity-70 leading-relaxed">
              Global standard for AI forensics and digital provenance.<br />
              ISO 27001 Compliant Node.
            </p>
          </div>
          <div className="font-mono text-sm space-y-3 flex flex-col items-start">
            <p className="font-black mb-2 uppercase tracking-wide border-b-2 border-black pb-1">Legal Protocols</p>
            <button onClick={() => onNavigate('eu-compliance')} className="hover:text-neo-red hover:translate-x-1 transition-transform flex items-center gap-1">
              <ArrowRight size={12} /> EU AI Act Compliance
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-neo-red hover:translate-x-1 transition-transform flex items-center gap-1">
              <ArrowRight size={12} /> Terms of Forensic Service
            </button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-neo-red hover:translate-x-1 transition-transform flex items-center gap-1">
              <ArrowRight size={12} /> Privacy Protocol
            </button>
          </div>
          <div className="font-mono text-sm flex flex-col justify-end">
            <div className="border-2 border-black p-3 bg-gray-50 mb-4 inline-block">
              <p className="text-xs text-gray-500 mb-1">SYSTEM ID</p>
              <p className="font-bold">NODE_882_ALPHA</p>
            </div>
            <p className="text-xs text-gray-400">© 2024 AuthAI.pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;