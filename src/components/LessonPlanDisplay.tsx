/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Download, Check, Copy, Flame, Layers, Award, Sparkles } from 'lucide-react';
import { GeneratedLesson } from '../types';
import { SUBJECT_TRANSLATIONS } from '../curriculumData';

interface LessonPlanDisplayProps {
  lesson: GeneratedLesson | null;
  onExportWord: () => void;
  isExporting: boolean;
}

export const LessonPlanDisplay: React.FC<LessonPlanDisplayProps> = ({
  lesson,
  onExportWord,
  isExporting
}) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'objectives' | 'activities' | 'assessment' | 'values'>('intro');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!lesson) {
    return (
      <div id="lesson_empty_state" className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[420px] font-sans">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4 animate-pulse">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-750 mb-1">في انتظار توليد خطة التحضير بالذكاء الاصطناعي</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-0">قم بتعبئة المادة والدرس ونصوص المنهج في الصندوق المجاورة، ثم اضغط زر "تحضير الدرس بالذكاء الاصطناعي" لبدء التوليد.</p>
      </div>
    );
  }

  const handleCopyText = () => {
    let textToCopy = `تحضير درس: ${lesson.lessonTitle}\nالمادة: ${SUBJECT_TRANSLATIONS[lesson.subject]?.ar || lesson.subject}\nالمرحلة: ${lesson.stage}\n\n`;
    textToCopy += `[التمهيد]\n${lesson.introduction}\n\n`;
    textToCopy += `[الأهداف السلوكية]\n${lesson.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\n`;
    textToCopy += `[الأنشطة التعليمية]\n${lesson.activities.map((a, i) => `${i + 1}. ${a}`).join('\n')}\n\n`;
    textToCopy += `[التقويم الشامل]\n${lesson.assessment.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
    textToCopy += `[القيم والكفايات]\n${lesson.values.join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 75) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div id="lesson_plan_display" className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden font-sans">
      
      {/* Dynamic Header Box */}
      <div className="p-6 bg-slate-900 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-24 h-24 text-teal-400" />
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded-lg text-xs font-bold border border-teal-500/20">
              {SUBJECT_TRANSLATIONS[lesson.subject]?.ar || lesson.subject}
            </span>
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold border border-indigo-500/20">
              {lesson.grade}
            </span>
          </div>

          <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(lesson.score)}`}>
            <Award className="w-4 h-4" />
            <span>جودة الصياغة: {lesson.score}%</span>
          </div>
        </div>

        <h3 className="text-xl font-black mb-1.5 text-right">{lesson.lessonTitle}</h3>
        
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-350">
          <span>المعلم المستهدف: <strong>{lesson.teacherName}</strong></span>
          <span>جنس الطلاب: <strong>{lesson.studentGender === 'female' ? 'طالبات' : lesson.studentGender === 'male' ? 'طلاب' : 'مختلط'}</strong></span>
          <span>المؤسسة: <strong>وزارة التربية الرسمية</strong></span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-100 overflow-x-auto h-12 bg-slate-50">
        {[
          { key: 'intro', label: 'التمهيد وجذب الانتباه' },
          { key: 'objectives', label: 'الأهداف السلوكية (٣)' },
          { key: 'activities', label: 'الأنشطة التعليمية (٣)' },
          { key: 'assessment', label: 'التقويم والقياس (٣)' },
          { key: 'values', label: 'القيم والكفايات' }
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab_result_${tab.key}`}
              type="button"
              className={`flex-1 min-w-[120px] text-center text-xs font-bold border-b-2 transition-all whitespace-nowrap px-3 ${
                isSelected
                  ? 'border-indigo-600 bg-white text-indigo-950'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Structured Content Panel */}
      <div className="p-6 text-slate-755 leading-relaxed text-right min-h-[220px] text-sm whitespace-pre-line border-b border-slate-100">
        
        {activeTab === 'intro' && (
          <div className="space-y-2 animate-fade-in">
            <h4 className="font-bold text-slate-850 text-base mb-3 flex items-center gap-1.5 text-indigo-700">
              <Flame className="w-5 h-5 text-indigo-500" />
              التمهيد وتهيئة أذهان الطلاب للدرس
            </h4>
            <p className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl leading-loose font-sans text-slate-700">
              {lesson.introduction}
            </p>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-850 text-base mb-2 text-indigo-700">
              الأهداف السلوكية الإجرائية (Behavioral Objectives)
            </h4>
            <div className="space-y-2">
              {lesson.objectives.map((obj, i) => (
                <div key={i} className="flex gap-3 bg-indigo-50/25 border border-indigo-100/30 p-3.5 rounded-xl text-slate-700 font-sans">
                  <div className="w-6 h-6 shrink-0 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-indigo-500 ml-1">هدف إجرائي {i + 1}:</span>
                    <p className="text-sm mt-0.5 font-medium leading-relaxed">{obj}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-850 text-base mb-2 text-indigo-700">
              الأنشطة والمهام الصفية التعليمية (Learning Activities)
            </h4>
            <div className="space-y-2">
              {lesson.activities.map((act, i) => (
                <div key={i} className="flex gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-slate-700 font-sans">
                  <div className="w-6 h-6 shrink-0 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-450 ml-1">نشاط صفي {i + 1}:</span>
                    <p className="text-sm mt-0.5 leading-relaxed">{act}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-850 text-base mb-2 text-indigo-700">
              التقويم وإجراءات قياس المعرفة الأكاديمية (Assessment)
            </h4>
            <div className="space-y-2">
              {lesson.assessment.map((q, i) => (
                <div key={i} className="flex gap-3 bg-emerald-50/20 border border-emerald-100/30 p-3.5 rounded-xl text-slate-700 font-sans">
                  <div className="w-6 h-6 shrink-0 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-lg flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-emerald-600 ml-1">سؤال التقويم {i + 1}:</span>
                    <p className="text-sm mt-0.5 leading-relaxed">{q}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'values' && (
          <div className="space-y-2 animate-fade-in">
            <h4 className="font-bold text-slate-850 text-base mb-3 text-indigo-700">
              القيم والمبادئ الوجدانية والكفايات الوجدانية المكتسبة
            </h4>
            <div className="bg-amber-50/25 border border-amber-100/40 p-4 rounded-xl leading-loose font-sans text-slate-700 border-r-4 border-r-amber-500">
              {lesson.values.map((v, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-base text-amber-500 mt-0.5">✨</span>
                  <p className="text-sm font-medium leading-relaxed">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Docx Generation Action Bars */}
      <div className="p-4 bg-slate-50 flex gap-3 text-sm justify-between items-center sm:flex-row flex-col">
        <span className="text-xs text-slate-400 font-mono">
          Model: gemini-3.5-flash | Schema: LessonSchema v1.3
        </span>

        <div className="flex gap-2">
          {/* Export to word file */}
          <button
            id="btn_export_word"
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all h-9.5 cursor-pointer disabled:opacity-55"
            onClick={onExportWord}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <FileText className="w-4 h-4 animate-spin" />
                <span>جاري تصدير الملف...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>تحميل كملف Word رسمي</span>
              </>
            )}
          </button>

          {/* Copy to clipboard */}
          <button
            id="btn_copy_lesson"
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all h-9.5 cursor-pointer"
            onClick={handleCopyText}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ التحضير للذاكرة</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
