import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Sparkles, 
  Clock, 
  Calendar,
  FolderGit2,
  ChevronDown,
  Check
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const PHASES = [
  { id: 'UI Design', label: 'UI Design', desc: 'Wireframing, mockups, and client frontend design' },
  { id: 'Backend APIs', label: 'Backend APIs', desc: 'Database setup, endpoints, authentication, and core logic' },
  { id: 'Model Integration', label: 'Model Integration', desc: 'ML models, AI pipelines, algorithmic reasoning' },
  { id: 'Testing', label: 'Testing', desc: 'Unit testing, user flows, validation, and bug fixes' },
  { id: 'Thesis Documentation', label: 'Thesis Documentation', desc: '14-section report, thesis formatting, slide preparation' }
];

export default function StudentProgressUpdatePage({ user, activeBlueprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(25);
  const [currentPhase, setCurrentPhase] = useState('UI Design');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    fetchStudentProjects();
  }, [user]);

  const fetchStudentProjects = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`);
      const list = res.data || [];
      setProjects(list);

      // Select activeBlueprint if matching, else first project
      const initial = activeBlueprint 
        ? list.find(p => (p.project_details?.name || p.name) === (activeBlueprint.project_details?.name || activeBlueprint.name)) || list[0]
        : list[0];

      if (initial) {
        setSelectedProject(initial);
        applyProjectState(initial);
      }
    } catch (err) {
      console.error('Failed to load student projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyProjectState = (proj) => {
    const pName = proj.project_details?.name || proj.name || '';
    setSelectedProjectName(pName);
    if (proj.progress) {
      setCompletionPercentage(proj.progress.completion_percentage ?? 25);
      setCurrentPhase(proj.progress.current_phase || 'UI Design');
      setNotes(proj.progress.notes || '');
    } else {
      setCompletionPercentage(25);
      setCurrentPhase('UI Design');
      setNotes('');
    }
  };

  const handleSaveProgress = async (e) => {
    e.preventDefault();
    if (!selectedProjectName) {
      setErrorMsg('Please select an active project.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        project_name: selectedProjectName,
        user_email: user.email,
        completion_percentage: Number(completionPercentage),
        current_phase: currentPhase,
        notes: notes.trim()
      };

      await axios.post(`${API_BASE}/api/student/update-progress`, payload);
      setSuccessMsg('Your project milestone progress has been synced with faculty!');

      // Update local state
      setProjects(prev => prev.map(p => {
        const match = (p.project_details?.name || p.name) === selectedProjectName;
        if (match) {
          return {
            ...p,
            progress: {
              completion_percentage: Number(completionPercentage),
              current_phase: currentPhase,
              notes: notes.trim(),
              last_updated: 'Today'
            }
          };
        }
        return p;
      }));

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update student progress:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update progress. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Milestone Tracking
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            My Progress Update
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Keep your faculty advisor and evaluation committee updated on project phases and milestones.
          </p>
        </div>
      </div>

      {/* Toast Feedback */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm flex items-center gap-2.5 shrink-0 my-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold text-sm flex items-center gap-2.5 shrink-0 my-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveProgress} className="mt-6 space-y-6">
        {/* Project Selector Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <label className="block text-base font-black text-slate-900">
              Active Project
            </label>
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {projects.length} Saved {projects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>

          {projects.length === 0 && !loading ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center">
              <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No project blueprint created yet.</p>
              <p className="text-xs text-slate-500 mt-1">Create a project blueprint from the workspace first.</p>
            </div>
          ) : (
            <div className="relative w-full" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl shadow-xs transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-base font-black text-slate-900 truncate">
                    {selectedProject?.project_details?.name || selectedProject?.name || selectedProjectName || 'Select Project'}
                  </span>
                  {selectedProject?.project_details?.domain && (
                    <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[11px] font-black uppercase tracking-wider text-blue-700 shrink-0">
                      {selectedProject.project_details.domain}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                  {projects.map((proj, idx) => {
                    const pName = proj.project_details?.name || proj.name || 'Untitled';
                    const pDomain = proj.project_details?.domain || 'General';
                    const pProgress = proj.progress?.completion_percentage ?? 0;
                    const pPhase = proj.progress?.current_phase || 'Kickoff';
                    const isSelected = (selectedProject?.name === proj.name || selectedProject?.project_details?.name === pName);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedProject(proj);
                          applyProjectState(proj);
                          setDropdownOpen(false);
                        }}
                        className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected ? 'bg-blue-50/80 border border-blue-200/80' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900 truncate">{pName}</p>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black uppercase text-slate-600 shrink-0">
                              {pDomain}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            {pProgress}% Complete &bull; {pPhase}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]"/>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-Time Progress Slider */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Overall Completion Percentage
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Slide to reflect your development completion status
              </p>
            </div>
            <div className="text-3xl font-black text-blue-600 tracking-tight">
              {completionPercentage}%
            </div>
          </div>

          {/* Progress Bar Visualizer */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={completionPercentage}
            onChange={(e) => setCompletionPercentage(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
            <span>0% (Kickoff)</span>
            <span>25% (Architecture)</span>
            <span>50% (Core Features)</span>
            <span>75% (Testing & QA)</span>
            <span>100% (Viva Ready)</span>
          </div>
        </div>

        {/* Current Phase Selector */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Current Project Phase
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Select which sprint your group is currently actively working on
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PHASES.map((phase) => {
              const isSelected = currentPhase === phase.id;
              return (
                <div
                  key={phase.id}
                  onClick={() => setCurrentPhase(phase.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/10'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900">
                      {phase.label}
                    </span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Notes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-4">
          <div>
            <label className="block text-lg font-black text-slate-900">
              Milestone Notes & Key Accomplishments
            </label>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Briefly describe recent achievements, blockers resolved, or upcoming viva goals
            </p>
          </div>

          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Completed authentication endpoints and integrated React login form. Starting on database indexing and API error middleware..."
            className="w-full p-4 bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-xs"
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={saving || projects.length === 0}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Syncing Progress with Faculty...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 stroke-[2.5]" />
              <span>Save My Progress</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
