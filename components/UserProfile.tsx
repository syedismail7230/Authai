import React from 'react';
import { User, Clock, ShieldCheck, CreditCard, LogOut } from 'lucide-react';

interface UserProfileProps {
  email: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ email, onLogout }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-4 border-neo-black pb-6 gap-4">
            <div>
                <div className="inline-flex items-center gap-2 bg-neo-black text-white px-3 py-1 font-mono text-xs font-bold mb-2">
                    <User size={12} /> STANDARD_USER
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">My Account</h1>
                <p className="font-mono text-gray-500">{email}</p>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm font-bold border-2 border-neo-black px-4 py-2 hover:bg-neo-red hover:text-white transition-colors"
            >
                <LogOut size={16} /> DISCONNECT
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-4 border-neo-black p-6 shadow-neo">
                <h3 className="font-bold text-gray-500 text-xs mb-1">AVAILABLE CREDITS</h3>
                <p className="text-4xl font-black">12</p>
                <button className="mt-4 text-xs font-bold underline">TOP UP</button>
            </div>
            <div className="bg-white border-4 border-neo-black p-6 shadow-neo">
                <h3 className="font-bold text-gray-500 text-xs mb-1">CERTIFICATES ISSUED</h3>
                <p className="text-4xl font-black">03</p>
            </div>
            <div className="bg-neo-green border-4 border-neo-black p-6 shadow-neo">
                <h3 className="font-bold text-neo-black/70 text-xs mb-1">ACCOUNT STATUS</h3>
                <p className="text-4xl font-black text-white">ACTIVE</p>
            </div>
        </div>

        {/* History */}
        <div className="bg-white border-4 border-neo-black shadow-neo">
            <div className="bg-neo-grey p-4 border-b-2 border-neo-black font-bold flex items-center gap-2">
                <Clock size={18} /> RECENT VERIFICATIONS
            </div>
            <div className="divide-y-2 divide-neo-black/10">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                            <div className="bg-neo-black text-white p-2">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">AUTH-882X-M{i}</p>
                                <p className="font-mono text-xs text-gray-500">2024-10-2{i} • TEXT ANALYSIS</p>
                            </div>
                        </div>
                        <span className="font-bold text-xs bg-neo-green/20 text-neo-green px-2 py-1 border border-neo-green">
                            VERIFIED
                        </span>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-neo-grey text-center">
                <button className="text-xs font-mono font-bold hover:underline">VIEW FULL HISTORY</button>
            </div>
        </div>
    </div>
  );
};

export default UserProfile;