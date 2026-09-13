import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, FolderKanban, Calendar, ArrowRight, FileDown, FileType } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function ProjectHistoryPage({ user, onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then(res => setProjects(res.data || []))
        .catch(err => console.error("History fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="pb-8 border-b border-slate-200 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-3">
          <History className="w-4 h-4 stroke-[2.5]" />
          Project Archive
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Project History</h1>
        <p className="text-base sm:text-lg font-semibold text-slate-500 mt-1.5">
          Review and download blueprints for all generated projects.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-400 font-bold text-lg">Loading archived projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <FolderKanban className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <p className="text-xl font-bold text-slate-800">No project history found</p>
          <p className="text-base text-slate-400 mt-1">Create your first project blueprint to see it archived here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((proj, idx) => {
            const name = proj.project_details?.name || proj.name || "Untitled Project";
            const domain = proj.project_details?.domain || "General";
            const duration = proj.project_details?.duration_months || 3;
            const status = proj.approval_status || "Pending Review";

            return (
              <div 
                key={idx} 
                className="p-7 sm:p-8 bg-white border border-slate-200 hover:border-blue-500 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all shadow-xs hover:shadow-md"
              >
                {/* Project Info Block */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{name}</h3>
                    <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                      {status}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-600">
                    {domain}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 pt-1">
                    <Calendar className="w-4 h-4 stroke-[2.2] text-slate-400" />
                    <span>{duration} Months Estimated Timeline</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href={`${API_BASE}/api/export/pdf?project_name=${encodeURIComponent(name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <FileDown className="w-4 h-4 text-red-600 stroke-[2.5]" />
                    <span>PDF</span>
                  </a>

                  <a
                    href={`${API_BASE}/api/export/docx?project_name=${encodeURIComponent(name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <FileType className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                    <span>Word</span>
                  </a>

                  <button
                    onClick={() => onSelectProject(proj)}
                    className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 active:scale-[0.98]"
                  >
                    <span>View Blueprint</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}