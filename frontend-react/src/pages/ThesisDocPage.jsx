import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  BookText, 
  FileDown, 
  FileType, 
  CheckCircle2, 
  ChevronDown, 
  FolderGit2, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function ThesisPage({ user, activeBlueprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    activeBlueprint?.project_details?.name || activeBlueprint?.name || ''
  );
  const [activeProject, setActiveProject] = useState(activeBlueprint || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          setProjects(res.data || []);
          if (!selectedProject && res.data && res.data.length > 0) {
            const first = res.data[0];
            setSelectedProject(first.project_details?.name || first.name || '');
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

  const reportSections = [
    {
      number: '01',
      title: 'Idea Feasibility & Evaluation',
      content: activeProject?.idea_evaluation
    },
    {
      number: '02',
      title: 'Project Scope, Boundaries & Non-Goals',
      content: activeProject?.scope_definition
    },
    {
      number: '03',
      title: 'Architectural Technology Stack',
      content: activeProject?.technology_stack
    },
    {
      number: '04',
      title: 'Sprint Planning & Milestone Roadmap',
      content: activeProject?.time_planning || activeProject?.timeline_milestones
    },
    {
      number: '05',
      title: 'Risk Assessment & Mitigation Protocols',
      content: activeProject?.risk_assessment
    },
    {
      number: '06',
      title: '14-Section Thesis & Submission Specifications',
      content: activeProject?.thesis_format || activeProject?.documentation_plan
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            Academic Thesis Documentation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Thesis & Capstone Specification
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Complete 14-section university syllabus outline and downloadable submission manuscript.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Project Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl shadow-xs transition-all cursor-pointer min-w-[220px]"
            >
              <div className="flex items-center gap-2 truncate">
                <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-black text-slate-800 truncate">
                  {selectedProject || 'Select Project...'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 flex justify-between">
                  <span>Switch Document</span>
                  <span>{projects.length} Total</span>
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {projects.map((p, idx) => {
                    const pName = p.project_details?.name || p.name || `Project ${idx + 1}`;
                    const isSelected = pName === selectedProject;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedProject(pName);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{pName}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export Buttons (Side-by-side) */}
          {selectedProject && (
            <div className="flex items-center gap-2 flex-nowrap shrink-0">
              <a
                href={`${API_BASE}/api/export/pdf?project_name=${encodeURIComponent(selectedProject)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileDown className="w-4 h-4 stroke-[2.5]" />
                <span>Download PDF Report</span>
              </a>
              <a
                href={`${API_BASE}/api/export/docx?project_name=${encodeURIComponent(selectedProject)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <FileType className="w-4 h-4 stroke-[2.5]" />
                <span>Download Word (.docx)</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Document Manuscript Layout */}
      {activeProject ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 shadow-sm space-y-12">
          {/* Cover Header Banner */}
          <div className="border-b-2 border-slate-900 pb-6">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 block">
              University Capstone Specification
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {activeProject.project_details?.name || activeProject.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 mt-2">
              <span>Domain: <b className="text-slate-800">{activeProject.project_details?.domain || 'Computer Engineering'}</b></span>
              <span>•</span>
              <span>Estimated Timeline: <b className="text-slate-800">{activeProject.project_details?.duration_months || 3} Months</b></span>
              <span>•</span>
              <span>Status: <b className="text-blue-600">{activeProject.approval_status || 'Pending Final Defense'}</b></span>
            </div>
          </div>

          {/* Rendered 6 Sections */}
          {reportSections.map((sec, idx) => (
            <div key={idx} className="space-y-4">
              <div>
                <span className="text-xs font-black tracking-widest text-blue-600 uppercase">
                  SECTION {sec.number}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {sec.title}
                </h3>
              </div>

              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed">
                {sec.content ? (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 text-slate-700 leading-relaxed font-normal last:mb-0" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-extrabold text-slate-950 inline" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-2 mb-4 ml-5" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-2 mb-4 ml-5" {...props} />,
                      li: ({ node, ...props }) => <li className="text-slate-700 font-medium" {...props} />,
                      code: ({ node, inline, className, children, ...props }) => {
                        return !inline ? (
                          <pre className="my-3 rounded-xl overflow-x-auto border border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        ) : (
                          <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs font-semibold" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {sec.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-slate-400 italic text-sm">
                    No documentation generated for this section yet.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center">
          <BookText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No active blueprint selected</h3>
          <p className="text-sm text-slate-400 mt-1">
            Generate a project from the "Create New Project" tab to produce your full academic thesis manuscript.
          </p>
        </div>
      )}
    </div>
  );
}