/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  Layers, 
  Award, 
  History, 
  ArrowRight, 
  Bot, 
  CheckCircle,
  Database,
  Cpu,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

import { TeacherProfile, LessonContent, GeneratedLesson, SystemMetrics } from './types';
import { TeacherProfileCard } from './components/TeacherProfileCard';
import { CurriculumSelector } from './components/CurriculumSelector';
import { LessonPlanDisplay } from './components/LessonPlanDisplay';
import { RulesValidationPanel } from './components/RulesValidationPanel';
import { ArchitectureDashboard } from './components/ArchitectureDashboard';

export default function App() {
  // 1. Core Profile & Environment States
  const [profile, setProfile] = useState<TeacherProfile>({
    name: 'أحمد الحربي',
    gender: 'male',
    studentGender: 'male',
    subject: 'mathematics',
    stage: 'intermediate',
    plan: 'pro',
    lessonsUsed: 6,
    lessonsLimit: 20
  });

  // 2. Active Selection Curriculum
  const [currentSelection, setCurrentSelection] = useState({
    subject: 'mathematics',
    grade: 'الصف الأول المتوسط',
    semester: 'الفصل الدراسي الأول',
    unit: 'الوحدة الثالثة: الهندسة الحسابية',
    lessonTitle: 'نظرية فيثاغورس وتطبيقاتها الحياتية',
    bookContent: ''
  });

  // 3. Output Lesson & Validation Scores
  const [activeLesson, setActiveLesson] = useState<GeneratedLesson | null>(null);

  // 4. Working & Queue Loading animation controls
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [activeQueueLog, setActiveQueueLog] = useState<string>('');
  const [logsList, setLogsList] = useState<any[]>([]);

  // 5. System metrics state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalPrepared: 42,
    totalTokensUsed: 1245000,
    estimatedCost: 24.90,
    apiSuccessRate: 98.4,
    rateLimitLimit: 100,
    rateLimitRemaining: 94,
    activeWorkerJobs: 0,
    deadLetterQueueCount: 0
  });

  // 6. UI Active Global Tabs: 'workspace' or 'architecture'
  const [globalTab, setGlobalTab] = useState<'workspace' | 'architecture'>('workspace');

  // Load and refresh stats
  const fetchSystemStats = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setLogsList(data.logs || []);
        setSystemMetrics(data.systemMetrics);
        if (data.userSession) {
          setProfile((prev) => ({
            ...prev,
            lessonsUsed: data.userSession.lessonsCreated,
            plan: data.userSession.plan,
            lessonsLimit: data.userSession.plan === 'basic' ? 10 : data.userSession.plan === 'pro' ? 20 : 40
          }));
        }
      }
    } catch (err) {
      console.warn('Backend server and analytics API is offline or loading... defaulting to sandbox state.');
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  // Update profile logic
  const handleProfileChange = (updated: Partial<TeacherProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Submit & Asynchronous Queue trigger
  const handleTriggerPrepareLesson = async () => {
    if (profile.lessonsUsed >= profile.lessonsLimit) {
      alert('عذراً! انتهى الحد المسموح به لرصيد باقتك الحالية. يرجى الترقية للحصول على رصيد إضافي.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setActiveQueueLog('التحضير: جاري صياغة الاتصال المأمون بـ Redis وقناته...');

    // Progress bar simulation matching actual teacher waiting times (30 seconds or accelerated for smooth test review)
    let progress = 5;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }
      setGenerationProgress(progress);

      // Switch queue logs based on progress ranges
      if (progress < 25) {
        setActiveQueueLog('[Celery Queue - Priority High] جاري إيداع المهمة في خادم Redis...');
      } else if (progress < 45) {
        setActiveQueueLog('[Celery Worker Node 2] جاري تحليل النص ومطابقة الكفايات واستبعاد الهلوسات...');
      } else if (progress < 65) {
        setActiveQueueLog('[AI Generator] جاري تفعيل نموذج gemini-3.5-flash للتوليفة الصارمة...');
      } else if (progress < 85) {
        setActiveQueueLog('[Rules Engine] جاري ضبط الجنس والمخاطب اللغوي ليتلائم وخصائص الفصل الدراسي...');
      } else {
        setActiveQueueLog('[Rules Engine] جاري احتساب التكلفة وإتمام مصفوفة التحضير بنجاح...');
      }
    }, 280);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: currentSelection.grade,
          subject: currentSelection.subject,
          stage: profile.stage,
          unit: currentSelection.unit,
          title: currentSelection.lessonTitle,
          content: currentSelection.bookContent,
          studentGender: profile.studentGender,
          teacherGender: profile.gender,
          teacherName: profile.name,
          plan: profile.plan
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Let the simulation complete naturally to show the background worker in action
        setTimeout(() => {
          clearInterval(interval);
          setGenerationProgress(100);
          setActiveLesson(result);
          setIsGenerating(false);
          fetchSystemStats(); // Refresh logs and analytics metrics
        }, 1200);
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        alert('حدث خطأ أثناء الاتصال بالخادم الخلفي. يرجى التحقق من المدخلات والمحاولة لاحقاً.');
      }
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      alert('فشل الاتصال بالخادم. يرجى تشغيل السيرفر الأساسي.');
    }
  };

  // Word export trigger handler
  const handleExportWordDoc = async () => {
    if (!activeLesson) return;

    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeLesson)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${profile.stage}_${currentSelection.subject}_تحضير_درس_${activeLesson.lessonTitle}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('فشل استخراج ملف وورد.');
      }
    } catch (err) {
      alert('خطأ أثناء تشكيل تصدير الوظيفة.');
    }
  };

  const getSubjectIcon = (sub: string) => {
    if (sub === 'mathematics') return '📐';
    if (sub === 'science') return '🧪';
    if (sub === 'quran') return '📖';
    return '✍️';
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans" dir="rtl">
      
      {/* Visual Workspace Hero Ribbon Head */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white shadow-md relative overflow-hidden">
        {/* Ambient Design Vector Circles */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-1/3 h-24 w-24 bg-teal-500/5 rounded-full blur-xl"></div>

        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-indigo-500/20 shadow-indigo-600/20">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">منصة التحضير الذكي الشامل للمعلمين</h1>
                <span className="px-2 py-0.5 bg-teal-500 text-slate-950 text-[10px] rounded-full font-black uppercase tracking-wider">MVP Core</span>
              </div>
              <p className="text-slate-300 text-xs mt-1 font-medium leading-relaxed max-w-xl">
                أول منصة SaaS تربوية مخصصة لتوليد تحاضير الدروس المدرسية بالذكاء الاصطناعي وفق المعايير الرسمية لوزارة التربية، مع فصل كامل بين المحتوى، والذكاء الاصطناعي، وقوالب Word المعتمدة.
              </p>
            </div>
          </div>

          {/* Navigation Global Switch Bar */}
          <div className="flex gap-2.5 bg-slate-950/40 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto shrink-0">
            <button
              id="switch_tab_workspace"
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                globalTab === 'workspace'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setGlobalTab('workspace')}
            >
              <FolderOpen className="w-4 h-4" />
              <span>مساحة عمل المعلم</span>
            </button>
            <button
              id="switch_tab_architecture"
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                globalTab === 'architecture'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setGlobalTab('architecture')}
            >
              <Cpu className="w-4 h-4" />
              <span>معمارية وحالة النظام</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Section */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {globalTab === 'workspace' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar Layout parameters */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Profile Config Component */}
              <TeacherProfileCard profile={profile} onChangeProfile={handleProfileChange} />
              
              {/* Syllabus Lessons Select Component */}
              <CurriculumSelector
                currentStage={profile.stage}
                onSelectionChange={(sel) => setCurrentSelection(sel)}
                isGenerating={isGenerating}
              />

              {/* Action Preparation Submit Button Panel */}
              <div id="preparation_actions" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 mb-4 text-xs text-slate-600 text-right leading-loose">
                  <span className="font-bold text-slate-800">بيانات التحضير الفعال:</span>
                  <div className="mt-1 font-sans space-y-0.5">
                    <p>• الدرس: <strong className="text-indigo-950 font-bold">{currentSelection.lessonTitle}</strong></p>
                    <p>• المادة: <strong className="text-indigo-950">{currentSelection.subject === 'mathematics' ? 'الرياضيات' : currentSelection.subject === 'science' ? 'العلوم الطبيعية' : currentSelection.subject === 'quran' ? 'القرآن الكريم' : 'اللغة العربية'}</strong></p>
                    <p>• الفئة اللغوية: <strong className="text-teal-700 font-bold">{profile.studentGender === 'female' ? 'مؤنث (طالبات)' : profile.studentGender === 'male' ? 'مذكر (طلاب)' : 'شمولي مشترك'}</strong></p>
                  </div>
                </div>

                {isGenerating ? (
                  <div id="queue_waiter_panel" className="space-y-3 font-sans">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>جاري معالجة الطلب في صف Celery...</span>
                      </span>
                      <span className="font-mono">{generationProgress}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner p-0.5 border border-slate-200/50">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>

                    <p className="text-[10px] text-right text-slate-450 leading-relaxed truncate font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg border border-slate-950 shadow-inner">
                      {activeQueueLog}
                    </p>
                  </div>
                ) : (
                  <button
                    id="btn_prepare_lesson_main"
                    type="button"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer text-center h-12 flex items-center justify-center gap-2"
                    onClick={handleTriggerPrepareLesson}
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>تحضير الدرس بالذكاء الاصطناعي ✨</span>
                  </button>
                )}
              </div>

              {/* API and Gemini Instructions Warning Card */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-right flex gap-3 text-xs leading-loose text-indigo-950">
                <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-950">سياسة المعالجة التربوية الصارمة (Anti-Hallucination):</span>
                  <p className="text-indigo-900 mt-1">
                    يحظر البرنامج الهلوسة الفنية كلياً. تنص تعليمات محرك القواعد على استبعاد أي معرفة بالقصائد، أو المعادلات، أو الأمثلة التي لم تؤصل وتثبت صراحة في النص المرجعي المقطوع من كتاب الوزارة المسجل في النظام.
                  </p>
                </div>
              </div>

            </div>

            {/* Right Display output and Validation panel */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Output Display component */}
              <LessonPlanDisplay
                lesson={activeLesson}
                onExportWord={handleExportWordDoc}
                isExporting={isGenerating}
              />

              {/* Quality Compliance Auditing Panel */}
              <RulesValidationPanel lesson={activeLesson} />

              {/* Simulation Banner Info (Informational strictly matching environment) */}
              {!process.env.GEMINI_API_KEY && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-right flex gap-3.5 text-xs text-amber-950 shadow-sm leading-loose">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">ملاحظة الترخيص ومفتاح الذكاء:</span>
                    <p className="text-amber-900 mt-1">
                      يدير هذا النظام محرك تكييف تلقائي (NLP Optimizer Simulator) لتسريع الفحوص التربوية ومحاكاة مخرجات المنهج. لتنشيط الاسترداد الحقيقي المباشر والاتصال الحقيقي بنموذج <strong>Gemini 3.5</strong>، يرجى التكرم بحفظ ملف مفتاح الترخيص <strong>GEMINI_API_KEY</strong> في لوحة <strong>Settings &gt; Secrets</strong> في واجهة AI Studio.
                    </p>
                  </div>
                </div>
              )}

              {/* Generation Logs History Database Feed */}
              {logsList.length > 0 && (
                <div id="lessons_history_feed" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h4 className="font-bold text-slate-850 text-sm mb-4 border-b border-slate-150 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-slate-500" />
                      سجل العمليات والفواتير الفعالة لـ SaaS
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Generation History logs</span>
                  </h4>
                  
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {logsList.map((log) => (
                      <div key={log.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-wrap items-center justify-between text-xs font-sans gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getSubjectIcon(log.subject === 'الرياضيات' ? 'mathematics' : log.subject === 'العلوم الطبيعية' ? 'science' : log.subject === 'القرآن الكريم' ? 'quran' : 'arabic')}</span>
                          <div>
                            <span className="font-bold text-slate-800">{log.lessonName}</span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.timestamp} | {log.teacherName}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-md border border-indigo-100 font-mono">
                            Score: {log.validationScore}%
                          </span>
                          <span className="font-mono text-slate-500">
                            ${log.costInUSD.toFixed(5)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* System Architecture diagnostics view */
          <div className="animate-fade-in">
            <ArchitectureDashboard
              metrics={systemMetrics}
              onRefresh={fetchSystemStats}
              isLoading={isGenerating}
            />
          </div>
        )}

      </main>
    </div>
  );
}
