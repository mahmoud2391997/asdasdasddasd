/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, FileText, Upload, RefreshCw } from 'lucide-react';
import { CURRICULUM_DATA, SUBJECT_TRANSLATIONS, STAGE_TRANSLATIONS } from '../curriculumData';
import { LessonContent } from '../types';

interface CurriculumSelectorProps {
  currentStage: 'elementary' | 'intermediate' | 'secondary';
  onSelectionChange: (selection: {
    subject: string;
    grade: string;
    semester: string;
    unit: string;
    lessonTitle: string;
    bookContent: string;
  }) => void;
  isGenerating: boolean;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  currentStage,
  onSelectionChange,
  isGenerating
}) => {
  const [subject, setSubject] = useState<string>('mathematics');
  const [grade, setGrade] = useState<string>('');
  const [semester, setSemester] = useState<string>('الفصل الدراسي الأول');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Fetch lessons based on current stage and chosen subject
  const currentLessons: LessonContent[] =
    CURRICULUM_DATA[currentStage]?.[subject] || [];

  // Reset selected lesson when current lessons list updates
  useEffect(() => {
    if (currentLessons.length > 0) {
      setSelectedLessonId(currentLessons[0].id);
      setIsCustomMode(false);
      setCustomTitle('');
      setCustomText('');
    } else {
      setIsCustomMode(true);
    }
  }, [subject, currentStage]);

  // Propagate updates up to App component
  useEffect(() => {
    if (isCustomMode) {
      onSelectionChange({
        subject,
        grade: grade || (currentStage === 'elementary' ? 'الصف الثالث الابتدائي' : currentStage === 'intermediate' ? 'الصف الأول المتوسط' : 'الصف الأول الثانوي'),
        semester,
        unit: 'وحدة مخصصة (إدخال يدوي)',
        lessonTitle: customTitle || 'عنوان مخصص',
        bookContent: customText || 'يرجى إدخال محتوى الدرس في الصندوق الجانبي لبناء التوليد والتحليل التربوي.'
      });
    } else if (selectedLessonId) {
      const found = currentLessons.find((l) => l.id === selectedLessonId);
      if (found) {
        onSelectionChange({
          subject,
          grade: found.grade,
          semester: found.semester,
          unit: found.unit,
          lessonTitle: found.title,
          bookContent: found.content
        });
      }
    }
  }, [subject, selectedLessonId, isCustomMode, customTitle, customText, grade, semester, currentStage]);

  // Set default grade option matching stage
  useEffect(() => {
    if (currentStage === 'elementary') {
      setGrade('الصف الثالث الابتدائي');
    } else if (currentStage === 'intermediate') {
      setGrade('الصف الأول المتوسط');
    } else {
      setGrade('الصف الأول الثانوي');
    }
  }, [currentStage]);

  return (
    <div id="curriculum_selector" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans text-lg font-bold text-slate-850">محددات ومحتويات الدرس</h3>
          <p className="font-mono text-xs text-slate-400">Curriculum & Handbooks Catalog ({STAGE_TRANSLATIONS[currentStage]})</p>
        </div>
      </div>

      {/* Subject Tabs Selector */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 mb-2">اختر المادة الدراسية</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(SUBJECT_TRANSLATIONS).map(([key, item]) => {
            const isSelected = subject === key;
            return (
              <button
                key={key}
                id={`btn_subject_${key}`}
                type="button"
                className={`py-2 px-3 border rounded-xl flex flex-col items-center gap-1 transition-all text-xs font-bold ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-sm'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
                onClick={() => setSubject(key)}
              >
                <span className="text-xl">{item.emoji}</span>
                <span>{item.ar}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Semester selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">الفصل الدراسي</label>
          <select
            id="select_semester"
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="الفصل الدراسي الأول">الفصل الدراسي الأول</option>
            <option value="الفصل الدراسي الثاني">الفصل الدراسي الثاني</option>
          </select>
        </div>

        {/* Grade Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">الصف الدراسي</label>
          {isCustomMode ? (
            <input
              id="input_custom_grade"
              type="text"
              className="w-full px-3 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none h-10 text-right"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="مثال: الصف الخامس الابتدائي"
            />
          ) : (
            <select
              id="select_grade"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 h-10"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {currentStage === 'elementary' ? (
                <>
                  <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                  <option value="الصف الثاني الابتدائي">الصف الثاني الابتدائي</option>
                  <option value="الصف الثالث الابتدائي">الصف الثالث الابتدائي</option>
                  <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                  <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                </>
              ) : currentStage === 'intermediate' ? (
                <>
                  <option value="الصف الأول المتوسط">الصف الأول المتوسط</option>
                  <option value="الصف الثاني المتوسط">الصف الثاني المتوسط</option>
                  <option value="الصف الثالث المتوسط">الصف الثالث المتوسط</option>
                </>
              ) : (
                <>
                  <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                  <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                  <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                </>
              )}
            </select>
          )}
        </div>
      </div>

      {/* Mode toggle (Preloaded catalogue vs Manual Upload) */}
      <div className="flex border-b border-slate-100 mb-4 h-10">
        <button
          id="tab_mode_catalogue"
          type="button"
          className={`flex-1 text-center text-xs font-bold border-b-2 transition-all ${
            !isCustomMode
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setIsCustomMode(false)}
        >
          الدروس المنهجية الجاهزة ({currentLessons.length})
        </button>
        <button
          id="tab_mode_custom"
          type="button"
          className={`flex-1 text-center text-xs font-bold border-b-2 transition-all ${
            isCustomMode
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setIsCustomMode(true)}
        >
          رفع كراسة/إدخال درس مخصص
        </button>
      </div>

      {/* Preloaded Catalogue Content */}
      {!isCustomMode && currentLessons.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">اختر الدرس للتحضير</label>
            <select
              id="select_lessons_catalogue"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10"
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
            >
              {currentLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.unit} ← {l.title}
                </option>
              ))}
            </select>
          </div>

          {/* Book Excerpt Viewer */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">محتوى كتاب الوزارة المعتمد (المرجع الصارم)</span>
            <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl max-h-48 overflow-y-auto font-sans text-xs text-slate-755 leading-relaxed text-right whitespace-pre-line border-r-4 border-r-indigo-400">
              {currentLessons.find((l) => l.id === selectedLessonId)?.content || 'لا يوجد محتوى.'}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>يحظر على الذكاء الاصطناعي استقاء معلومات أو أهداف من خارج النص المرجعي أعلاه.</span>
            </div>
          </div>
        </div>
      )}

      {/* Manual Custom Content Entry Form */}
      {isCustomMode && (
        <div className="space-y-4 font-sans text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">عنوان الدرس الجديد</label>
            <input
              id="input_custom_lesson_title"
              type="text"
              className="w-full px-3.5 py-2 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-10 text-right"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="مثال: تفاعلات الاندماج النووي والاندماجات المستقرة"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">بيان ومحتوى الدرس (انسخ من كتاب الوزارة أو لخصه هنا)</label>
            <textarea
              id="textarea_custom_lesson_text"
              rows={4}
              className="w-full p-3 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-slate-750 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right resize-none"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="الصق هنا الفقرات والنصوص من كتاب الطالب بحد أقصى ٣ صفحات ليتسنى للنظام تحليلها وترجمتها تربوياً وتطبيق قواعد المادة والنوع..."
            />
          </div>

          {/* Quick PDF OCR simulation mock component */}
          <div className="border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-xs font-bold text-slate-700 mb-0.5">اسحب كراسة المنهج أو PDF هنا لمسح النص تلقائياً</span>
            <span className="text-[10px] text-slate-400 leading-normal">مدعوم بقراءة مستندات PDF / Word واستخراج نصوصها عبر PyPDF2</span>
          </div>
        </div>
      )}
    </div>
  );
};
