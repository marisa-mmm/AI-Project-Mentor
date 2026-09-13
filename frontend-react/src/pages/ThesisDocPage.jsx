import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  FileDown, 
  CheckCircle2, 
  FolderGit2, 
  GraduationCap,
  BookOpen,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Check
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function ThesisPage({ user, activeBlueprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    activeBlueprint?.project_details?.name || activeBlueprint?.name || ''
  );
  const [activeProject, setActiveProject] = useState(activeBlueprint || null);
  const [fullThesisText, setFullThesisText] = useState('');
  const [loadingReport, setLoadingReport] = useState(false);
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
    if (user?.email) {
      axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          const list = res.data || [];
          setProjects(list);
          if (!selectedProject && list.length > 0) {
            const first = list[0];
            const pName = first.project_details?.name || first.name || '';
            setSelectedProject(pName);
            setActiveProject(first);
          }
        })
        .catch(err => console.error("Error loading project reports:", err));
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const found = projects.find(
        p => (p.project_details?.name || p.name) === selectedProject
      );
      if (found) setActiveProject(found);
    }
  }, [selectedProject, projects]);

  // Load or generate the complete 14-section thesis manuscript
  useEffect(() => {
    if (!selectedProject) return;
    setLoadingReport(true);
    axios.get(`${API_BASE}/api/project/full-thesis?project_name=${encodeURIComponent(selectedProject)}`)
      .then(res => {
        setFullThesisText(res.data?.report || '');
      })
      .catch(err => {
        console.error("Error fetching full thesis report:", err);
      })
      .finally(() => setLoadingReport(false));
  }, [selectedProject]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            Official University Submission
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Thesis & Submission Report
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Complete 14-section academic manuscript ready for evaluation and black-book binding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl shadow-xs transition-all cursor-pointer max-w-sm sm:max-w-md text-left"
            >
              <div className="truncate flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 truncate">
                  {activeProject?.project_details?.name || activeProject?.name || 'Select Project'}
                </span>
                {activeProject?.project_details?.domain && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[11px] font-black uppercase text-blue-700 shrink-0">
                    {activeProject.project_details.domain}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {projects.map((proj, idx) => {
                  const name = proj.project_details?.name || proj.name;
                  const domain = proj.project_details?.domain || 'General';
                  const status = proj.approval_status || 'Pending Review';
                  const isSelected = (activeProject?.name === proj.name || activeProject?.project_details?.name === name);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveProject(proj);
                        setSelectedProject(name);
                        setDropdownOpen(false);
                      }}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <p className="text-sm font-black text-slate-900 truncate">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {domain}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {status}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]"/>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Thesis Download Button */}
          {selectedProject && (
            <a
              href={`${API_BASE}/api/export/thesis-pdf?project_name=${encodeURIComponent(selectedProject)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <FileDown className="w-5 h-5 stroke-[2.5]" />
              <span>Download 14-Section Thesis (PDF)</span>
            </a>
          )}
        </div>
      </div>

      {/* Faculty Thesis Revision Comments Alert Banner */}
      {activeProject?.thesis_comments && activeProject.thesis_comments.length > 0 && (
        <div className="space-y-3 shrink-0 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-amber-900 px-1">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-900">
              Faculty Revision Action Items ({activeProject.thesis_comments.length})
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 max-h-36 overflow-y-auto pr-2">
            {activeProject.thesis_comments.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 bg-amber-50/90 border-2 border-amber-300/90 rounded-2xl text-amber-900 shadow-xs flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 font-black">
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                      {item.section || 'General'}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      Evaluator: {item.faculty_email || 'Faculty Advisor'} • {item.created_at || 'Recent'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-amber-950 mt-1 leading-snug">
                    Faculty Revision Required: [{item.section || 'General'}] - {item.comment}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full 14-Section Manuscript Display */}
      {activeProject ? (
        <div className="mt-6 bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
          <div className="border-b-2 border-slate-900 pb-6">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">
              14-Section Capstone Report Manuscript
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {activeProject.project_details?.name || activeProject.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mt-2">
              <span>Domain: <b className="text-slate-800">{activeProject.project_details?.domain || 'Computer Engineering'}</b></span>
              <span>•</span>
              <span>Timeline: <b className="text-slate-800">{activeProject.project_details?.duration_months || 3} Months</b></span>
              <span>•</span>
              <span>Status: <b className="text-blue-600">{activeProject.approval_status || 'Pending Final Review'}</b></span>
            </div>
          </div>

          {loadingReport ? (
            <div className="py-24 text-center space-y-3">
              <span className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin inline-block" />
              <p className="text-sm font-bold text-slate-600">
                Compiling 14-section thesis manuscript...
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/70 p-6 sm:p-10 rounded-2xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-4 text-slate-700 leading-relaxed font-normal last:mb-0" {...props} />,
                  strong: ({ node, ...props }) => {
                    const text = String(props.children);
                    if (/^\d+\.\s+/.test(text)) {
                      return (
                        <span className="block text-lg font-black text-slate-950 mt-6 mb-2 pb-1 border-b border-slate-200">
                          {props.children}
                        </span>
                      );
                    }
                    return <strong className="font-extrabold text-slate-950 inline" {...props} />;
                  },
                  ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 mb-4 ml-5" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 mb-4 ml-5" {...props} />,
                  li: ({ node, ...props }) => <li className="text-slate-700 font-medium leading-relaxed" {...props} />
                }}
              >
                {fullThesisText}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No project selected</h3>
          <p className="text-sm text-slate-400 mt-1">
            Create a project from the "Create New Project" tab to view its full thesis report.
          </p>
        </div>
      )}
    </div>
  );
}