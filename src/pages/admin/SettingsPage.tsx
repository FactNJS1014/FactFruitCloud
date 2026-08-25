import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Settings, Store, Phone, Mail, MapPin, QrCode, Clock, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState({
    storeName: 'FactFruit ตลาดผลไม้พรีเมียม',
    description: 'ระบบจัดการขายและสั่งจองผลไม้พรีเมียม คัดสรรสดใหม่ส่งตรงจากสวน',
    phone: '02-888-9999, 081-234-5678',
    email: 'contact@factfruit.com',
    address: '123 ตลาดผลไม้พรีเมียม ถ.สุขุมวิท กรุงเทพฯ 10110',
    promptpayNumber: '0812345678',
    promptpayName: 'บจก. แฟคท์ฟรุต กรุ๊ป',
    openingHours: '08:00 - 20:00 น. (เปิดบริการทุกวัน)',
    autoConfirm: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setSettings((prev) => ({ ...prev, ...json.data }));
      })
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok) {
        error(json.error || 'ไม่สามารถบันทึกการตั้งค่าได้');
        return;
      }

      success('บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว');
    } catch (e) {
      error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          ตั้งค่าร้านค้าและระบบ (Store Settings)
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          กำหนดชื่อร้าน ข้อมูลการติดต่อ ข้อมูลพร้อมเพย์สำหรับรับชำระ และเวลาทำการ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>ข้อมูลทั่วไปของร้านค้า</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ชื่อร้านค้า *
              </label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                เวลาทำการ (Opening Hours)
              </label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              คำอธิบายร้านค้า
            </label>
            <textarea
              rows={2}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>ช่องทางการติดต่อและที่อยู่ร้าน</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                อีเมลติดต่อ
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              ที่อยู่หน้าร้าน (จุดรับสินค้า)
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Payment & PromptPay */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>ข้อมูลการชำระเงิน (พร้อมเพย์ PromptPay)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                หมายเลขพร้อมเพย์ (PromptPay No.)
              </label>
              <input
                type="text"
                value={settings.promptpayNumber}
                onChange={(e) => setSettings({ ...settings, promptpayNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                ชื่อบัญชีผู้รับเงิน
              </label>
              <input
                type="text"
                value={settings.promptpayName}
                onChange={(e) => setSettings({ ...settings, promptpayName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าร้านค้า</span>
          </button>
        </div>
      </form>
    </div>
  );
};
