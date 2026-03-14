import React from 'react';
import { User, Clock, ShieldCheck, CreditCard, LogOut, Zap, Award } from 'lucide-react';

import { supabase } from '../services/supabaseClient';
import { getUserPaymentHistory } from '../services/geminiService';

interface UserProfileProps {
    email: string;
    credits: number;
    onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ email, credits, onLogout }) => {
    const [history, setHistory] = React.useState<any[]>([]);
    const [payments, setPayments] = React.useState<any[]>([]);

    React.useEffect(() => {
        // Fetch Cert History
        const fetchHistory = async () => {
            const { data } = await supabase.from('certificates').select('*').eq('owner', email);
            if (data) setHistory(data);

            const pays = await getUserPaymentHistory(email);
            setPayments(pays);
        };
        fetchHistory();
    }, [email]);

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b-4 border-black gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-mono text-xs font-bold mb-3 uppercase tracking-wider">
                        <User size={12} strokeWidth={3} /> Standard_Account
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2">My Access</h1>
                    <p className="font-mono text-gray-500 font-bold">{email}</p>
                </div>
                <button
                    onClick={onLogout}
                    className="group bg-white border-2 border-black px-6 py-3 font-bold hover:bg-neo-red hover:text-white transition-all shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center gap-2"
                >
                    <LogOut size={18} strokeWidth={2.5} /> TERMINATE SESSION
                </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Credits Card */}
                <div className="neo-card p-6 bg-neo-yellow relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity transform rotate-12">
                        <Zap size={100} />
                    </div>
                    <h3 className="font-black text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Zap size={16} /> Available Credits
                    </h3>
                    <p className="text-6xl font-black mb-4">{credits}</p>
                    <button className="bg-black text-white px-4 py-2 font-bold text-xs hover:bg-white hover:text-black border-2 border-black transition-colors uppercase tracking-wider">
                        + Add Credits
                    </button>
                </div>

                {/* Certificates Card */}
                <div className="neo-card p-6 bg-white relative overflow-hidden">
                    <h3 className="font-black text-sm mb-2 uppercase tracking-wide flex items-center gap-2 opacity-60">
                        <Award size={16} /> Minted Certificates
                    </h3>
                    <p className="text-6xl font-black opacity-30">{history.length.toString().padStart(2, '0')}</p>
                    <div className="mt-4 font-mono text-xs border-t-2 border-gray-100 pt-2 text-gray-400">
                        LIFETIME ISSUANCE
                    </div>
                </div>

                {/* Status Card */}
                <div className="neo-card p-6 bg-neo-green relative overflow-hidden">
                    <h3 className="font-black text-sm mb-2 uppercase tracking-wide flex items-center gap-2 text-black/70">
                        <ShieldCheck size={16} /> Protocol Status
                    </h3>
                    <p className="text-5xl font-black text-white uppercase break-all">ACTIVE</p>
                    <div className="absolute bottom-4 right-4 animate-pulse">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* History Feed */}
            <div className="neo-card p-0 overflow-hidden bg-white">
                <div className="bg-gray-50 p-6 border-b-4 border-black flex items-center justify-between">
                    <h2 className="font-black text-xl uppercase flex items-center gap-3">
                        <Clock size={24} strokeWidth={2.5} /> Verification Log
                    </h2>
                    <span className="font-mono text-xs bg-black text-white px-2 py-1">LAST 30 DAYS</span>
                </div>

                <div className="divide-y-2 divide-black">
                    {history.length === 0 ? (
                        <div className="p-8 text-center font-mono text-gray-400">NO HISTORY FOUND</div>
                    ) : (
                        history.map((cert) => (
                            <div key={cert.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-yellow-50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-black text-white p-3 border-2 border-transparent group-hover:border-black shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg uppercase">{cert.id}</p>
                                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500 mt-1">
                                            <span>{new Date(cert.issue_date || cert.issueDate).toLocaleDateString()}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="uppercase">{cert.verdict}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <span className="font-bold text-xs bg-neo-green/20 text-neo-green-dark border-2 border-neo-green px-3 py-1 uppercase tracking-wide">
                                        {cert.verdict}
                                    </span>
                                    <button className="font-mono text-xs font-bold underline decoration-2 hover:text-neo-red uppercase">
                                        View
                                    </button>
                                </div>
                            </div>
                        )))}
                </div>

                <div className="p-4 bg-gray-50 border-t-4 border-black text-center group cursor-pointer hover:bg-black transition-colors">
                    <p className="font-black text-xs uppercase tracking-widest group-hover:text-white transition-colors">
                        Load Complete History Archive +
                    </p>
                </div>
            </div>

            {/* Payment History */}
            <div className="mt-12 neo-card p-6 bg-white">
                <h2 className="font-black text-xl uppercase flex items-center gap-3 mb-6">
                    <CreditCard size={24} strokeWidth={2.5} /> Billing History
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-sm">
                        <thead className="bg-black text-white uppercase text-xs">
                            <tr>
                                <th className="p-3">Ref ID</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id} className="border-b border-black/10 hover:bg-gray-50">
                                    <td className="p-3 font-bold">{p.id}</td>
                                    <td className="p-3">{p.date}</td>
                                    <td className="p-3">{p.amount}</td>
                                    <td className="p-3 text-neo-green font-bold">{p.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;