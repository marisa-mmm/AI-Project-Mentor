import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Layers, 
  AlertCircle,
  FileText
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function BatchProgressTrackerPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPhase, setFilterPhase] = useState('All');

  useEffect(() => {
    fetchBatchProgress();
  }, []);

  const fetchBatchProgress = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/faculty/blueprints`);
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load batch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseBadge = (phase) => {
    const p = phase || 'Kickoff';
    const colorMap = {
      'UI Design': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Backend APIs': 'bg-blue-50 text-blue-700 border-blue-200',
      'Model Integration': 'bg-purple-50 text-purple-700 border-purple-200',
      'Testing': 'bg-amber-50 text-amber-700 border-amber-200',
      'Thesis Documentation': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const style = colorMap[p] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${style}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {p}
      </span>
    );
  };

  const filteredProjects = projects.filter((proj) => {
    const name = (proj.project_details?.name || proj.name || '').toLowerCase();
    const email = (proj.user_email || '').toLowerCase();
    const phase = (proj.progress?.current_phase || 'Kickoff').toLowerCase();
    const q = search.toLowerCase();

    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesPhase = filterPhase === 'All' || phase.includes(filterPhase.toLowerCase());
    return matchesSearch && matchesPhase;
  });

  const avgCompletion = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress?.completion_percentage || 0), 0) / projects.length)
    : 0;

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            Cohort Monitoring
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Student Progress Tracker
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Monitor real-time student sprint progress, phase transitions, and milestone completion.
          </p>
        </div>

        <button
          onClick={fetchBatchProgress}
          disabled={loading}
          className="px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center gap-2.5 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
          <span>Refresh Live Updates</span>
        </button>
      </div>

      {/* Cohort Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
            {projects.length}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Total Enrolled Projects</div>
            <div className="text-xl font-black text-slate-900">Active Groups</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-black text-lg shrink-0">
            {avgCompletion}%
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Average Milestone Progress</div>
            <div className="text-xl font-black text-slate-900">Cohort Average</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-black text-lg shrink-0">
            {projects.filter(p => (p.progress?.completion_percentage || 0) >= 80).length}
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Viva-Ready Projects</div>
            <div className="text-xl font-black text-slate-900">&gt; 80% Complete</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project or student email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 focus:border-blue-600 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'UI Design', 'Backend APIs', 'Model Integration', 'Testing', 'Thesis Documentation'].map((tab) => {
            const isSelected = filterPhase === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilterPhase(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500">Loading student progress reports...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No student projects found</h3>
            <p className="text-sm font-medium text-slate-500">
              {search ? 'Try adjusting your search criteria.' : 'Enrolled student groups will appear here once they generate their blueprints.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Project Name</th>
                  <th className="py-4 px-6">Submitter</th>
                  <th className="py-4 px-6">Current Phase</th>
                  <th className="py-4 px-6 w-64">Live Progress Bar</th>
                  <th className="py-4 px-6">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredProjects.map((proj, idx) => {
                  const pName = proj.project_details?.name || proj.name || `Project #${idx + 1}`;
                  const domain = proj.project_details?.domain || 'Engineering';
                  const email = proj.user_email || 'student@university.edu';
                  const progress = proj.progress || {};
                  const pct = progress.completion_percentage !== undefined ? progress.completion_percentage : 0;
                  const phase = progress.current_phase || 'Kickoff';
                  const lastUpdated = progress.last_updated || 'Pending initial update';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 leading-snug">{pName}</div>
                        <div className="text-xs font-bold text-slate-400 mt-0.5">{domain}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {email}
                      </td>
                      <td className="py-4 px-6">
                        {getPhaseBadge(phase)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="text-slate-700">{pct}% Complete</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                pct >= 80 
                                  ? 'bg-emerald-500' 
                                  : pct >= 40 
                                    ? 'bg-blue-600' 
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {progress.notes && (
                            <div className="text-[11px] text-slate-500 italic truncate max-w-xs" title={progress.notes}>
                              "{progress.notes}"
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{lastUpdated}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
