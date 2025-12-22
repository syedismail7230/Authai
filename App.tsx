import React, { useState } from 'react';
import Layout, { UserState } from './components/Layout';
import ScannerInput from './components/ScannerInput';
import AnalysisDashboard from './components/AnalysisDashboard';
import CertificateView from './components/CertificateView';
import PaymentModal from './components/PaymentModal';
import VerificationPortal from './components/VerificationPortal';
import AdminPortal from './components/AdminPortal';
import LoginModal from './components/LoginModal';
import UserProfile from './components/UserProfile';
import { EUCompliance, TermsOfService, PrivacyProtocol } from './components/LegalPages';
import { analyzeContent, mintCertificate } from './services/geminiService';
import { AnalysisResult, ContentType, AnalysisStatus, CertificateData } from './types';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'verify' | 'admin' | 'profile' | 'eu-compliance' | 'terms' | 'privacy'>('home');
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const [stage, setStage] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analyzedContent, setAnalyzedContent] = useState<string>('');
  const [analyzedContentType, setAnalyzedContentType] = useState<ContentType>(ContentType.TEXT);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [credits, setCredits] = useState<number>(3); // 3 Free Credits on signup
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const handleAnalysis = async (content: string, type: ContentType) => {
    setAnalyzedContent(content);
    setAnalyzedContentType(type);
    setStage(AnalysisStatus.SCANNING);
    
    // Simulate scan delay for dramatic effect (Forensic aesthetic)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await analyzeContent(content, type);
    setAnalysisData(result);
    setStage(AnalysisStatus.COMPLETE);
  };

  const handleCertification = async () => {
    if (!analysisData) return;

    if (credits <= 0) {
      setIsPaymentOpen(true);
      return;
    }

    setStage(AnalysisStatus.SCANNING); // Show processing
    
    try {
        // Call Backend to Mint
        const cert = await mintCertificate(
            analysisData,
            analyzedContent,
            analyzedContentType,
            user ? user.email : 'ANONYMOUS_USER_01'
        );

        setCredits(prev => prev - 1);
        setCertificate(cert);
        setStage(AnalysisStatus.CERTIFIED);
    } catch (e: any) {
        console.error(e);
        setStage(AnalysisStatus.COMPLETE); // Revert on error
        alert(`Minting Failed: ${e.message || "Backend service unreachable"}`);
    }
  };

  const handleReset = () => {
    setStage(AnalysisStatus.IDLE);
    setAnalysisData(null);
    setCertificate(null);
    setAnalyzedContent('');
    setAnalyzedContentType(ContentType.TEXT);
  };

  const handleLogin = (email: string, isAdmin: boolean) => {
      const newUser = { email, isAdmin };
      setUser(newUser);
      if (isAdmin) {
          setCurrentView('admin');
      } else {
          setCurrentView('profile');
      }
  };

  const handleLogout = () => {
      setUser(null);
      setCurrentView('home');
  };

  // Render the Scanner Flow (Home View)
  const renderScannerFlow = () => (
    <>
        {stage === AnalysisStatus.IDLE && (
          <ScannerInput 
            onAnalyze={handleAnalysis} 
            isScanning={false} 
          />
        )}

        {stage === AnalysisStatus.SCANNING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
             <div className="w-24 h-24 border-8 border-neo-black border-t-neo-green animate-spin rounded-full mb-8"></div>
             <p className="font-mono font-bold animate-pulse text-2xl mb-2">RUNNING FORENSIC PROTOCOLS...</p>
             <div className="font-mono text-xs text-gray-500 flex flex-col items-center gap-1">
                <span>ANALYZING SPECTRAL ENTROPY</span>
                <span>CALCULATING PERPLEXITY VECTOR</span>
                <span>MATCHING DIFFUSION PATTERNS</span>
             </div>
          </div>
        )}

        {stage === AnalysisStatus.COMPLETE && analysisData && (
          <AnalysisDashboard 
            data={analysisData} 
            onCertify={handleCertification}
            isProcessing={false}
          />
        )}

        {stage === AnalysisStatus.CERTIFIED && certificate && (
          <CertificateView 
            data={certificate}
            onReset={handleReset}
          />
        )}
    </>
  );

  return (
    <div className="relative">
      <PaymentModal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)} 
        onSuccess={(amount) => setCredits(prev => prev + amount)}
      />

      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
      />

      <Layout 
        credits={credits} 
        currentView={currentView}
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onNavigate={(view) => {
            // Protect Admin Route
            if (view === 'admin' && !user?.isAdmin) {
                return; 
            }
            if (view === 'profile' && !user) {
                setIsLoginOpen(true);
                return;
            }

            setCurrentView(view);
            // Reset scanner state when leaving home
            if (view !== 'home') handleReset();
            // Scroll to top
            window.scrollTo(0,0);
        }}
      >
        {/* Mobile Credit FAB */}
        <div className="fixed bottom-4 right-4 md:hidden z-40">
           <button 
             onClick={() => setIsPaymentOpen(true)}
             className="bg-neo-yellow border-2 border-neo-black p-3 rounded-full shadow-neo active:shadow-none transition-all"
           >
             <Plus size={24} />
           </button>
        </div>

        {currentView === 'home' && renderScannerFlow()}
        {currentView === 'verify' && <VerificationPortal />}
        {currentView === 'admin' && user?.isAdmin && <AdminPortal />}
        {currentView === 'profile' && user && <UserProfile email={user.email} onLogout={handleLogout} />}
        {currentView === 'eu-compliance' && <EUCompliance />}
        {currentView === 'terms' && <TermsOfService />}
        {currentView === 'privacy' && <PrivacyProtocol />}

      </Layout>
    </div>
  );
};

export default App;