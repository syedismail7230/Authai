import React, { useState } from 'react';
import { Scan, Upload, FileCode, FileImage, FileAudio, FileVideo, ArrowRight, X } from 'lucide-react';
import { ContentType } from '../types';

interface ScannerInputProps {
  onAnalyze: (content: string, type: ContentType) => void;
  isScanning: boolean;
}

const ScannerInput: React.FC<ScannerInputProps> = ({ onAnalyze, isScanning }) => {
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType>(ContentType.TEXT);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleScan = () => {
    if (!text.trim()) return;
    onAnalyze(text, activeTab);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For images, we want a base64 string to display the preview later
    if (activeTab === ContentType.IMAGE) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setText(result); // Pass base64 as content
            setFilePreview(result);
        };
        reader.readAsDataURL(file);
    } else {
        // For other files, we just use a placeholder text for now
        // In a real app, you'd upload to cloud and get a URL
        setText(`[FILE_METADATA]\nName: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`);
        setFilePreview(null);
    }
  };

  const clearInput = () => {
    setText('');
    setFilePreview(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Intro Text */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight">
          Verify Authenticity
        </h2>
        <p className="font-mono text-sm md:text-base max-w-xl mx-auto text-gray-600">
          Advanced forensic analysis for Text, Image, Audio, and Video. 
          Detects AI generation patterns using spectral and semantic entropy models.
        </p>
      </div>

      {/* Main Input Container */}
      <div className="bg-white border-4 border-neo-black shadow-neo p-1 relative overflow-hidden">
        {isScanning && <div className="scanline z-10 pointer-events-none"></div>}
        
        {/* Tabs */}
        <div className="flex border-b-4 border-neo-black">
          {[
            { id: ContentType.TEXT, icon: FileCode, label: 'TEXT' },
            { id: ContentType.IMAGE, icon: FileImage, label: 'IMG' },
            { id: ContentType.AUDIO, icon: FileAudio, label: 'AUD' },
            { id: ContentType.VIDEO, icon: FileVideo, label: 'VID' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                  setActiveTab(tab.id);
                  clearInput();
              }}
              className={`flex-1 py-4 flex flex-col items-center gap-1 font-bold font-mono text-xs sm:text-sm hover:bg-gray-100 transition-colors ${
                activeTab === tab.id ? 'bg-neo-black text-white hover:bg-neo-black' : 'text-neo-black'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[300px] flex flex-col">
          {activeTab === ContentType.TEXT ? (
            <div className="relative">
                 <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="> Paste content sequence here for forensic analysis..."
                  className="w-full h-48 p-4 font-mono text-sm bg-neo-grey border-2 border-neo-black focus:outline-none focus:ring-2 focus:ring-neo-black resize-none mb-4"
                  disabled={isScanning}
                />
                {text && (
                    <button onClick={clearInput} className="absolute top-2 right-2 p-1 hover:bg-neo-red hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                )}
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-neo-black bg-neo-grey flex flex-col items-center justify-center mb-4 p-8 text-center relative overflow-hidden">
              {filePreview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                      <img src={filePreview} alt="Preview" className="max-h-48 object-contain border-2 border-neo-black shadow-sm mb-4" />
                      <button onClick={clearInput} className="flex items-center gap-2 text-xs font-bold underline text-neo-red">REMOVE FILE</button>
                  </div>
              ) : text ? (
                 <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <FileCode size={48} className="mb-4" />
                      <p className="font-mono text-sm whitespace-pre-wrap">{text}</p>
                      <button onClick={clearInput} className="flex items-center gap-2 text-xs font-bold underline text-neo-red mt-4">REMOVE FILE</button>
                 </div>
              ) : (
                  <>
                      <Upload size={48} className="mb-4 opacity-50" />
                      <p className="font-bold mb-2">DRAG & DROP ARTIFACT</p>
                      <p className="font-mono text-xs text-gray-500 mb-4">
                          Supported: {activeTab === ContentType.IMAGE ? 'JPG, PNG' : activeTab === ContentType.AUDIO ? 'MP3, WAV' : 'MP4, MOV'}
                      </p>
                      <label className="cursor-pointer bg-white border-2 border-neo-black px-6 py-2 font-bold shadow-neo-sm hover:shadow-neo-hover active:translate-y-1 active:shadow-none transition-all">
                        BROWSE FILES
                        <input 
                            type="file" 
                            accept={activeTab === ContentType.IMAGE ? "image/*" : activeTab === ContentType.AUDIO ? "audio/*" : "video/*"}
                            className="hidden" 
                            onChange={handleFileChange} 
                        />
                      </label>
                  </>
              )}
            </div>
          )}

          {/* Action Area */}
          <div className="flex justify-end">
            <button
              onClick={handleScan}
              disabled={isScanning || !text}
              className="flex items-center gap-3 bg-neo-red text-white px-8 py-4 text-xl font-black uppercase border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>SCANNING...</>
              ) : (
                <>
                  INITIATE SCAN <ArrowRight strokeWidth={4} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerInput;