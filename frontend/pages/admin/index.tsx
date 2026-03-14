import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuthStore } from '../../lib/store/authStore';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  const [stats, setStats] = useState({ totalUsers: 0, totalVerifications: 0, revenue: 0, fakePercentage: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && user.role !== 'admin') {
      router.push('/verify');
    } else if (isAuthenticated && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isAuthenticated, user, router]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes, logsRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/users', { headers }),
        axios.get('/api/admin/logs', { headers }),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || user.role !== 'admin') {
     return (
        <div className="flex h-screen items-center justify-center font-mono uppercase font-bold tracking-widest bg-white text-black">
          LOADING_ROOT_ACCESS...
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans text-black selection:bg-black selection:text-white relative">
      <nav className="w-full bg-[#ffdddd] border-b-4 border-red-900 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-900 flex items-center justify-center font-bold text-sm bg-red-900 text-white">!</div>
          <span className="font-black text-2xl tracking-tighter uppercase text-red-900">AUTHAI_ROOT_ACCESS</span>
        </div>
        <div className="flex items-center gap-6 font-bold text-sm tracking-wide text-red-900">
          <a onClick={() => router.push('/dashboard')} className="hover:underline cursor-pointer">EXIT_ROOT</a>
          <div className="border-2 border-red-900 px-3 py-1 shadow-[4px_4px_0_0_#7f1d1d] bg-white text-xs font-mono uppercase font-bold text-red-900">
            &gt;_ ROOT: {user.name}
          </div>
          <button onClick={() => { logout(); router.push('/auth/login'); }} className="hover:underline cursor-pointer uppercase font-bold">TERMINATE</button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-12 px-4 flex flex-col">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 bg-red-900 text-white inline-block px-4 py-2 self-start border-4 border-red-900 shadow-[6px_6px_0_0_rgba(127,29,29,0.5)]">
            🛠 SYSTEM_METRICS
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white border-4 border-red-900 shadow-[8px_8px_0_0_#7f1d1d] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#7f1d1d] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2 text-red-900">GLOBAL_ENTITIES</p>
                <p className="text-4xl font-black text-red-900">{stats.totalUsers}</p>
            </div>
            <div className="bg-white border-4 border-red-900 shadow-[8px_8px_0_0_#7f1d1d] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#7f1d1d] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2 text-red-900">TOTAL_ANALYSIS_CYCLES</p>
                <p className="text-4xl font-black text-red-900">{stats.totalVerifications}</p>
            </div>
            <div className="bg-[#ddffdd] border-4 border-red-900 shadow-[8px_8px_0_0_#7f1d1d] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#7f1d1d] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2 text-red-900">NET_REVENUE</p>
                <p className="text-4xl font-black text-green-800">₹{stats.revenue}</p>
            </div>
            <div className="bg-[#ffdddd] border-4 border-red-900 shadow-[8px_8px_0_0_#7f1d1d] p-6 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#7f1d1d] transition-all">
                <p className="font-mono text-xs font-bold tracking-widest uppercase mb-2 text-red-900">SYNTHETIC_DETECTION_RATE</p>
                <p className="text-4xl font-black text-red-600">{stats.fakePercentage}%</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border-4 border-red-900 shadow-[12px_12px_0_0_#7f1d1d] flex flex-col max-h-[600px]">
                <div className="border-b-4 border-red-900 p-4 bg-[#ffdddd]">
                    <h2 className="font-black uppercase tracking-widest text-xl text-red-900">ACTIVE_ENTITIES</h2>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-[-1rem] bg-white z-10 border-b-2 border-red-900">
                            <tr className="font-mono text-xs uppercase text-red-900">
                                <th className="py-2">ENTITY_ID</th>
                                <th className="py-2">CONTACT</th>
                                <th className="py-2">CREDITS</th>
                                <th className="py-2">RANK</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-sm">
                            {users.map(u => (
                                <tr key={u._id} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                                    <td className="py-3 pr-2 truncate max-w-[120px] font-bold">{u.name || 'UNKNOWN'}</td>
                                    <td className="py-3 pr-2 truncate max-w-[140px] text-xs">{u.email}</td>
                                    <td className="py-3 pr-2 font-black">₹{u.wallet}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 text-xs font-bold uppercase border-2 ${
                                            u.role === 'admin' ? 'bg-red-900 text-white border-red-900' : 'bg-gray-200 text-black border-black'
                                        }`}>
                                            {u.role || 'USER'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-red-900 font-bold tracking-widest">NO_DATA</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border-4 border-red-900 shadow-[12px_12px_0_0_#7f1d1d] flex flex-col max-h-[600px]">
                <div className="border-b-4 border-red-900 p-4 bg-[#ffdddd]">
                    <h2 className="font-black uppercase tracking-widest text-xl text-red-900">SYSTEM_LOGS</h2>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-[-1rem] bg-white z-10 border-b-2 border-red-900">
                            <tr className="font-mono text-xs uppercase text-red-900">
                                <th className="py-2">TIMESTAMP</th>
                                <th className="py-2">USER_NODE</th>
                                <th className="py-2">RESULT</th>
                                <th className="py-2">SCORE</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-sm">
                            {logs.map(log => (
                                <tr key={log._id} className="border-b border-gray-200 hover:bg-red-50 transition-colors">
                                    <td className="py-3 pr-2 text-xs">{new Date(log.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 pr-2 truncate max-w-[120px] text-xs">{log.userId?.email || 'N/A'}</td>
                                    <td className="py-3 pr-2">
                                        <span className={`px-2 py-1 font-bold text-[10px] tracking-widest border-2 border-black ${
                                            log.classification.includes('Human') ? 'bg-[#ddffdd] text-green-900' : 'bg-[#ffdddd] text-red-900'
                                        }`}>
                                            {log.classification.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-3 font-black">{log.aiScore}%</td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-red-900 font-bold tracking-widest">NO_LOGS_DETECTED</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
