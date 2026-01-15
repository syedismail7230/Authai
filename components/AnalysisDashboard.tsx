import React from 'react';
import { AnalysisResult } from '../types';
import { AlertTriangle, CheckCircle, FileText, Cpu, Activity, Lock, Fingerprint, Network } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisDashboardProps {
  data: AnalysisResult;
  onCertify: () => void;
  isProcessing: boolean;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onCertify, isProcessing }) => {
  const chartData = [
    { name: 'Human', score: data.humanProbability, fill: '#00cc66' },
    { name: 'AI', score: data.aiProbability, fill: '#ff4d4d' },
  ];

  const getVerdictColor = () => {
    if (data.verdict === 'HUMAN') return 'bg-neo-green text-white';
    if (data.verdict === 'AI_GENERATED') return 'bg-neo-red text-white';
    return 'bg-neo-yellow text-black';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Top Section: Verdict & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verdict Card */}
        <div className={`lg:col-span-2 border-4 border-neo-black shadow-neo p-6 ${getVerdictColor()}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-mono text-sm opacity-80 mb-1">FINAL VERDICT</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{data.verdict.replace('_', ' ')}</h2>
            </div>
            {data.verdict === 'HUMAN' ? <CheckCircle size={48} /> : <AlertTriangle size={48} />}
          </div>
          <div className="font-mono text-sm border-t-2 border-current pt-4 mt-4 flex justify-between flex-wrap gap-4">
            <span>CONFIDENCE: {data.confidenceScore}%</span>
            <span className="break-all">HASH: {data.contentHash.substring(0, 12)}...</span>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-white border-4 border-neo-black shadow-neo p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
              <Lock size={20} /> CERTIFICATION
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Generate an immutable, blockchain-anchored certificate for this content.
            </p>
          </div>
          <button
            onClick={onCertify}
            disabled={isProcessing}
            className="w-full bg-neo-black text-white font-bold py-4 px-6 border-2 border-transparent hover:bg-white hover:text-neo-black hover:border-neo-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-neo disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'ISSUING...' : 'MINT CERTIFICATE (₹19)'}
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Probability Chart */}
        <div className="bg-white border-4 border-neo-black p-6 shadow-neo-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity size={18} /> PROBABILITY DISTRIBUTION
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontFamily: 'Roboto Mono', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ border: '2px solid black', borderRadius: '0', boxShadow: '4px 4px 0 0 #000' }} />
                <Bar dataKey="score" barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Technical Metrics */}
        <div className="bg-white border-4 border-neo-black p-6 shadow-neo-sm flex flex-col gap-4">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            <Cpu size={18} /> FORENSIC SIGNALS
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {/* Perplexity */}
            <div className="border-2 border-neo-black p-3 bg-neo-grey">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs font-bold flex items-center gap-1"><Network size={12} /> PERPLEXITY</span>
                <span className="font-mono text-xs">{data.perplexityScore}</span>
              </div>
              <div className="w-full bg-white border border-black h-2">
                <div className="bg-neo-black h-full" style={{ width: `${data.perplexityScore}%` }}></div>
              </div>
            </div>

            {/* Burstiness */}
            <div className="border-2 border-neo-black p-3 bg-neo-grey">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs font-bold flex items-center gap-1"><Activity size={12} /> BURSTINESS</span>
                <span className="font-mono text-xs">{data.burstinessScore}</span>
              </div>
              <div className="w-full bg-white border border-black h-2">
                <div className="bg-neo-black h-full" style={{ width: `${data.burstinessScore}%` }}></div>
              </div>
            </div>

            {/* Entropy */}
            <div className="border-2 border-neo-black p-3 bg-neo-grey">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-xs font-bold flex items-center gap-1"><Fingerprint size={12} /> ENTROPY</span>
                <span className="font-mono text-xs">{data.entropyScore}</span>
              </div>
              <div className="w-full bg-white border border-black h-2">
                <div className="bg-neo-black h-full" style={{ width: `${data.entropyScore}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <p className="font-bold text-sm mb-2">DETECTED PATTERNS:</p>
            <div className="flex flex-wrap gap-2">
              {data.detectedPatterns.map((p, i) => (
                <span key={i} className="text-xs font-mono border border-black px-2 py-1 bg-white truncate max-w-[200px]">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Logs (Terminal Style) */}
      <div className="bg-neo-black text-neo-green font-mono text-xs p-6 border-4 border-neo-black shadow-neo overflow-hidden">
        <p className="mb-4 border-b border-neo-green pb-2 opacity-50">/// SYSTEM_LOGS_STREAM /// NODE_882</p>
        <div className="space-y-1 h-32 overflow-y-auto scrollbar-hide">
          {data.forensicLogs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="opacity-50 w-24">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
              <span className="font-bold w-16">{log.id}</span>
              <span className="flex-1">{log.action}</span>
              <span className={log.status === 'CRITICAL' ? 'text-neo-red' : 'text-neo-green'}>
                [{log.status}]
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