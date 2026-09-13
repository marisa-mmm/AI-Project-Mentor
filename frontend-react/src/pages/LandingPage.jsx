import React from 'react';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function LandingPage({ onEnterStudent, onEnterFaculty }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top University Navigation Bar (Fixed Top Header) */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs px-6 lg:px-12 py-3.5 sm:py-4 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 block">
                Academic Portal
              </span>
              <span className="text-xl font-black text-slate-900 tracking-tight leading-tight block">
                AI Project Mentor
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Clean, Focused Single-View Hero Section */}
      <main className="flex-1 flex flex-col justify-center overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/70 via-white to-slate-50 px-6 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs font-black uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            University Academic Project Management & Evaluation Portal
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight text-center leading-tight">
            AI Project Mentor
          </h1>

          <p className="text-base sm:text-xl font-medium text-slate-500 text-center max-w-2xl mx-auto mt-2 sm:mt-4 leading-relaxed">
            For anyone who wants to build a project but doesn't know where to start. Transform your raw idea into a structured architecture, track milestones, and prepare all the way to final viva defense.
          </p>

          {/* Primary Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 sm:pt-4">
            <button
              onClick={onEnterStudent}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-3 group active:scale-95"
            >
              <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Enter Student Platform</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onEnterFaculty}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-base shadow-xs transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-95"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Faculty Sign In</span>
            </button>
          </div>

          {/* Verification Pills */}
          <div className="pt-4 sm:pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Role-Guarded Portals</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standard Viva Rubric (/50)</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Manuscript Verification</span>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Locked Footer (Pinned to bottom with enlarged typography) */}
      <footer className="shrink-0 bg-white border-t border-slate-200 py-4 sm:py-5 px-6 lg:px-12 shadow-xs z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm sm:text-base">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-slate-900 tracking-tight text-sm sm:text-base">
                AI Project Mentor Academic Portal
              </span>
              <span className="text-slate-400 font-bold hidden sm:inline">•</span>
              <span className="font-bold text-slate-600 text-xs sm:text-sm">
                From Project Idea to Final Viva Defense
              </span>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-slate-700 text-xs sm:text-sm tracking-wide bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-2xs inline-block">
              Standardized Departmental Review & Mentorship System
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
