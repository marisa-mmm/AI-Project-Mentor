import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
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
  Rocket,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const LEVEL_QUESTIONS = {
  Beginner: [
    {
      id: 'q1',
      question: '1. What problem are you solving?',
      placeholder: 'Describe the main difficulty, frustration, or issue you want to fix...'
    },
    {
      id: 'q2',
      question: '2. What is your idea?',
      placeholder: 'Explain what your application or website will do to solve this...'
    },
    {
      id: 'q3',
      question: '3. What feature you want to implement?',
      placeholder: 'List 2 or 3 main buttons, pages, or features users will use...'
    }
  ],
  Intermediate: [
    {
      id: 'q1',
      question: '1. What is the problem and what solution are you planning?',
      placeholder: 'Detail the current bottleneck and how your platform proposes to solve it...'
    },
    {
      id: 'q2',
      question: '2. What core features you want to add?',
      placeholder: 'Detail the essential MVP features, workflows, or role-based interactions...'
    },
    {
      id: 'q3',
      question: '3. Who are your users?',
      placeholder: 'Identify the target audience (e.g., college students, admins, doctors, customers)...'
    }
  ],
  Advanced: [
    {
      id: 'q1',
      question: '1. What is your Problem Statement and system scope?',
      placeholder: 'State the engineering challenge, technical inefficiency, or research gap addressed...'
    },
    {
      id: 'q2',
      question: '2. What core features and architectural components will you implement?',
      placeholder: 'Specify key algorithmic workflows, data pipelines, and core functional features...'
    },
    {
      id: 'q3',
      question: '3. Who are your target users and how will they interact with the platform?',
      placeholder: 'Detail user roles, access requirements, and expected operational interactions...'
    }
  ]
};

