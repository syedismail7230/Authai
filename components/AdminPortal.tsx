import React, { useEffect, useState } from 'react';
import { Activity, DollarSign, Users, AlertOctagon, MoreHorizontal, ArrowUpRight, Cpu, Server, Lock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

const AdminPortal: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [revenue, setRevenue] = useState(124000);
  const [scans, setScans] = useState(84392);
  const [cpuLoad, setCpuLoad] = useState(42);
  
  // Real-time Simulation Effect
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
        // Randomly fluctuate stats
        if (Math.random() > 0.7) setRevenue(prev => prev + Math.floor(Math.random() * 500));
        if (Math.random() > 0.6) setScans(prev => prev + 1);
        setCpuLoad(prev => Math.min(100, Math.max(10, prev + (Math.random() * 10 - 5))));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const serverLogs = [
    { time: '10:00:01', msg: 'Auth token validated for USER_X92', status: 'OK' },
    { time: '10:00:05', msg: 'New payment webhook received: razorpay_order_id_22', status: 'OK' },
    { time: '10:00:12', msg: 'High entropy detected in scan #8821', status: 'WARN' },
    { time: '10:00:18', msg: 'Database backup started...', status: 'INFO' },
  ];

  const recentActivity = [
    { id: 'AUTH-92X', type: 'TEXT', verdict: 'AI_GENERATED', user: 'user_882@gmail.com', time: '2s ago' },
    { id: 'AUTH-B12', type: 'IMAGE', verdict: 'HUMAN', user: 'pro_studio_xx', time: '12s ago' },
    { id: 'AUTH-C99', type: 'AUDIO', verdict: 'UNCERTAIN', user: 'anonymous', time: '45s ago' },
    { id: 'AUTH-X77', type: 'TEXT', verdict: 'AI_ASSISTED', user: 'content_farm_01', time: '1m ago' },
    { id: 'AUTH-A01', type: 'CODE', verdict: 'HUMAN', user: 'dev_ops_ninja', time: '2m ago' },
  ];

  const chartData = [
    { name: 'Mon', amt: 4000 },
    { name: 'Tue', amt: 3000 },
    { name: 'Wed', amt: 2000 },
    { name: 'Thu', amt: 2780 },
    { name: 'Fri', amt: 1890 },
    { name: 'Sat', amt: 2390 },
    { name: 'Sun', amt: 3490 },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-4 border-neo-black pb-4 gap-4">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-neo-red text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                    Live Environment
                </span>
                <span className="font-mono text-xs text-gray-500">
                    {currentTime.toUTCString()}
                </span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3">
                <Lock size={32} /> Admin Command
            </h1>
            <p className="font-mono text-sm text-gray-600">
                ROOT_ACCESS // NODE_882_MASTER
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-gray-500">Server Load</p>
                <div className="w-32 h-2 bg-neo-grey border border-neo-black mt-1">
                    <div 
                        className={`h-full transition-all duration-500 ${cpuLoad > 80 ? 'bg-neo-red' : 'bg-neo-green'}`} 
                        style={{ width: `${cpuLoad}%` }}
                    ></div>
                </div>
            </div>
            <div className="bg-neo-black text-neo-green p-3 font-mono text-xs border-2 border-neo-green shadow-[4px_4px_0_0_#00cc66]">
                <div className="flex items-center gap-2">
                    <Server size={14} /> SYS_OK
                </div>
            </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-neo-black text-white shadow-neo border-4 border-neo-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Users size={64} />
            </div>
            <p className="font-mono text-xs font-bold opacity-70 mb-2">TOTAL SCANS</p>
            <p className="text-4xl font-black">{scans.toLocaleString()}</p>
            <p className="text-xs font-mono text-neo-green mt-2 flex items-center gap-1">
                <ArrowUpRight size={12} /> LIVE UPDATING
            </p>
        </div>

        <div className="p-6 bg-neo-green text-neo-black shadow-neo border-4 border-neo-black">
            <p className="font-mono text-xs font-bold opacity-70 mb-2">REVENUE (INR)</p>
            <p className="text-4xl font-black">₹{revenue.toLocaleString()}</p>
            <p className="text-xs font-mono mt-2 font-bold">+12% THIS WEEK</p>
        </div>

        <div className="p-6 bg-white text-neo-black shadow-neo border-4 border-neo-black col-span-1 md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <p className="font-mono text-xs font-bold opacity-70">WEEKLY VOLUME</p>
                <Activity size={16} />
            </div>
            <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <Bar dataKey="amt" fill="#000000" />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ background: '#fff', border: '2px solid #000', fontFamily: 'monospace' }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Scans Table */}
          <div className="lg:col-span-2 bg-white border-4 border-neo-black shadow-neo">
            <div className="p-4 border-b-4 border-neo-black bg-neo-grey flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                    <Cpu size={18} /> REAL-TIME FEED
                </h3>
                <span className="w-2 h-2 bg-neo-red rounded-full animate-ping"></span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full font-mono text-sm text-left">
                    <thead className="bg-neo-black text-white text-xs">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">TYPE</th>
                            <th className="p-3">VERDICT</th>
                            <th className="p-3">USER</th>
                            <th className="p-3 text-right">TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map((scan, i) => (
                            <tr key={i} className="border-b-2 border-gray-100 hover:bg-neo-yellow/10 transition-colors">
                                <td className="p-3 font-bold">{scan.id}</td>
                                <td className="p-3"><span className="border border-black px-1 text-[10px] bg-white">{scan.type}</span></td>
                                <td className="p-3">
                                    <span className={`font-bold text-xs ${
                                        scan.verdict === 'HUMAN' ? 'text-neo-green' : 
                                        scan.verdict.includes('AI') ? 'text-neo-red' : 'text-gray-500'
                                    }`}>
                                        {scan.verdict}
                                    </span>
                                </td>
                                <td className="p-3 text-xs text-gray-600 truncate max-w-[100px]">{scan.user}</td>
                                <td className="p-3 text-right text-xs text-gray-400">{scan.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-neo-black text-neo-green border-4 border-neo-black shadow-neo p-4 font-mono text-xs flex flex-col">
             <div className="mb-4 flex items-center gap-2 border-b border-neo-green/30 pb-2">
                <Server size={14} /> SYSTEM_KERNEL_LOGS
             </div>
             <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] scrollbar-hide">
                {serverLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 font-mono">
                        <span className="opacity-50">[{log.time}]</span>
                        <span className="flex-1">{log.msg}</span>
                    </div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
             <div className="mt-4 pt-4 border-t border-neo-green/30">
                <div className="flex justify-between items-center text-[10px] opacity-70">
                    <span>UPTIME: 99.98%</span>
                    <span>MEM: 12GB / 64GB</span>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AdminPortal;