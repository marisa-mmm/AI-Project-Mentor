import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function BenchmarksPage() {
  const [allProjects, setAllProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/faculty/blueprints')
      .then((res) => setAllProjects(res.data))
      .catch(() => setAllProjects([]));
  }, []);

  const filtered = allProjects.filter((p) =>
    (p.project_details?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.project_details?.domain || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Peer Review & Academic Showcase</h2>
          <p className="text-xs text-slate-500">Transparent benchmarks, novelty ratings, and faculty remarks</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or domains..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, idx) => {
          const det = item.project_details || {};
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{det.name}</h3>
                  <span className="text-xs text-blue-600 font-medium">{det.domain}</span>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                  item.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.approval_status || 'Pending'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700">
                <span className="font-semibold block text-slate-900 mb-1">Problem Formulation:</span>
                <p className="line-clamp-2">{det.problem_statement}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Novelty Score: <b className="text-slate-900">{item.novelty_score?.novelty_score || 0}%</b>
                </span>
                {item.faculty_feedback && (
                  <span className="text-slate-600 italic">
                    Faculty: "{item.faculty_feedback}"
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}