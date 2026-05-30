/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Award, Layers, Users, Zap, ShieldCheck } from 'lucide-react';
import { TeacherProfile } from '../types';

interface TeacherProfileCardProps {
  profile: TeacherProfile;
  onChangeProfile: (updated: Partial<TeacherProfile>) => void;
}

export const TeacherProfileCard: React.FC<TeacherProfileCardProps> = ({ profile, onChangeProfile }) => {
  return (
    <div id="teacher_profile_card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Decorative Top Bar Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-850">الملف الشخصي للمعلم</h3>
          <p className="font-mono text-xs text-slate-400">Teacher Profile & Licensing</p>
        </div>
      </div>

      <div className="space-y-4 font-sans text-sm">
        {/* Teacher Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">اسم المعلم بالكامل</label>
          <input
            id="input_profile_name"
            type="text"
            className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-right h-10"
            value={profile.name}
            onChange={(e) => onChangeProfile({ name: e.target.value })}
            placeholder="مثال: د. معمر الخالدي"
          />
        </div>

        {/* Binary Genders Choice */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">جنس المعلم</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden h-10">
              <button
                id="btn_gender_male"
                type="button"
                className={`flex-1 text-xs font-semibold transition-all ${
                  profile.gender === 'male' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => onChangeProfile({ gender: 'male' })}
              >
                معلم
              </button>
              <button
                id="btn_gender_female"
                type="button"
                className={`flex-1 text-xs font-semibold transition-all ${
                  profile.gender === 'female' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => onChangeProfile({ gender: 'female' })}
              >
                معلمة
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">فئة الطلاب</label>
            <select
              id="select_students_gender"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all h-10 appearance-none text-center"
              value={profile.studentGender}
              onChange={(e) => onChangeProfile({ studentGender: e.target.value as any })}
            >
              <option value="male">بنين (طلاب)</option>
              <option value="female">بنات (طالبات)</option>
              <option value="both">مختلط (بنين/بنات)</option>
            </select>
          </div>
        </div>

        {/* Selected Stage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">المرحلة الأساسية</label>
            <select
              id="select_primary_stage"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all h-10 appearance-none text-center"
              value={profile.stage}
              onChange={(e) => onChangeProfile({ stage: e.target.value as any })}
            >
              <option value="elementary">الابتدائية</option>
              <option value="intermediate">المتوسطة</option>
              <option value="secondary">الثانوية</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">باقة الاشتراك</label>
            <select
              id="select_subscription_plan"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-750 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all h-10 appearance-none text-center"
              value={profile.plan}
              onChange={(e) => {
                const planValue = e.target.value as 'basic' | 'pro' | 'expert';
                const limits = { basic: 10, pro: 20, expert: 40 };
                onChangeProfile({
                  plan: planValue,
                  lessonsLimit: limits[planValue]
                });
              }}
            >
              <option value="basic">الأساسية (10 تحاضير)</option>
              <option value="pro">المحترفة (20 تحضيراً)</option>
              <option value="expert">الخبير (40 تحضيراً)</option>
            </select>
          </div>
        </div>

        {/* Subscription Limits Meter */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-2">
            <span>التحاضير المتبقية في الرصيد</span>
            <span className="font-mono text-slate-800 font-bold">{profile.lessonsLimit - profile.lessonsUsed} من {profile.lessonsLimit}</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                (profile.lessonsUsed / profile.lessonsLimit) > 0.85 ? 'bg-rose-500' : 'bg-teal-500'
              }`}
              style={{ width: `${(profile.lessonsUsed / profile.lessonsLimit) * 100}%` }}
            ></div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-50/60 text-teal-800 rounded-xl text-xs border border-teal-100/50">
            <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600" />
            <span>يتم تصفير واستعادة العداد شهرياً في موعد التجديد التلقائي للباقة.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
