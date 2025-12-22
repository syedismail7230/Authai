import React, { useState } from 'react';
import { Search, XCircle, CheckCircle, ExternalLink, FileText, Eye, Image as ImageIcon, Video as VideoIcon, Music } from 'lucide-react';
import { CertificateData, ContentType } from '../types';
import { Logo } from './Logo';
import { verifyCertificate } from '../services/geminiService';

const VerificationPortal: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!searchId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
        const data = await verifyCertificate(searchId);
        setResult(data);
    } catch (err) {
        setError('CERTIFICATE_NOT_FOUND: The requested ID does not exist in the ledger.');
    } finally {
        setLoading(false);
    }
  };

  const renderContentPreview = (data: CertificateData) => {
      if (!data.contentPreview) return null;

      // Validate media content to prevent broken images if backend sends text error
      const isMedia = [ContentType.IMAGE, ContentType.VIDEO, ContentType.AUDIO].includes(data.contentType);
      const isUrlOrBase64 = data.contentPreview.startsWith('http') || data.contentPreview.startsWith('data:');

      if (isMedia && !isUrlOrBase64) {
          return (
             <div className="w-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center border-2 border-dashed border-gray-300">
                 <p className="font-mono text-xs text-red-500 font-bold mb-2">PREVIEW RENDER FAILED</p>
                 <p className="font-mono text-xs text-gray-500 max-w-sm">{data.contentPreview.substring(0, 200)}</p>
             </div>
          );
      }

      switch(data.contentType) {
          case ContentType.IMAGE:
              return (
                  <div className="w-full flex justify-center bg-black/5 p-4">
                      <img src={data.contentPreview} alt="Authenticated Artifact" className="max-h-96 object-contain border-2 border-neo-black shadow-sm" />
                  </div>
              );
          case ContentType.VIDEO:
              return (
                   <div className="w-full flex justify-center bg-black/5 p-4">
                      <video controls className="max-h-96 border-2 border-neo-black shadow-sm">
                          <source src={data.contentPreview} type="video/mp4" />
                          Your browser does not support the video tag.
                      </video>
                  </div>
              );
          case ContentType.AUDIO:
               return (
                   <div className="w-full flex flex-col items-center bg-black/5 p-8">
                      <Music size={48} className="mb-4 text-neo-black opacity-50" />
                      <audio controls className="w-full max-w-md border-2 border-neo-black">
                          <source src={data.contentPreview} />
                      </audio>
                  </div>
              );
          default: // TEXT
              return (
                  <div className="bg-white p-4 min-h-[100px] flex items-center justify-center">
                    <p className="font-mono text-sm whitespace-pre-wrap text-gray-700 blur-[3px] group-hover:blur-none transition-all duration-300 select-none max-h-96 overflow-y-auto">
                        {data.contentPreview}
                    </p>
                  </div>
              );
      }
  };

  const getIcon = (type: ContentType) => {
      switch(type) {
          case ContentType.IMAGE: return <ImageIcon size={14} />;
          case ContentType.VIDEO: return <VideoIcon size={14} />;
          case ContentType.AUDIO: return <Music size={14} />;
          default: return <FileText size={14} />;
      }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <div className="inline-block p-4 border-4 border-neo-black rounded-full mb-6 bg-white shadow-neo">
            <Logo size={64} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">Public Ledger Verification</h1>
        <p className="font-mono text-gray-600 max-w-xl mx-auto">
          Validate the authenticity of an AuthAI certificate. Access the immutable blockchain record via Certificate ID.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white border-4 border-neo-black p-2 shadow-neo mb-12 flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center px-4 bg-neo-grey border-2 border-transparent focus-within:border-neo-black focus-within:bg-white transition-colors">
            <Search className="text-gray-400 mr-2" />
            <input 
                type="text" 
                placeholder="ENTER CERTIFICATE ID (e.g. AUTH-X92M...)" 
                className="w-full bg-transparent py-4 font-mono outline-none uppercase placeholder:text-gray-400"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            />
        </div>
        <button 
            onClick={handleLookup}
            disabled={loading}
            className="bg-neo-black text-white px-8 py-4 font-bold uppercase hover:bg-neo-green hover:text-neo-black transition-colors disabled:opacity-50"
        >
            {loading ? 'SEARCHING...' : 'VERIFY RECORD'}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-neo-red/10 border-l-8 border-neo-red p-6 flex items-start gap-4">
            <XCircle className="text-neo-red shrink-0" size={24} />
            <div>
                <h3 className="font-bold text-neo-red text-lg">VERIFICATION FAILED</h3>
                <p className="font-mono text-sm">{error}</p>
            </div>
        </div>
      )}

      {result && (
        <div className="bg-white border-4 border-neo-black p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-neo-green text-white px-4 py-2 font-mono text-xs font-bold flex items-center gap-2">
                <CheckCircle size={14} /> VALID SIGNATURE
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <p className="text-xs text-gray-500 font-mono mb-1">RECORD ID</p>
                    <p className="font-bold text-xl">{result.id}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-mono mb-1">TIMESTAMP</p>
                    <p className="font-bold text-xl">{result.issueDate.split('T')[0]}</p>
                </div>
                <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 font-mono mb-1">CONTENT HASH</p>
                    <p className="font-mono text-sm bg-neo-grey p-2 border border-neo-black break-all">{result.contentHash}</p>
                </div>
             </div>

             {/* Content Preview Section */}
             {result.contentPreview && (
                 <div className="mb-8 border-4 border-neo-black bg-neo-grey p-0 overflow-hidden">
                    <div className="bg-neo-black text-white px-4 py-2 flex justify-between items-center">
                        <span className="font-bold font-mono text-xs flex items-center gap-2">
                             {getIcon(result.contentType)} {result.contentType} PREVIEW
                        </span>
                        <span className="text-[10px] bg-neo-red px-1 text-white animate-pulse">CONFIDENTIAL</span>
                    </div>
                    
                    <div className="relative group bg-white">
                        {renderContentPreview(result)}
                        
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                             <div className="bg-neo-black/80 text-white px-3 py-1 font-bold text-xs flex items-center gap-2 backdrop-blur-sm">
                                <Eye size={12} /> HOVER TO REVEAL
                            </div>
                        </div>
                    </div>
                 </div>
             )}

             <div className="border-t-4 border-dotted border-neo-black pt-8 text-center">
                <p className="font-mono text-sm text-gray-500 mb-2">AUTHENTICITY VERDICT</p>
                <div className={`inline-block text-3xl font-black px-6 py-2 border-4 border-neo-black ${result.verdict === 'HUMAN' ? 'bg-neo-green text-white' : 'bg-neo-red text-white'}`}>
                    {result.verdict} ORIGIN
                </div>
             </div>
             
             <div className="mt-8 text-center">
                 <a href="#" className="inline-flex items-center gap-2 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-neo-green">
                    VIEW ON POLYGON SCAN <ExternalLink size={14} />
                 </a>
             </div>
        </div>
      )}

    </div>
  );
};

export default VerificationPortal;