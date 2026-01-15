import React from 'react';
import { Terminal, User, Shield } from 'lucide-react';
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
  return (
    <div className="min-h-screen bg-neutral-100 text-neo-black font-sans selection:bg-neo-black selection:text-neo-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white border-b-4 border-neo-black px-4 py-3 flex justify-between items-center">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="bg-neo-black text-white p-2 border-2 border-transparent group-hover:bg-neo-red transition-colors">
            <Logo size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">
            AuthAI<span className="text-neo-red">.pro</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <button
              onClick={() => onNavigate('home')}
              className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 ${currentView === 'home' ? 'underline' : ''}`}
            >
              Scan
            </button>
            <button
              onClick={() => onNavigate('verify')}
              className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 ${currentView === 'verify' ? 'underline' : ''}`}
            >
              Verify
            </button>

            {/* Authenticated Links */}
            {user?.isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 text-neo-red flex items-center gap-1 ${currentView === 'admin' ? 'underline' : ''}`}
              >
                <Shield size={14} /> Dashboard
              </button>
            )}

            {user && !user.isAdmin && (
              <button
                onClick={() => onNavigate('profile')}
                className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 flex items-center gap-1 ${currentView === 'profile' ? 'underline' : ''}`}
              >
                <User size={14} /> Profile
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 font-mono text-sm border-2 border-neo-black px-3 py-1 bg-neo-grey shadow-neo-sm">
            <Terminal size={14} />
            <span>SYS: ONLINE</span>
          </div>

          <div className="font-bold border-2 border-neo-black px-4 py-2 bg-neo-yellow shadow-neo-hover text-sm">
            CREDITS: {credits}
          </div>

          {/* Login Button Desktop */}
          {!user ? (
            <button
              onClick={onLoginClick}
              className="hidden md:block bg-neo-black text-white px-4 py-2 font-bold uppercase hover:bg-neo-red transition-colors"
            >
              Sign In
            </button>
          ) : null}
        </div>


      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-neo-black bg-white mt-12 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="font-black text-xl mb-4">AUTH_AUTHORITY</h2>
            <p className="font-mono text-sm opacity-70">
              Global standard for AI forensics and digital provenance.
              ISO 27001 Compliant.
            </p>
          </div>
          <div className="font-mono text-sm space-y-2 flex flex-col items-start">
            <p className="font-bold mb-2">LEGAL</p>
            <button
              onClick={() => onNavigate('eu-compliance')}
              className="hover:underline decoration-2 underline-offset-4 text-left"
            >
              EU AI Act Compliance
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:underline decoration-2 underline-offset-4 text-left"
            >
              Terms of Forensic Service
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:underline decoration-2 underline-offset-4 text-left"
            >
              Privacy Protocol
            </button>
          </div>
          <div className="font-mono text-sm">
            <p className="mb-2 text-xs text-gray-500">SYSTEM ID: NODE_882_ALPHA</p>
            <p className="text-xs text-gray-500">© 2024 AuthAI.pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;