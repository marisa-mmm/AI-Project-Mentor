import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Target, 
  Cpu, 
  Calendar, 
  ShieldAlert, 
  BookText, 
  FileDown, 
  FileType, 
  GraduationCap, 
  Layers, 
  Rocket 
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function WorkspacePage({ user, selectedBlueprint }) {
  const [step, setStep] = useState(selectedBlueprint ? 2 : 1);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [durationMonths, setDurationMonths] = useState(3);
  const [rawIdea, setRawIdea] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [blueprint, setBlueprint] = useState(selectedBlueprint || null);
  const [activeTab, setActiveTab] = useState('idea');

  useEffect(() => {
    if (selectedBlueprint) {
      setBlueprint(selectedBlueprint);
      setStep(2);
    }
  }, [selectedBlueprint]);

  const levels = [
    { 
      id: 'Beginner', 
      title: 'Beginner', 
      tag: 'Foundational', 
      desc: 'Standard architectures, guided design patterns, and foundational tutorials.', 
      icon: GraduationCap 
    },
    { 
      id: 'Intermediate', 
      title: 'Intermediate', 
      tag: 'Standard', 
      desc: 'Modular microservices, asynchronous jobs, and automated testing.', 
      icon: Layers 
    },
    { 
      id: 'Advanced', 
      title: 'Advanced', 
      tag: 'Production-Grade', 
      desc: 'Scalable cloud pipelines, distributed caching, and latency optimization.', 
      icon: Rocket 
    }
  ];

  const tabs = [
    { id: 'idea', label: '1. Idea Evaluation', icon: Lightbulb },
    { id: 'scope', label: '2. Project Scope', icon: Target },
    { id: 'tech', label: '3. Tech Stack', icon: Cpu },
    { id: 'planning', label: '4. Time Planning', icon: Calendar },
    { id: 'risk', label: '5. Risk Assessment', icon: ShieldAlert },
    { id: 'thesis', label: '6. Thesis Format', icon: BookText }
  ];

  const handleGenerateBlueprint = async (e) => {
    e.preventDefault();
    if (!rawIdea.trim()) {
      setError('Please describe your project idea.');
      return;
    }
    setError('');
    setLoading(true);

    const payload = {
      name: name.trim() || `${rawIdea.slice(0, 20)} Platform`,
      domain: domain.trim() || 'Auto-Detect',
      duration_months: Number(durationMonths) || 3,
      problem_statement: rawIdea.trim(),
      user_email: user?.email || 'student@university.edu'
    };

    try {
      const res = await axios.post(`${API_BASE}/api/generate-blueprint`, payload);
      setBlueprint(res.data);
      setStep(2);
      setActiveTab('idea');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate blueprint. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = () => {
    return blueprint?.project_details?.name || blueprint?.name || name || "Project";
  };

  const getContentForTab = (tabId) => {
    if (!blueprint) return '';
    switch (tabId) {
      case 'idea':
        return blueprint.idea_evaluation || '';
      case 'scope':
        return blueprint.scope_definition || '';
      case 'tech':
        return blueprint.technology_stack || '';
      case 'planning':
        return blueprint.time_planning || blueprint.timeline_milestones || '';
      case 'risk':
        return blueprint.risk_assessment || '';
      case 'thesis':
        return blueprint.thesis_format || blueprint.documentation_plan || '';
      default:
        return '';
    }
  };

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4"/>
            AI Project Creator
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Design Your Project Blueprint
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Let the AI multi-agent committee formulate your scope, architecture, and timeline.
          </p>
        </div>

        {/* Action Buttons: Strictly side-by-side on one row */}
        {blueprint && step === 2 && (
          <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
            <button
              onClick={() => setStep(1)}
              className="px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl cursor-pointer transition-all whitespace-nowrap shadow-xs"
            >
              Start New Project
            </button>
            <a
              href={`${API_BASE}/api/export/pdf?project_name=${encodeURIComponent(getProjectName())}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileDown className="w-4 h-4"/>
              <span>Download PDF</span>
            </a>
            <a
              href={`${API_BASE}/api/export/docx?project_name=${encodeURIComponent(getProjectName())}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileType className="w-4 h-4"/>
              <span>Download Word (.docx)</span>
            </a>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* STEP 1: Ideation Form */}
      {step === 1 && (
        <form onSubmit={handleGenerateBlueprint} className="mt-8 space-y-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
            <div>
              <label className="block text-lg font-black text-slate-900 tracking-tight mb-3">
                1. Select Academic Level
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {levels.map((lvl) => {
                  const Icon = lvl.icon;
                  const isSelected = level === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setLevel(lvl.id)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-500/10'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-600'
                          }`}>
                            <Icon className="w-6 h-6 stroke-[2.2]"/>
                          </div>
                          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md ${
                            isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lvl.tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">{lvl.title}</h3>
                        <p className="text-xs font-medium text-slate-500 leading-relaxed">{lvl.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Project Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., CodeSync Collab"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Domain Input with Auto-Detect Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Domain (Optional)
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    AI Auto-Detects if empty
                  </span>
                </div>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Leave blank or type e.g., Healthcare, FinTech"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Project Duration (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-black text-slate-900 tracking-tight mb-2">
                2. Describe Your Project Problem & Goal
              </label>
              <textarea
                required
                rows={4}
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                placeholder="Explain the problem you want to solve, what users will experience, and the desired outcome. The AI will recommend technologies, determine the domain, and formulate the complete project roadmap for you."
                className="w-full p-5 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-2xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Deep Multi-Agent Blueprint...</span>
                </>
              ) : (
                <>
                  <span>Generate Complete Multi-Agent Blueprint</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]"/>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: Multi-Tab Blueprint Display */}
      {step === 2 && blueprint && (
        <div className="mt-8 space-y-6">
          {/* Large, Visible Tab Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all cursor-pointer border-2 ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 scale-[1.03]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-blue-50/50 hover:border-slate-300 hover:text-slate-900 shadow-xs'
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-2 transition-colors ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-6 h-6 stroke-[2.4]" />
                  </div>
                  <span className={`text-sm sm:text-base font-black text-center tracking-tight leading-snug ${
                    active ? 'text-white' : 'text-slate-800'
                  }`}>
                    {tab.label.replace(/^\d+\.\s*/, '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm min-h-[500px]">
            <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100 text-blue-600">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Lightbulb, { className: "w-7 h-7 stroke-[2.5]" })}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>

            {getContentForTab(activeTab) ? (
              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200 text-slate-800 text-base leading-relaxed">
                <ReactMarkdown 
                  components={{
                    p: ({ node, ...props }) => <p className="mb-4 text-slate-700 leading-relaxed font-normal" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-slate-950 inline" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2.5 mb-5 ml-5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2.5 mb-5 ml-5" {...props} />,
                    li: ({ node, ...props }) => <li className="text-slate-700 font-medium leading-relaxed" {...props} />,
                    code: ({ node, inline, className, children, ...props }) => {
                      return !inline ? (
                        <pre className="my-4 rounded-xl overflow-x-auto border border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-sm leading-relaxed">
                          <code>{children}</code>
                        </pre>
                      ) : (
                        <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold" {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre: ({ node, children, ...props }) => <>{children}</>
                  }}
                >
                  {getContentForTab(activeTab)}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 font-bold text-base">
                No content generated for this section. Please regenerate by clicking "Start New Project" above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}