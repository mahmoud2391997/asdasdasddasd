/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { Database, Activity, RefreshCw, Layers, Shield, Terminal, Cpu, Clock, HelpCircle, HardDrive } from 'lucide-react';
import { FASTAPI_CODE_TREE } from '../backendCodeTemplates';
import { SystemMetrics } from '../types';

interface ArchitectureDashboardProps {
  metrics: SystemMetrics;
  onRefresh: () => void;
  isLoading: boolean;
}

export const ArchitectureDashboard: React.FC<ArchitectureDashboardProps> = ({
  metrics,
  onRefresh,
  isLoading
}) => {
  const [selectedFile, setSelectedFile] = useState<keyof typeof FASTAPI_CODE_TREE>('app/core/ai_engine.py');
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'code' | 'schema'>('infrastructure');
  const [copiedFile, setCopiedFile] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FASTAPI_CODE_TREE[selectedFile]);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div id="architecture_dashboard" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md font-sans">
      
      {/* Header element */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl text-teal-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-850">معمارية وحالة خادم الإنتاج (FastAPI Engine)</h3>
            <p className="font-mono text-xs text-slate-400">Microservice Backend Architecture Model & Telemetry</p>
          </div>
        </div>

        <button
          id="btn_refresh_metrics"
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all h-9 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>تحديث المقاييس</span>
        </button>
      </div>

      {/* Tabs list inside dashboard */}
      <div className="flex gap-2 border-b border-slate-100 mb-6 pb-px">
        {[
          { key: 'infrastructure', label: 'حالة البنية التحتية والعمال', icon: Activity },
          { key: 'schema', label: 'مخطط البيانات (DB ER-Schema)', icon: Database },
          { key: 'code', label: 'مستودع الكود البرمجي (FastAPI)', icon: Terminal }
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              id={`tab_arch_${tab.key}`}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition-all ${
                isSelected
                  ? 'border-indigo-600 text-indigo-950 bg-indigo-50/10'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content tabs */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6">
          {/* Key telemetry dashboard gauges cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="block text-slate-450 text-[10px] font-bold mb-1 uppercase tracking-wider font-mono">Tasks Prepared</span>
              <span className="text-xl font-black font-mono text-slate-800">{metrics.totalPrepared}</span>
              <div className="text-[10px] text-teal-650 mt-1 font-sans">✔ %100 Success Rate</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="block text-slate-450 text-[10px] font-bold mb-1 uppercase tracking-wider font-mono">Simulated Tokens</span>
              <span className="text-xl font-black font-mono text-slate-800">
                {metrics.totalTokensUsed >= 1000 ? `${(metrics.totalTokensUsed / 1000).toFixed(1)}k` : metrics.totalTokensUsed}
              </span>
              <div className="text-[10px] text-slate-450 mt-1 font-sans">Gemini usage volume</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="block text-slate-450 text-[10px] font-bold mb-1 uppercase tracking-wider font-mono">ESTIMATED COST</span>
              <span className="text-xl font-black font-mono text-emerald-600">
                ${metrics.estimatedCost.toFixed(4)}
              </span>
              <div className="text-[10px] text-slate-450 mt-1 font-sans">SaaS Cost Limit controls</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="block text-slate-450 text-[10px] font-bold mb-1 uppercase tracking-wider font-mono">CELERY WORKERS</span>
              <span className="text-xl font-black font-mono text-indigo-600">3 Nodes</span>
              <div className="text-[10px] text-teal-650 mt-1 font-sans">Redis queue broker</div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Health Indicators List */}
            <div className="md:col-span-1 border border-slate-100 rounded-xl p-4 bg-slate-50/40">
              <h4 className="font-bold text-slate-800 text-sm mb-3 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-slate-500" />
                مجسات حيوية ومراقبة
              </h4>
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">FastAPI Gateway</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-[10px] rounded-md font-bold font-mono">Healthy (OK)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">PostgreSQL Database</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-[10px] rounded-md font-bold font-mono">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Redis Broker Server</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100/70 border border-emerald-200/50 text-emerald-800 text-[10px] rounded-md font-bold font-mono">1.2ms Ping</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Celery Tasks Worker</span>
                  <span className="px-1.5 py-0.5 bg-indigo-100/70 border border-indigo-200/50 text-indigo-800 text-[10px] rounded-md font-bold font-mono">Idle (3 Active)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Prometheus Scraping</span>
                  <span className="text-slate-450 font-mono">Scrape Interval: 15s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Sentry Integration</span>
                  <span className="text-slate-450 font-mono">Dsn: production_set</span>
                </div>
              </div>
            </div>

            {/* Simulated Celery queue details */}
            <div className="md:col-span-2 border border-slate-100 rounded-xl p-4 bg-slate-50/40 font-mono flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-850 text-sm mb-3 border-b border-slate-100 pb-1.5 font-sans flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  محاكي طابير Celery Priority Queue
                </h4>
                
                {/* Active jobs panel */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-center">
                    <span className="block text-[10px] text-slate-400">الصف الفعال (Active Queue)</span>
                    <span className="text-sm font-black text-slate-800">{metrics.activeWorkerJobs} جاري معالجتها</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-2.5 rounded-lg text-center">
                    <span className="block text-[10px] text-slate-400">الأخطاء الميتة (DLQ-Count)</span>
                    <span className="text-sm font-black text-rose-600">{metrics.deadLetterQueueCount} مهام</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed font-sans text-right mb-2">
                  ليلة الأحد (وقت الذروة)، يقوم نظام Celery بدفع الطلبات فورياً لـ Redis لامتصاص الضغط العالي مع تفويض الـ Worker لمعالجتها آلياً خلال ٣ ثوانٍ لضمان استقرار الخادم.
                </p>
              </div>

              {/* Logs output */}
              <div className="bg-slate-900 text-slate-350 p-3 rounded-lg text-[10px] leading-relaxed text-right border border-slate-950/45 h-20 overflow-y-auto">
                <span className="text-teal-400 border-b border-slate-800 pb-0.5 mb-1 block">CELERY LOG WORKER STREAM:</span>
                <p className="text-slate-400">❯ Celery task handler initialized in background...</p>
                <p className="text-slate-400">❯ Dead letter routing set to queue: DLQ</p>
                <p className="text-slate-400">❯ Worker received priority high event task</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SCHEMA DATABASE ER PANEL */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-450 mb-3 font-sans">
            <Database className="w-4 h-4 text-teal-600" />
            <span>نطاق الجداول ومفاتيح الربط في PostgreSQL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            {/* Model Users */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-800 text-white p-2.5 font-bold flex items-center justify-between">
                <span>users (معلومات المعلم وحسابه)</span>
                <span className="text-[9px] opacity-70">Table</span>
              </div>
              <div className="p-3 space-y-1.5 bg-slate-50/50">
                <div className="flex justify-between font-mono bg-white border border-slate-150 p-1.5 rounded-lg">
                  <span className="font-bold text-indigo-750">id (PK)</span>
                  <span className="text-slate-400 text-[10px]">INTEGER</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>username</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(50)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>email</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(100)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>plan_tier</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(20)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>credits_remaining</span>
                  <span className="text-slate-400 text-[10px]">INTEGER</span>
                </div>
              </div>
            </div>

            {/* Model Lessons */}
            <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-indigo-900 text-white p-2.5 font-bold flex items-center justify-between">
                <span>lessons (التحاضير المولدة بالذكاء)</span>
                <span className="text-[9px] opacity-80 font-mono">PK-FK Relation</span>
              </div>
              <div className="p-3 space-y-1.5 bg-slate-50/50">
                <div className="flex justify-between font-mono bg-white border border-indigo-150 p-1.5 rounded-lg">
                  <span className="font-bold text-indigo-750">id (PK)</span>
                  <span className="text-slate-400 text-[10px]">INTEGER</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>title</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(150)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>subject</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(50)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>stage</span>
                  <span className="text-slate-400 text-[10px]">VARCHAR(50)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>introduction</span>
                  <span className="text-slate-400 text-[10px]">TEXT</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>objectives</span>
                  <span className="text-indigo-650 bg-indigo-50 px-1 rounded text-[10px]">JSON Array</span>
                </div>
                <div className="flex justify-between font-mono bg-white/40 border border-slate-100 p-1.5 rounded-lg">
                  <span className="text-slate-500">user_id (FK)</span>
                  <span className="text-indigo-600 font-bold">➔ users.id</span>
                </div>
              </div>
            </div>

            {/* Model Cost Tracking */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-800 text-white p-2.5 font-bold flex items-center justify-between">
                <span>cost_tracking (فاتورة الرموز والتكلفة)</span>
                <span className="text-[9px] opacity-70">Table</span>
              </div>
              <div className="p-3 space-y-1.5 bg-slate-50/50">
                <div className="flex justify-between font-mono bg-white border border-slate-150 p-1.5 rounded-lg">
                  <span className="font-bold text-indigo-750">id (PK)</span>
                  <span className="text-slate-400 text-[10px]">INTEGER</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>tokens_count</span>
                  <span className="text-slate-400 text-[10px]">INTEGER</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>estimated_usd_cost</span>
                  <span className="text-emerald-600 font-bold text-[10px]">FLOAT</span>
                </div>
                <div className="flex justify-between font-mono bg-white/40 border border-slate-100 p-1.5 rounded-lg">
                  <span className="text-slate-500">user_id (FK)</span>
                  <span className="text-indigo-600 font-bold">➔ users.id</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Repository Browser */}
      {activeTab === 'code' && (
        <div className="flex flex-col md:flex-row border border-slate-150 rounded-xl overflow-hidden h-96">
          {/* File Lists sidebar */}
          <div className="md:w-56 bg-slate-900/5 border-b md:border-b-0 md:border-l border-slate-200 p-3 overflow-y-auto space-y-1">
            <span className="block text-[10px] font-bold text-slate-450 uppercase mb-2 tracking-wider">FastAPI Project Source</span>
            {Object.keys(FASTAPI_CODE_TREE).map((file) => {
              const isSelected = selectedFile === file;
              return (
                <button
                  key={file}
                  type="button"
                  id={`btn_file_${file.replace(/\//g, '_')}`}
                  className={`w-full text-right text-xs p-2 rounded-lg truncate transition-all text-ellipsis overflow-hidden block ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                  onClick={() => setSelectedFile(file as any)}
                >
                  {file.substring(file.lastIndexOf('/') + 1)}
                </button>
              );
            })}
          </div>

          {/* Code Viewer Area */}
          <div className="flex-1 bg-slate-950 p-4 text-right overflow-auto font-mono text-xs relative flex flex-col justify-between">
            <div className="absolute top-3 left-3 flex gap-2">
              <button
                id="btn_copy_python_code"
                type="button"
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                onClick={handleCopyCode}
              >
                {copiedFile ? 'تم نسخ الملف!' : 'نسخ كود ملف Python'}
              </button>
            </div>
            
            <pre className="text-slate-300 text-left leading-relaxed select-text font-mono overflow-auto h-full pr-2 text-[11px]" style={{ direction: 'ltr' }}>
              {FASTAPI_CODE_TREE[selectedFile]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