export default function WorkspacePage({ user, selectedBlueprint }) {
  // screen: 1 = Initial Setup, 2 = Skill Questions, 3 = Generated Blueprint
  const [screen, setScreen] = useState(selectedBlueprint ? 3 : 1);

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [durationMonths, setDurationMonths] = useState(3);
  const [rawIdea, setRawIdea] = useState('');
  const [level, setLevel] = useState('Beginner');

  // Stores answers to screen 2 questions
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [blueprint, setBlueprint] = useState(selectedBlueprint || null);
  const [activeTab, setActiveTab] = useState('idea');

  useEffect(() => {
    if (selectedBlueprint) {
      setBlueprint(selectedBlueprint);
      setName(selectedBlueprint.project_details?.name || selectedBlueprint.name || '');
      setDomain(selectedBlueprint.project_details?.domain || '');
      setDurationMonths(selectedBlueprint.project_details?.duration_months || 3);
      setRawIdea(selectedBlueprint.project_details?.problem_statement || '');
      setScreen(3);
      setActiveTab('idea');
    } else {
      setBlueprint(null);
      setScreen(1);
    }
  }, [selectedBlueprint]);

  const levels = [
    { 
      id: 'Beginner', 
      title: 'Beginner', 
      tag: 'Foundational', 
      desc: 'Standard monolithic architectures, guided design patterns, and foundational tutorials.', 
      icon: GraduationCap 
    },
    { 
      id: 'Intermediate', 
      title: 'Intermediate', 
      tag: 'Standard', 
      desc: 'Modular microservices, asynchronous jobs, token security, and automated testing.', 
      icon: Layers 
    },
    { 
      id: 'Advanced', 
      title: 'Advanced', 
      tag: 'Production-Grade', 
      desc: 'Clean scalable architecture, structured pipelines, caching, and modular optimization.', 
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

  const handleGoToQuestions = (e) => {
    e.preventDefault();
    if (!rawIdea.trim()) {
      setError('Please provide a 2-3 line description of your project.');
      return;
    }
    setError('');
    setScreen(2);
  };

  const handleAnswerSelect = (questionId, optionValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleGenerateBlueprint = async () => {
    setError('');
    setLoading(true);

    const currentQuestions = LEVEL_QUESTIONS[level] || LEVEL_QUESTIONS.Beginner;
    const detailedAnswers = currentQuestions
      .map(q => `${q.question}\nAnswer: ${answers[q.id] || 'Not specified'}`)
      .join('\n\n');

    const fullProblemStatement = `${rawIdea.trim()}\n\nDetailed Requirements:\n${detailedAnswers}`;

    const payload = {
      name: name.trim() || `${rawIdea.slice(0, 20)} Platform`,
      domain: domain.trim() || 'Auto-Detect',
      duration_months: Number(durationMonths) || 3,
      problem_statement: fullProblemStatement,
      user_email: user?.email || 'student@university.edu'
    };

    try {
      const res = await axios.post(`${API_BASE}/api/generate-blueprint`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (res.data) {
        setBlueprint(res.data);
        setScreen(3);
        setActiveTab('idea');
      }
    } catch (err) {
      console.error("Blueprint generation error:", err);
      setError(err.response?.data?.detail || 'Failed to generate blueprint. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = () => {
    return blueprint?.project_details?.name || blueprint?.name || name || "Project";
  };

  const getContentForTab = (tabId) => {
    if (!blueprint) return '';
    let content = '';
    switch (tabId) {
      case 'idea':
        content = blueprint.idea_evaluation || '';
        break;
      case 'scope':
        content = blueprint.scope_definition || '';
        break;
      case 'tech':
        content = blueprint.technology_stack || '';
        break;
      case 'planning':
        content = blueprint.time_planning || blueprint.timeline_milestones || '';
        break;
      case 'risk':
        content = blueprint.risk_assessment || '';
        break;
      case 'thesis':
        content = blueprint.thesis_format || blueprint.documentation_plan || '';
        break;
      default:
        content = '';
    }
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content, null, 2);
    }
    return String(content || '');
  };

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4"/>
            {screen === 3 && blueprint ? "Project Blueprint View" : "AI Project Creator"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {screen === 3 && blueprint ? getProjectName() : "Design Your Project Blueprint"}
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            {screen === 3 && blueprint 
              ? `${blueprint.project_details?.domain || domain || 'Applied Engineering'} • ${blueprint.project_details?.duration_months || durationMonths || 3} Months Duration`
              : "Let the AI multi-agent committee formulate your scope, architecture, and timeline."}
          </p>
        </div>

        {/* Action Buttons: Visible only in Screen 3 */}
        {blueprint && screen === 3 && (
          <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
            <button
              onClick={() => {
                setScreen(1);
                setBlueprint(null);
              }}
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

      {/* 3 Step Visual Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all ${
          screen === 1 
            ? 'bg-blue-50/60 border-blue-500 text-blue-900 shadow-xs' 
            : screen > 1 
              ? 'bg-white border-emerald-300 text-slate-800' 
              : 'bg-white border-slate-200 text-slate-600'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
            screen > 1 
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
              : 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
          }`}>
            {screen > 1 ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : '01'}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Step 1</div>
            <div className="text-sm font-black text-slate-900">Project Idea & Level</div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all ${
          screen === 2 
            ? 'bg-blue-50/60 border-blue-500 text-blue-900 shadow-xs' 
            : screen > 2 
              ? 'bg-white border-emerald-300 text-slate-800' 
              : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
            screen === 2 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : screen > 2 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-slate-200 text-slate-600'
          }`}>
            {screen > 2 ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : '02'}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Step 2</div>
            <div className="text-sm font-black text-slate-900">Quick Skill Questions</div>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all ${
          screen === 3 
            ? 'bg-blue-50/60 border-blue-500 text-blue-900 shadow-xs' 
            : 'bg-slate-50/50 border-slate-200 text-slate-400'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
            screen === 3 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : 'bg-slate-200 text-slate-600'
          }`}>
            03
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Step 3</div>
            <div className="text-sm font-black text-slate-900">Multi-Agent Blueprint</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold text-sm flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* SCREEN 1: Academic Level, Metadata, and 2-3 Line Problem Statement */}
      {screen === 1 && (
        <form onSubmit={handleGoToQuestions} className="space-y-8">
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

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Domain (Optional)
                  </label>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    AI Auto-Detects
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
                2. Describe Your Project Problem & Goal (in 2-3 lines)
              </label>
              <textarea
                required
                rows={3}
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                placeholder="Briefly state what problem your application solves and what a user will achieve with it."
                className="w-full p-5 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-2xl text-base font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Continue to Skill Check</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]"/>
            </button>
          </div>
        </form>
      )}

      {/* SCREEN 2: DEDICATED SKILL QUESTIONS SCREEN */}
      {screen === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                {level} Level Questions
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Project Architecture Alignment
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Provide specific details about your project vision. These help the AI agents recommend appropriate tools and realistic timelines.
              </p>
            </div>
            <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Level: {level}
            </span>
          </div>

          <div className="space-y-6">
            {(LEVEL_QUESTIONS[level] || LEVEL_QUESTIONS.Beginner).map((q) => (
              <div key={q.id} className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-base font-black text-slate-900">
                  {q.question}
                </label>
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerSelect(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  className="w-full p-4 bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-4">
            <button
              type="button"
              onClick={() => setScreen(1)}
              disabled={loading}
              className="px-5 py-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateBlueprint}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Multi-Agent Blueprint (6-8s)...</span>
                </>
              ) : (
                <>
                  <span>Generate Complete Multi-Agent Blueprint</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]"/>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: MULTI-TAB BLUEPRINT VIEW */}
      {screen === 3 && blueprint && (
        <div className="space-y-6">
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
                      const match = /language-(\w+)/.exec(className || '');
                      if (!inline && match) {
                        return (
                          <pre className="my-4 rounded-xl overflow-x-auto border border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-sm leading-relaxed">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        );
                      }
                      return (
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