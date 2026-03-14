import React from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle, Cpu, Activity, Lock, Fingerprint, Network, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisDashboardProps {
  data: AnalysisResult;
  onCertify: () => void;
  isProcessing: boolean;
  user?: any; // Pass user prop
  onReport?: (data: any) => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onCertify, isProcessing, user, onReport }) => {
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('');

  const handleReportSubmit = () => {
    if (onReport) {
      onReport({ reportType: 'VERIFICATION_DISPUTE', description: reportReason, relatedId: data.id, reporter: user?.email || 'ANONYMOUS' });
      setShowReportModal(false);
      alert('Report submitted successfully.');
    }
  };

  const chartData = [
    { name: 'Human', score: data.humanProbability, fill: '#4ADE80' },
    { name: 'AI', score: data.aiProbability, fill: '#F87171' },
  ];

  const getVerdictStyle = () => {
    if (data.verdict === 'HUMAN') return { bg: 'bg-neo-green', text: 'text-black', icon: <CheckCircle size={48} strokeWidth={2.5} /> };
    if (data.verdict === 'AI_GENERATED') return { bg: 'bg-neo-red', text: 'text-white', icon: <AlertTriangle size={48} strokeWidth={2.5} /> };
    return { bg: 'bg-neo-yellow', text: 'text-black', icon: <Activity size={48} strokeWidth={2.5} /> };
  };

  const verdictStyle = getVerdictStyle();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Section: Verdict & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verdict Card */}
        <div className={`lg:col-span-2 border-4 border-black shadow-neo p-8 ${verdictStyle.bg} ${verdictStyle.text} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-2 opacity-20 transform rotate-12">
            <Fingerprint size={120} />
          </div>

          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="font-mono font-bold text-sm mb-2 uppercase tracking-widest border-b-2 border-current inline-block pb-1">Final Verdict</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-4">{data.verdict.replace('_', ' ')}</h2>
              <p className="font-mono font-bold text-xl">CONFIDENCE SCORE: {data.confidenceScore}%</p>
            </div>
            <div className="bg-black/10 p-4 rounded-full border-4 border-current">
              {verdictStyle.icon}
            </div>
          </div>
          <div className="font-mono text-xs border-t-2 border-current pt-4 mt-6 flex justify-between flex-wrap gap-4 opacity-80">
            <span>HASH: {data.contentHash}</span>
            <span>ID: {data.id}</span>
          </div>
        </div>

        {/* Action Card */}
        <div className="neo-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-2xl mb-4 flex items-center gap-2 uppercase">
              <Lock size={24} strokeWidth={2.5} /> Certification
            </h3>
            <p className="font-mono text-sm text-gray-600 mb-6 leading-relaxed">
              Generate an immutable, blockchain-anchored certificate for this forensic analysis.
              <br /><br />
              <strong>Status:</strong> {user ? (user.credits > 0 ? 'CREDITS AVAILABLE' : 'PAYMENT REQUIRED') : 'LOGIN REQUIRED'}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <button
                onClick={onCertify}
                disabled={isProcessing}
                className={`w-full py-4 text-xl font-black border-2 border-black shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${user.credits > 0 ? 'bg-neo-green text-black' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              >
                {isProcessing ? 'MINTING...' : (user.credits > 0 ? 'MINT CERTIFICATE' : 'PURCHASE CREDITS')}
              </button>
            ) : (
              <div className="text-center font-mono text-xs text-neo-red font-bold p-2 border-2 border-neo-red">
                PLEASE SIGN IN TO MINT
              </div>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs font-mono underline text-gray-500 hover:text-neo-red"
            >
              Report / Dispute Verification
            </button>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white border-4 border-black p-6 shadow-neo max-w-md w-full animate-in zoom-in-95">
              <h3 className="font-black text-xl mb-4 uppercase">Dispute Verification</h3>
              <textarea
                className="w-full h-32 border-2 border-black p-2 font-mono text-sm mb-4 neo-input"
                placeholder="Describe the issue..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={() => setShowReportModal(false)} className="flex-1 font-bold border-2 border-black py-2 hover:bg-gray-100">CANCEL</button>
                <button onClick={handleReportSubmit} className="flex-1 font-bold border-2 border-black bg-neo-red text-white py-2 shadow-neo-sm hover:shadow-none translate-x-[2px]">SUBMIT</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Probability Chart */}
        <div className="neo-card p-6">
          <h3 className="font-black text-lg mb-6 flex items-center gap-2 uppercase border-b-2 border-black pb-2">
            <Activity size={20} /> Probability Model
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontFamily: 'Roboto Mono', fontSize: 14, fontWeight: 700, fill: 'black' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0 0 #000', fontFamily: 'Roboto Mono' }} />
                <Bar dataKey="score" barSize={40} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Metrics */}
        <div className="neo-card p-6 flex flex-col gap-5">
          <h3 className="font-black text-lg mb-2 flex items-center gap-2 uppercase border-b-2 border-black pb-2">
            <Cpu size={20} /> Neural Signals
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Perplexity */}
            <div className="border-2 border-black p-3 bg-gray-50 hover:bg-white transition-colors">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs font-bold flex items-center gap-2"><Network size={14} /> PERPLEXITY</span>
                <span className="font-mono text-xs font-bold bg-black text-white px-2">{data.perplexityScore}</span>
              </div>
              <div className="w-full bg-white border-2 border-black h-3 relative">
                <div className="bg-black h-full absolute left-0 top-0 transition-all duration-1000" style={{ width: `${data.perplexityScore}%` }}></div>
              </div>
            </div>

            {/* Burstiness */}
            <div className="border-2 border-black p-3 bg-gray-50 hover:bg-white transition-colors">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs font-bold flex items-center gap-2"><Activity size={14} /> BURSTINESS</span>
                <span className="font-mono text-xs font-bold bg-black text-white px-2">{data.burstinessScore}</span>
              </div>
              <div className="w-full bg-white border-2 border-black h-3 relative">
                <div className="bg-black h-full absolute left-0 top-0 transition-all duration-1000" style={{ width: `${data.burstinessScore}%` }}></div>
              </div>
            </div>

            {/* Entropy */}
            <div className="border-2 border-black p-3 bg-gray-50 hover:bg-white transition-colors">
              <div className="flex justify-between mb-2">
                <span className="font-mono text-xs font-bold flex items-center gap-2"><Fingerprint size={14} /> ENTROPY</span>
                <span className="font-mono text-xs font-bold bg-black text-white px-2">{data.entropyScore}</span>
              </div>
              <div className="w-full bg-white border-2 border-black h-3 relative">
                <div className="bg-black h-full absolute left-0 top-0 transition-all duration-1000" style={{ width: `${data.entropyScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Logs (Terminal Style) */}
      <div className="bg-black text-neo-green font-mono text-xs p-6 border-4 border-black shadow-neo relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-30">
          <Terminal size={64} />
        </div>
        <p className="mb-4 border-b border-neo-green pb-2 uppercase tracking-wider flex items-center gap-2">
          <span className="animate-pulse">●</span> SYSTEM_LOGS_STREAM // NODE_882
        </p>
        <div className="space-y-2 h-40 overflow-y-auto pr-2 custom-scrollbar">
          {data.forensicLogs.map((log) => (
            <div key={log.id} className="flex gap-4 hover:bg-neo-green/10 p-1 transition-colors border-l-2 border-transparent hover:border-neo-green pl-2">
              <span className="opacity-50 w-24">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
              <span className="font-bold w-20 text-white">{log.id}</span>
              <span className="flex-1 text-gray-300">{log.action}</span>
              <span className={`font-bold ${log.status === 'CRITICAL' ? 'text-neo-red' : 'text-neo-green'}`}>
                {log.status}
              </span>
            </div>
          ))}
          <div className="animate-pulse">_</div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisDashboard;