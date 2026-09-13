import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  PlusCircle, 
  Code2, 
  Calendar,
  LogOut,
  UserCheck,
  Bell,
  ChevronDown,
  Check
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function DashboardPage({ 
  user, 
  onLogout, 
  onNavigateToWorkspace, 
  onSelectProject,
  hasUnreadNotice = false,
  onOpenNoticeboard
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`);
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to load user projects", err);
    } finally {
      setLoading(false);
    }
  };

  const total = projects.length;

  // Completed: Approved projects or 100% complete
  const completedCount = projects.filter(p => {
    const status = (p.approval_status || '').toLowerCase();
    const progressVal = p.progress?.completion_percentage || 0;
    return status.includes('approved') || progressVal >= 100;
  }).length;

  // In Review: Strictly pending evaluation
  const inReviewCount = projects.filter(p => {
    const status = (p.approval_status || 'Pending Review').toLowerCase();
    return status.includes('pending') || status.includes('review');
  }).length;

  // In Progress: Has active progress (> 0 and < 100) or status is 'needs revision', but NOT already approved
  const inProgressCount = projects.filter(p => {
    const status = (p.approval_status || '').toLowerCase();
    const progressVal = p.progress?.completion_percentage || 0;
    const isApproved = status.includes('approved') || progressVal >= 100;
    if (isApproved) return false;
    return progressVal > 0 || status.includes('revision') || status.includes('in progress');
  }).length;

  const statusOptions = [
    { label: 'All Statuses', count: total },
    { label: 'Approved', count: completedCount },
    { label: 'In Progress', count: inProgressCount },
    { label: 'In Review', count: inReviewCount }
  ];
  const filteredCount = statusOptions.find(o => o.label === selectedStatus)?.count ?? total;

  const filteredProjects = projects.filter(proj => {
    const status = (proj.approval_status || 'Pending Review').toLowerCase();
    const progressVal = proj.progress?.completion_percentage || 0;
    const isApproved = status.includes('approved') || progressVal >= 100;

    if (selectedStatus === 'All Statuses' || selectedStatus === 'All') return true;
    if (selectedStatus === 'Approved') return isApproved;
    if (selectedStatus === 'In Review') return status.includes('pending') || status.includes('review');
    if (selectedStatus === 'In Progress') {
      return !isApproved && (progressVal > 0 || status.includes('revision') || status.includes('in progress'));
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              AI Project Mentor
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-600 mt-1 leading-relaxed">
              AI Guided Project Progress Tracking Platform with Planning & Mentorship Assistance
            </p>
          </div>

          {/* User Profile & Sign Out Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Announcement Notification Bell */}
            <button
              onClick={onOpenNoticeboard}
              className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-2xl text-slate-700 hover:text-blue-600 transition-all cursor-pointer shadow-xs group"
              title="Cohort Noticeboard & Announcements"
            >
              <Bell className="w-5 h-5 stroke-[2.2] group-hover:scale-110 transition-transform" />
              {hasUnreadNotice && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-[9px] font-black text-white items-center justify-center ring-2 ring-white shadow-xs">
                    !
                  </span>
                </span>
              )}
            </button>

            <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-300 py-2 px-4 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">{user?.username || 'Student'}</span>
                  <span className="text-xs font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-md uppercase">
                    {user?.role || 'Student'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Project Overview & Metrics</h2>
            <p className="text-base font-medium text-slate-500 mt-1">
              Review current implementation milestones, feedback, and deliverables.
            </p>
          </div>
          <button
            onClick={onNavigateToWorkspace}
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Projects</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-black text-slate-900 mt-3">{total}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">All registered blueprints</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Completed</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-black text-emerald-600 mt-3">{completedCount}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Approved & finalized</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">In Review</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-black text-amber-600 mt-3">{inReviewCount}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Pending faculty evaluation</p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">In Progress</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-black text-blue-600 mt-3">{inProgressCount}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Active development phase</p>
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">Your Project Blueprints</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">
                Click any project to inspect documentation, milestones, and thesis tasks.
              </p>
            </div>
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl shadow-xs transition-all cursor-pointer text-sm font-bold text-slate-800"
              >
                <span>{selectedStatus}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
                  {filteredCount}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${filterOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  {statusOptions.map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => {
                        setSelectedStatus(opt.label);
                        setFilterOpen(false);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center justify-between cursor-pointer transition-all ${
                        selectedStatus === opt.label ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px] font-bold">{opt.count}</span>
                        {selectedStatus === opt.label && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]"/>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-base font-bold">
              Loading your projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
              <FolderKanban className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-black text-slate-800">No project blueprints created yet</p>
              <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                Generate your first project blueprint with automated milestones, tech stack selection, and thesis outline.
              </p>
              <button
                onClick={onNavigateToWorkspace}
                className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Create First Project
              </button>
            </div>
          ) : (
            <div className="max-h-[520px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
              {filteredProjects.map((proj, idx) => {
                const details = proj.project_details || {};
                const name = details.name || proj.name || "Untitled Project";
                const domain = details.domain || "Applied Software Engineering";
                const tech = details.preferred_tech || "Python, React, MongoDB";
                const duration = details.duration_months || 3;
                const status = proj.approval_status || "Pending Review";

                return (
                  <div
                    key={idx}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all bg-slate-50/60 hover:bg-white gap-5"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-black text-slate-900">{name}</h4>
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                            status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : status === 'Revision Needed'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-600">{domain}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                        <span className="flex items-center gap-1.5 font-mono bg-white border border-slate-300 px-2.5 py-1 rounded-lg">
                          <Code2 className="w-3.5 h-3.5 text-slate-500" />
                          {tech}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {duration} Months Duration
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectProject) onSelectProject(proj);
                        onNavigateToWorkspace();
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-blue-600 hover:text-white text-slate-800 border border-slate-300 hover:border-blue-600 text-sm font-extrabold rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
                    >
                      <span>Open Blueprint</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}