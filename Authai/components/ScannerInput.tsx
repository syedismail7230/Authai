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

    if (activeTab === ContentType.IMAGE) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setText(result);
        setFilePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
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
        <p className="font-mono text-sm md:text-base max-w-xl mx-auto opacity-70">
          Advanced forensic analysis for Text, Image, Audio, and Video.
          Detects AI generation patterns using spectral and semantic models.
        </p>
      </div>

      {/* Main Input Container */}
      <div className="neo-card p-1">
        {isScanning && <div className="scanline z-10 pointer-events-none"></div>}

        {/* Tabs */}
        <div className="flex border-b-4 border-black overflow-x-auto md:overflow-visible scrollbar-hide">
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
              className={`neo-tab ${activeTab === tab.id ? 'active' : 'inactive'} flex flex-col items-center gap-1 min-w-[80px]`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[300px] flex flex-col bg-white">
          {activeTab === ContentType.TEXT ? (
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="> PASTE CONTENT SEQUENCE FOR FORENSIC ANALYSIS..."
                className="neo-input h-64 resize-none mb-6"
                disabled={isScanning}
              />
              {text && (
                <button onClick={clearInput} className="absolute top-2 right-2 p-1 hover:bg-neo-red hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-none">
                  <X size={16} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 border-4 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center mb-6 p-8 text-center relative overflow-hidden group hover:border-black hover:bg-white transition-all duration-300">
              {filePreview ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img src={filePreview} alt="Preview" className="max-h-48 object-contain border-4 border-black shadow-neo-sm mb-4" />
                  <button onClick={clearInput} className="flex items-center gap-2 text-xs font-bold underline decoration-2 decoration-neo-red hover:text-neo-red">REMOVE ARTIFACT</button>
                </div>
              ) : text ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <FileCode size={48} className="mb-4" />
                  <p className="font-mono text-sm whitespace-pre-wrap line-clamp-4">{text}</p>
                  <button onClick={clearInput} className="flex items-center gap-2 text-xs font-bold underline decoration-2 decoration-neo-red hover:text-neo-red mt-4">REMOVE ARTIFACT</button>
                </div>
              ) : (
                <>
                  <Upload size={48} className="mb-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                  <p className="font-black text-lg mb-2">DRAG & DROP ARTIFACT</p>
                  <p className="font-mono text-xs text-gray-500 mb-6">
                    Supported: {activeTab === ContentType.IMAGE ? 'JPG, PNG' : activeTab === ContentType.AUDIO ? 'MP3, WAV' : 'MP4, MOV'}
                  </p>
                  <label className="cursor-pointer neo-btn-secondary">
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
          <div className="flex justify-end mt-auto">
            <button
              onClick={handleScan}
              disabled={isScanning || !text}
              className="neo-btn-primary w-full md:w-auto"
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