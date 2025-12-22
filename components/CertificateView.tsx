
import React, { useRef, useState } from 'react';
import { CertificateData, ContentType } from '../types';
import { Download, Share2, Check, Loader2, Award, FileText, Image as ImageIcon, Video as VideoIcon, Music } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Logo } from './Logo';

interface CertificateViewProps {
  data: CertificateData;
  onReset: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({ data, onReset }) => {
  const verificationUrl = `https://authai.pro/verify/${data.id}?hash=${data.contentHash}`;
  const certRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadRef, setDownloadRef] = useState<string>('');

  const handleDownload = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true, // Enable CORS to handle loaded assets like the Logo image
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Match canvas aspect ratio
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`AuthAI_Certificate_${data.id}.pdf`);
    } catch (err) {
      console.error("PDF Gen Error", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBadgeDownload = async () => {
    if (!badgeRef.current) return;
    
    // Generate unique instance ID for this download
    const uniqueRef = `COPY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setDownloadRef(uniqueRef);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const canvas = await html2canvas(badgeRef.current, {
            backgroundColor: null,
            scale: 4,
            logging: false,
            useCORS: true,
            allowTaint: true,
        });
        const link = document.createElement('a');
        link.download = `AuthAI_Badge_${data.id}_${uniqueRef}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Badge Download Error", err);
        alert("Failed to download badge.");
    }
  };

  const getIcon = (type: ContentType) => {
      switch(type) {
          case ContentType.IMAGE: return <ImageIcon size={24} />;
          case ContentType.VIDEO: return <VideoIcon size={24} />;
          case ContentType.AUDIO: return <Music size={24} />;
          default: return <FileText size={24} />;
      }
  };

  const renderContent = () => {
       switch(data.contentType) {
          case ContentType.IMAGE:
              return <img src={data.contentPreview} alt="Artifact" className="max-w-full max-h-96 border-2 border-neo-black mx-auto" />;
          case ContentType.VIDEO:
               // If contentPreview is a base64 string without data URI scheme for video (unlikely given ScannerInput), handling strictly here.
               // Assuming logic handles URL or Base64.
               return (
                   <div className="bg-black text-white p-4 text-center font-mono text-sm">
                       [VIDEO METADATA PRESERVED]<br/>
                       {data.contentPreview?.substring(0, 100)}...
                   </div>
               );
          case ContentType.AUDIO:
               return (
                   <div className="bg-black text-white p-4 text-center font-mono text-sm">
                       [AUDIO SPECTROGRAM SAVED]<br/>
                       {data.contentPreview?.substring(0, 100)}...
                   </div>
               );
          default:
              return <div className="font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">{data.contentPreview}</div>;
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in zoom-in duration-500 pb-12">
      
      {/* Certificate Container to Capture */}
      <div ref={certRef} className="bg-white border-[12px] border-double border-neo-black p-8 md:p-12 shadow-neo relative overflow-hidden">
        {/* Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Logo size={500} />
        </div>

        <div className="relative z-10 text-center">
          <div className="inline-block border-4 border-neo-black p-2 mb-8">
            <Logo size={48} />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-2 tracking-tighter">Certificate of Authenticity</h1>
          <p className="font-mono text-sm text-gray-500 mb-12 uppercase tracking-widest">AuthAI.pro Provenance Standard</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto mb-12 font-mono text-sm">
            <div className="border-b-2 border-gray-200 pb-2">
              <p className="text-gray-500 text-xs">CERTIFICATE ID</p>
              <p className="font-bold">{data.id}</p>
            </div>
            <div className="border-b-2 border-gray-200 pb-2">
              <p className="text-gray-500 text-xs">ISSUE TIMESTAMP (UTC)</p>
              <p className="font-bold">{data.issueDate}</p>
            </div>
            <div className="border-b-2 border-gray-200 pb-2 col-span-1 md:col-span-2">
              <p className="text-gray-500 text-xs">CONTENT HASH (SHA-256)</p>
              <p className="font-bold break-all">{data.contentHash}</p>
            </div>
            <div className="border-b-2 border-gray-200 pb-2">
              <p className="text-gray-500 text-xs">VERDICT</p>
              <p className="font-black text-neo-green text-lg">{data.verdict}</p>
            </div>
            <div className="border-b-2 border-gray-200 pb-2">
               <p className="text-gray-500 text-xs">ISSUER SIGNATURE</p>
               <p className="font-serif italic text-lg">AuthAI Authority</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mb-8">
            <div className="bg-neo-black p-2 shadow-neo hover:shadow-none transition-shadow duration-300">
               <div className="bg-white p-4 border-2 border-white">
                 <QRCode
                    size={128}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={verificationUrl}
                    viewBox={`0 0 256 256`}
                    fgColor="#000000"
                    bgColor="#ffffff"
                 />
               </div>
            </div>
            <p className="font-mono text-[10px] mt-4 text-gray-500 uppercase tracking-widest">Scan to Verify Provenance</p>
            <p className="font-mono text-[9px] text-gray-400 mt-1 break-all max-w-xs">{verificationUrl}</p>
          </div>

          <div className="bg-neo-grey p-4 border-2 border-neo-black inline-flex items-center gap-2">
            <Check size={16} className="text-neo-green" />
            <span className="font-mono text-xs font-bold">BLOCKCHAIN ANCHORED (POLYGON)</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-16">
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 bg-neo-black text-white px-6 py-3 font-bold shadow-neo hover:translate-y-1 hover:shadow-none transition-all border-2 border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? <Loader2 className="animate-spin" size={20}/> : <Download size={20} />} 
          DOWNLOAD PDF
        </button>
        <button className="flex items-center justify-center gap-2 bg-white text-neo-black border-2 border-neo-black px-6 py-3 font-bold shadow-neo hover:translate-y-1 hover:shadow-none transition-all">
          <Share2 size={20} /> SHARE LINK
        </button>
        <button 
          onClick={onReset}
          className="flex items-center justify-center gap-2 bg-transparent text-gray-500 hover:text-neo-black px-6 py-3 font-mono text-sm underline underline-offset-4"
        >
          VERIFY ANOTHER
        </button>
      </div>

      {/* Authenticated Artifact Section */}
      {data.contentPreview && (
        <div className="bg-neo-grey border-4 border-neo-black p-6 shadow-neo mb-12">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 uppercase">
                {getIcon(data.contentType)} Authenticated Artifact
            </h3>
            <p className="text-xs font-mono text-gray-500 mb-2">The following content has been forensically analyzed and linked to Certificate {data.id}</p>
            <div className="bg-white border-2 border-neo-black p-4">
                {renderContent()}
            </div>
        </div>
      )}

      {/* Trust Badge Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border-4 border-neo-black p-8 shadow-neo">
        <div className="order-2 md:order-1">
            <h3 className="font-black text-2xl uppercase mb-2 flex items-center gap-2">
                <Award size={28} className="text-neo-yellow"/> Digital Trust Badge
            </h3>
            <p className="font-mono text-sm text-gray-600 mb-6">
                Download this digital seal to display on your website, social media, or creative portfolio. It serves as cryptographic proof that your content has been forensically verified by AuthAI.pro.
            </p>
            <button 
                onClick={handleBadgeDownload}
                className="flex items-center gap-2 bg-neo-yellow text-black border-2 border-neo-black px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
            >
                <Download size={18} /> DOWNLOAD BADGE (PNG)
            </button>
        </div>

        <div className="order-1 md:order-2 flex justify-center items-center bg-gray-50 p-8 border-2 border-dashed border-gray-300">
            {/* The Badge Element to Capture */}
            <div 
                ref={badgeRef} 
                className="w-48 h-48 bg-white rounded-full border-[6px] border-neo-black flex flex-col items-center justify-center relative shadow-lg overflow-hidden shrink-0"
            >
                 {/* Decorative rings */}
                 <div className="absolute inset-1 border-2 border-dashed border-gray-200 rounded-full"></div>
                 
                 <div className="bg-neo-black text-white px-3 py-1 text-[8px] font-bold uppercase rounded-full mb-2 z-10 tracking-widest">
                    Verified by AuthAI
                 </div>
                 
                 <Logo size={36} className="mb-2 text-neo-black z-10" />
                 
                 <div className={`font-black text-xl uppercase z-10 leading-none mb-1 ${
                     data.verdict === 'HUMAN' ? 'text-neo-green' : 
                     data.verdict === 'AI_GENERATED' ? 'text-neo-red' : 'text-neo-yellow'
                 }`}>
                    {data.verdict === 'HUMAN' ? 'HUMAN' : data.verdict === 'AI_GENERATED' ? 'AI GEN' : 'MIXED'}
                 </div>
                 <div className="text-[10px] font-bold uppercase z-10 leading-none mb-2">ORIGIN</div>
                 
                 <div className="text-[6px] font-mono text-gray-400 mt-1 z-10 max-w-[80%] text-center break-all">
                    {data.id}
                 </div>
                 
                 {/* Unique Download Reference */}
                 <div className="absolute bottom-3 text-[5px] font-mono font-bold text-gray-400 z-10 tracking-widest uppercase">
                    {downloadRef || "OFFICIAL DIGITAL SEAL"}
                 </div>
                 
                 {/* Subtle Radial Gradient */}
                 <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent pointer-events-none"></div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default CertificateView;
