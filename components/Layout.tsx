import React from 'react';
import { Menu, Terminal, User, Shield } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleNavigate = (view: any) => {
    onNavigate(view);
    closeMenu();
  };

  const handleLogin = () => {
    onLoginClick();
    closeMenu();
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neo-black font-sans selection:bg-neo-black selection:text-neo-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b-4 border-neo-black px-4 py-3 flex justify-between items-center h-16 sm:h-auto transition-all">
        <div
          className="flex items-center gap-3 cursor-pointer group scale-90 sm:scale-100 origin-left"
          onClick={() => handleNavigate('home')}
        >
          <div className="bg-neo-black text-white p-2 border-2 border-transparent group-hover:bg-neo-red transition-colors">
            <Logo size={28} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">
            AuthAI<span className="text-neo-red">.pro</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <button
              onClick={() => handleNavigate('home')}
              className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 ${currentView === 'home' ? 'underline' : ''}`}
            >
              Scan
            </button>
            <button
              onClick={() => handleNavigate('verify')}
              className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 ${currentView === 'verify' ? 'underline' : ''}`}
            >
              Verify
            </button>

            {/* Authenticated Links */}
            {user?.isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 text-neo-red flex items-center gap-1 ${currentView === 'admin' ? 'underline' : ''}`}
              >
                <Shield size={14} /> Dashboard
              </button>
            )}

            {user && !user.isAdmin && (
              <button
                onClick={() => handleNavigate('profile')}
                className={`font-bold text-sm uppercase px-3 py-1 hover:underline decoration-4 underline-offset-4 flex items-center gap-1 ${currentView === 'profile' ? 'underline' : ''}`}
              >
                <User size={14} /> Profile
              </button>
            )}
          </div>

          {/* System Status - Desktop Only */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-sm border-2 border-neo-black px-3 py-1 bg-neo-grey shadow-neo-sm">
            <Terminal size={14} />
            <span>SYS: ONLINE</span>
          </div>

          <div className="hidden sm:block font-bold border-2 border-neo-black px-4 py-2 bg-neo-yellow shadow-neo-hover text-sm">
            CREDITS: {credits}
          </div>

          {/* Login Button - Desktop */}
          {!user ? (
            <button
              onClick={handleLogin}
              className="hidden md:block bg-neo-black text-white px-4 py-2 font-bold uppercase hover:bg-neo-red transition-colors"
            >
              Sign In
            </button>
          ) : null}

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMenu}
            className="p-2 border-2 border-neo-black hover:bg-neo-black hover:text-white transition-colors md:hidden z-50 relative bg-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <div className="font-bold text-xl px-1">✕</div> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-neo-black/90 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMenu}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-white border-l-4 border-neo-black z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 pb-6 shadow-[-10px_0_15px_rgba(0,0,0,0.1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col gap-6">
          <div className="font-bold border-2 border-neo-black px-4 py-3 bg-neo-yellow shadow-neo text-center">
            CREDITS: {credits}
          </div>

          <div className="flex flex-col gap-4 border-t-2 border-b-2 border-neo-grey py-6">
            <button
              onClick={() => handleNavigate('home')}
              className={`text-left text-xl font-black uppercase tracking-tight py-2 ${currentView === 'home' ? 'text-neo-red underline decoration-4' : ''}`}
            >
              Scan Content
            </button>
            <button
              onClick={() => handleNavigate('verify')}
              className={`text-left text-xl font-black uppercase tracking-tight py-2 ${currentView === 'verify' ? 'text-neo-red underline decoration-4' : ''}`}
            >
              Verify Certificate
            </button>
            {user && (
              <button
                onClick={() => handleNavigate(user.isAdmin ? 'admin' : 'profile')}
                className={`text-left text-xl font-black uppercase tracking-tight py-2 ${currentView === 'admin' || currentView === 'profile' ? 'text-neo-red underline decoration-4' : ''}`}
              >
                {user.isAdmin ? 'Admin Dashboard' : 'My Profile'}
              </button>
            )}
          </div>

          <div className="mt-auto">
            {!user ? (
              <button
                onClick={handleLogin}
                className="w-full bg-neo-black text-white px-4 py-4 font-bold uppercase hover:bg-neo-red transition-colors border-2 border-transparent"
              >
                Sign In / Register
              </button>
            ) : (
              <div className="text-center font-mono text-xs opacity-50">
                Logged in as {user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto min-h-[80vh]">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-neo-black bg-white mt-12 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-black text-xl mb-4">AUTH_AUTHORITY</h2>
            <p className="font-mono text-sm opacity-70">
              Global standard for AI forensics and digital provenance.
              ISO 27001 Compliant.
            </p>
          </div>
          <div className="font-mono text-sm space-y-4 flex flex-col items-center md:items-start">
            <p className="font-bold mb-2">LEGAL</p>
            <button
              onClick={() => handleNavigate('eu-compliance')}
              className="hover:underline decoration-2 underline-offset-4"
            >
              EU AI Act Compliance
            </button>
            <button
              onClick={() => handleNavigate('terms')}
              className="hover:underline decoration-2 underline-offset-4"
            >
              Terms of Forensic Service
            </button>
            <button
              onClick={() => handleNavigate('privacy')}
              className="hover:underline decoration-2 underline-offset-4"
            >
              Privacy Protocol
            </button>
          </div>
          <div className="font-mono text-sm flex flex-col items-center md:items-end">
            <p className="mb-2 text-xs text-gray-500">SYSTEM ID: NODE_882_ALPHA</p>
            <p className="text-xs text-gray-500">© 2024 AuthAI.pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;