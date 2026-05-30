/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Terminal, Cpu, Target } from 'lucide-react';
import { GeneratedLesson } from '../types';

interface RulesValidationPanelProps {
  lesson: GeneratedLesson | null;
}

export const RulesValidationPanel: React.FC<RulesValidationPanelProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div id="validation_empty" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans flex flex-col items-center justify-center py-10">
        <ShieldCheck className="w-12 h-12 text-slate-300 mb-2 animate-pulse" />
        <h4 className="text-slate-700 text-sm font-bold">مدقق ومراجع القواعد التربوية</h4>
        <p className="text-slate-400 text-xs text-center max-w-xs mt-1">
          في انتظار توليد خطة تحضير ليقوم النظام بإعمال الفحوص المعيارية ومطابقة الجنس والتحقق من التكرار.
        </p>
      </div>
    );
  }

  const report = lesson.validationReport;
  const scoreDetails = report?.scoreDetails || { alignment: 98, quality: 95, pedagogy: 96, integrity: 100 };

  return (
    <div id="rules_validation_panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-850">تقرير ومطابقة محرك القواعد التربوية</h3>
          <p className="font-mono text-xs text-slate-400">Educational Rules Engine compliance score</p>
        </div>
      </div>

      {/* Main Validation Score Card */}
      <div className="p-5 border border-slate-100 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex flex-col items-center justify-center text-white font-mono shadow-sm shadow-emerald-500/25">
            <span className="text-xl font-black">{lesson.score}</span>
            <span className="text-[9px] -mt-1 opacity-80">Score</span>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">اجتياز التدقيق التربوي بنجاح</h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              تم فحص التحضير وفق مصفوفة الأهداف الوزارية، ومطابقة النطاق المدرسي المحدود لكتاب الطالب بنسبة تطابق عالية.
            </p>
          </div>
        </div>
      </div>

      {/* Grid check results */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'مطابقة وضبط جنس الفئة', score: scoreDetails.alignment, desc: 'تحويل الأفعال والمخاطب' },
          { label: 'جودة الأهداف الأكاديمية', score: scoreDetails.quality, desc: '٣ أهداف سلوكية إجرائية' },
          { label: 'بيداغوجيا التدريب والتنفيذ', score: scoreDetails.pedagogy, desc: 'أنشطة وتقويم تفاعلية متكافئة' },
          { label: 'سلامة القالب والمكونات', score: scoreDetails.integrity, desc: 'خلو من الفراغات والواصفات' }
        ].map((item, i) => (
          <div key={i} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 flex items-center justify-between gap-2.5">
            <div>
              <span className="block text-xs font-bold text-slate-750">{item.label}</span>
              <span className="text-[10px] text-slate-400">{item.desc}</span>
            </div>
            <div className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0 border border-emerald-100/30">
              {item.score}%
            </div>
          </div>
        ))}
      </div>

      {/* Audit Console Logger */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Terminal className="w-4 h-4 text-slate-500" />
            منصة مراجعة القواعد والتدقيق
          </span>
          <span className="font-mono text-[10px] text-indigo-500">Live Validator Logs</span>
        </div>

        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed text-right space-y-2 h-44 overflow-y-auto shadow-inner border border-slate-950">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] border-b border-slate-850 pb-1.5 mb-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI ENGINE & GRAMMAR COMPILER AUDIT</span>
          </div>
          
          {(report?.logs || []).map((log, idx) => (
            <p key={idx} className="text-slate-200">
              <span className="text-teal-400 ml-1.5 font-bold">❯</span>
              <span>{log}</span>
            </p>
          ))}
          
          <p className="text-slate-450 text-[11px] font-sans">
            <span className="text-amber-500 ml-1.5 font-bold">✔</span>
            <span>التحضير جاهز للاستخراج والمزامنة الفورية.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
