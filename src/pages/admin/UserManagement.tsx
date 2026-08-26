import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Users, Shield, UserCheck, Search, Check, Lock, Ban } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dialog State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogAction, setDialogAction] = useState<'ROLE' | 'STATUS' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers(token);
      if (data) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleToggleRole = async () => {
    if (!selectedUser) return;
    const newRole: Role = selectedUser.role === 'ADMIN' ? 'USER' : 'ADMIN';

    try {
      setIsProcessing(true);
      await api.updateUserRole(token, selectedUser.id, newRole);

      success(`เปลี่ยนสิทธิ์ "${selectedUser.firstName}" เป็น ${newRole} สำเร็จ`);
      setDialogAction(null);
      fetchUsers();
    } catch (e) {
      error('เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const newStatus = selectedUser.isActive !== false ? false : true;

    try {
      setIsProcessing(true);
      await api.updateUserStatus(token, selectedUser.id, newStatus);

      success(`เปลี่ยนสถานะบัญชี "${selectedUser.firstName}" เป็น ${newStatus ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'} สำเร็จ`);
      setDialogAction(null);
      fetchUsers();
    } catch (e) {
      error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          จัดการผู้ใช้งานระบบ (Users Management)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ตรวจสอบรายชื่อสมาชิก จัดการสิทธิ์การใช้งาน (ADMIN / USER) และสถานะบัญชี
        </p>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span>ผู้ใช้งานทั้งหมด: <strong className="text-slate-900 dark:text-white">{users.length}</strong> คน</span>
          <span>ผู้ดูแลระบบ (Admin): <strong className="text-emerald-600">{users.filter((u) => u.role === 'ADMIN').length}</strong> คน</span>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, หรือเบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">กำลังโหลดรายชื่อผู้ใช้...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">ไม่พบรายชื่อผู้ใช้ที่ตรงกับคำค้นหา</div>
        ) : (
          <>
            {/* Mobile Card List (Screen < md) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {u.firstName} {u.lastName}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] text-emerald-600 font-bold">(คุณ)</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono block">{u.email}</span>
                          {u.phone && <span className="text-xs text-slate-500 block">{u.phone}</span>}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          u.isActive !== false
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {u.isActive !== false ? 'ปกติ' : 'ถูกระงับ'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setDialogAction('ROLE');
                          }}
                          disabled={isSelf}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-30"
                        >
                          สลับสิทธิ์
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setDialogAction('STATUS');
                          }}
                          disabled={isSelf}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 ${
                            u.isActive !== false
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.isActive !== false ? 'ระงับ' : 'ปลดล็อค'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Screen >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                    <th className="py-3.5 px-4">อีเมล (Email)</th>
                    <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                    <th className="py-3.5 px-4">สิทธิ์การใช้งาน</th>
                    <th className="py-3.5 px-4">สถานะบัญชี</th>
                    <th className="py-3.5 px-4">วันที่สมัคร</th>
                    <th className="py-3.5 px-4 text-right">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                              {u.firstName[0]}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {u.firstName} {u.lastName}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] text-emerald-600 font-bold">(บัญชีของคุณ)</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                          {u.email}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {u.phone || '-'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.isActive !== false
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {u.isActive !== false ? 'ปกติ' : 'ถูกระงับ'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString('th-TH')}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setDialogAction('ROLE');
                              }}
                              disabled={isSelf}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
                              title="สลับสิทธิ์ Admin / User"
                            >
                              สลับสิทธิ์
                            </button>

                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setDialogAction('STATUS');
                              }}
                              disabled={isSelf}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 ${
                                u.isActive !== false
                                  ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                              }`}
                              title="เปิด/ระงับบัญชี"
                            >
                              {u.isActive !== false ? 'ระงับ' : 'ปลดแบน'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Role Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogAction === 'ROLE'}
        title="ยืนยันการเปลี่ยนสิทธิ์ผู้ใช้งาน"
        message={`คุณต้องการเปลี่ยนสิทธิ์ของ "${selectedUser?.firstName} ${selectedUser?.lastName}" ให้เป็น ${
          selectedUser?.role === 'ADMIN' ? 'USER (ลูกค้าทั่วไป)' : 'ADMIN (ผู้ดูแลระบบ)'
        } ใช่หรือไม่?`}
        confirmText="ยืนยันเปลี่ยนสิทธิ์"
        cancelText="ยกเลิก"
        variant="primary"
        isLoading={isProcessing}
        onConfirm={handleToggleRole}
        onCancel={() => setDialogAction(null)}
      />

      {/* Status Toggle Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogAction === 'STATUS'}
        title={selectedUser?.isActive !== false ? 'ยืนยันการระงับการใช้งานบัญชี' : 'ยืนยันการเปิดใช้งานบัญชี'}
        message={`คุณต้องการ${
          selectedUser?.isActive !== false ? 'ระงับการเข้าสู่ระบบของ' : 'เปิดใช้งานบัญชีของ'
        } "${selectedUser?.firstName} ${selectedUser?.lastName}" ใช่หรือไม่?`}
        confirmText={selectedUser?.isActive !== false ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
        cancelText="ยกเลิก"
        variant={selectedUser?.isActive !== false ? 'danger' : 'primary'}
        isLoading={isProcessing}
        onConfirm={handleToggleStatus}
        onCancel={() => setDialogAction(null)}
      />
    </div>
  );
};
