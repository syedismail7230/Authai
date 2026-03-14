import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useVerificationStore } from '../lib/store/verificationStore';
import { useAuthStore } from '../lib/store/authStore';
import CertificateModal from './CertificateModal';
import { useRouter } from 'next/router';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  verificationId?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'TEXT' | 'IMG' | 'AUD' | 'VID'>('TEXT');
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const { addVerification } = useVerificationStore();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onDrop = async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      await handleFileUpload(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: activeTab === 'TEXT',
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc', '.docx'],
    },
  });

  const checkAuthAndBalance = () => {
    if (!user) {
      router.push('/auth/login');
      return false;
    }
    if (user.wallet < 19) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `> SYS_ERR: INSUFFICIENT BALANCE.\n> REQ_AMOUNT: ₹19. CUR_BALANCE: ₹${user.wallet}\n> ACTION: TOP_UP_WALLET REQUIRED.`,
          timestamp: new Date(),
        },
      ]);
      return false;
    }
    return true;
  };

  const handleFileUpload = async (file: File) => {
    if (!checkAuthAndBalance()) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: `> SYS_CMD: UPLOAD_FILE [${file.name}] (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        timestamp: new Date(),
      },
    ]);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { id, aiScore, classification, confidence } = response.data;

      addVerification({
        id,
        type: file.type.split('/')[0] || 'document',
        aiScore,
        classification,
        confidence,
        timestamp: new Date(),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `> ANALYSIS COMPLETE.\n> AI_PROBABILITY: ${aiScore}%\n> CLASSIFICATION: ${classification.toUpperCase()}\n> CONFIDENCE: ${confidence}%\n> CERT_ID: ${id}`,
          timestamp: new Date(),
          verificationId: id,
        },
      ]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'RUNTIME_ERROR';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `> FATAL_ERR: ${errorMsg.toUpperCase()}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!input.trim() || !checkAuthAndBalance()) return;

    const userMessage = input;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: `> SCAN_REQ: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`,
        timestamp: new Date(),
      },
    ]);

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify/text`,
        { text: userMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { id, aiScore, classification, confidence } = response.data;

      addVerification({
        id,
        type: 'text',
        aiScore,
        classification,
        confidence,
        timestamp: new Date(),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `> ANALYSIS COMPLETE.\n> AI_PROBABILITY: ${aiScore}%\n> CLASSIFICATION: ${classification.toUpperCase()}\n> CONFIDENCE: ${confidence}%\n> CERT_ID: ${id}`,
          timestamp: new Date(),
          verificationId: id,
        },
      ]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'VERIFICATION FAILED';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `> FATAL_ERR: ${errorMsg.toUpperCase()}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  const handleCertificateDownload = (verificationId: string) => {
    setSelectedVerificationId(verificationId);
    setShowCertModal(true);
  };

  const tabs = [
    { id: 'TEXT', icon: '📄', label: 'TEXT' },
    { id: 'IMG', icon: '🖼', label: 'IMG' },
    { id: 'AUD', icon: '🎧', label: 'AUD' },
    { id: 'VID', icon: '🎬', label: 'VID' },
  ] as const;

  return (
    <>
      <div className="w-full bg-white border-4 border-black shadow-[12px_12px_0_0_rgba(0,0,0,1)] relative z-10 transition-all">
        
        {/* Tabs */}
        <div className="flex border-b-4 border-black">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 font-bold uppercase tracking-widest text-sm transition-colors border-r-4 border-black last:border-r-0 outline-none ${
                activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-gray-100 text-black'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8">
          
          {/* Main Input Box */}
          <div {...getRootProps()} className={`relative border-2 border-gray-400 p-1 min-h-[250px] mb-8 bg-white ${activeTab !== 'TEXT' ? 'cursor-pointer hover:border-black' : ''}`}>
            {activeTab !== 'TEXT' && <input {...getInputProps()} />}
            
            {activeTab === 'TEXT' ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="> Paste content sequence here for forensic analysis..."
                className="w-full h-full min-h-[240px] bg-transparent resize-none outline-none font-mono text-sm p-4 text-black placeholder-gray-400"
                disabled={loading}
              />
            ) : (
              <div className="w-full h-full min-h-[240px] flex items-center justify-center font-mono text-sm text-gray-500">
                {isDragActive ? "> DROP FILE TO BEGIN TRANSFER" : "> CLICK OR DRAG FILE HERE FOR ANALYSIS"}
              </div>
            )}
          </div>
          
          {/* Output Messages */}
          {messages.length > 0 && (
            <div className="mb-8 border-2 border-black p-4 font-mono text-sm bg-[#f9f9f9] max-h-[300px] overflow-y-auto w-full shadow-inner">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-4 text-black">
                  <pre className="whitespace-pre-wrap font-inherit">{msg.content}</pre>
                  {msg.verificationId && msg.type === 'ai' && (
                    <button
                      onClick={() => handleCertificateDownload(msg.verificationId!)}
                      className="mt-4 px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white uppercase font-bold text-xs tracking-widest shadow-[2px_2px_0_0_#000] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      [ DOWNLOAD_CERTIFICATE ]
                    </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Bottom Action Area */}
          <div className="flex justify-end mt-4">
             <button
                onClick={activeTab === 'TEXT' ? handleTextSubmit : undefined}
                disabled={loading || (activeTab === 'TEXT' && !input.trim())}
                className="px-8 py-4 bg-[#ff6b6b] text-white font-black uppercase tracking-widest border-4 border-black shadow-[6px_6px_0_0_#000] hover:bg-[#ff5252] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_0_#000]"
             >
                {loading ? 'ANALYZING...' : 'INITIATE SCAN \u2192'}
             </button>
          </div>
        </div>
      </div>

      {showCertModal && selectedVerificationId && (
        <CertificateModal
          verificationId={selectedVerificationId}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  );
}
