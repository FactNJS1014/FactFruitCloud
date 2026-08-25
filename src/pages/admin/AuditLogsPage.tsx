import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { History, Search, Shield, User, Clock, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (actionFilter !== 'ALL') params.append('action', actionFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) setLogs(json.data);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, token]);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase()) ||
      l.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          บันทึกการทำงานของระบบ (Audit Logs)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ประวัติการทำรายการ การปรับสต็อก การเปลี่ยนสถานะออเดอร์ และการจัดการโดยผู้ดูแลระบบ
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          {['ALL', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'ORDER_UPDATE', 'STOCK_ADJUST', 'USER_ROLE_CHANGE'].map(
            (act) => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  actionFilter === act
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {act === 'ALL' ? 'ทั้งหมด' : act}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาข้อความ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">กำลังโหลดบันทึกการทำงาน...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">ไม่พบบันทึกการทำงาน</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">วัน-เวลา</th>
                  <th className="py-3 px-4">ผู้ดำเนินการ</th>
                  <th className="py-3 px-4">การกระทำ (Action)</th>
                  <th className="py-3 px-4">รายละเอียด</th>
                  <th className="py-3 px-4">เป้าหมาย (Entity)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString('th-TH')}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{l.userName || 'ระบบ (System)'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {l.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {l.details || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {l.entity ? `${l.entity} (${l.entityId?.slice(0, 8)})` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
