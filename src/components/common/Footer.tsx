import React from 'react';
import { Phone, Mail, MapPin, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍓</span>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                Fact<span className="text-emerald-600 dark:text-emerald-400">Fruit</span>
              </span>
            </div>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              ระบบจัดการขายและสั่งจองผลไม้พรีเมียม สดใหม่ส่งตรงจากสวน พร้อมระบบบริหารจัดการสำหรับแอดมินและผู้ใช้งาน
            </p>
          </div>

          {/* Col 2: Highlights */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              จุดเด่นของเรา
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>ผลไม้คัดเกรด A สดใหม่ทุกวัน</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>สั่งจองล่วงหน้าและระบุเวลาได้</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-500" />
                <span>รับประกันความพึงพอใจ 100%</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              หมวดหมู่ยอดนิยม
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>ผลไม้ไทยคัดพิเศษ</li>
              <li>ผลไม้นำเข้าเกรดพรีเมียม</li>
              <li>ผลไม้ตามฤดูกาล</li>
              <li>ผลไม้ราคาประหยัด</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              ติดต่อเรา
            </h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>123 ตลาดผลไม้พรีเมียม ถ.สุขุมวิท กรุงเทพฯ 10110</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>02-888-9999, 081-234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>contact@factfruit.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-400">
          <p>© 2026 FactFruit Fruit Ordering Management System. All rights reserved.</p>
          <p className="text-[11px]">ระบบจัดการขายและสั่งจองผลไม้ Full-Stack</p>
        </div>
      </div>
    </footer>
  );
};
