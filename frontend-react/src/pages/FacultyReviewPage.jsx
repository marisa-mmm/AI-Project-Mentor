import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, AlertTriangle, XCircle, Save } from 'lucide-react';

export default function FacultyReviewPage() {
  const [blueprints, setBlueprints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('Approved');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBlueprints = () => {
    axios.get('http://localhost:8000/api/faculty/blueprints')
      .then((res) => {
        setBlueprints(res.data);
        if (res.data?.length > 0 && !selected) {
          setSelected(res.data[0]);
          setStatus(res.data[0].approval_status || 'Pending Review');
          setComments(res.data[0].faculty_feedback || '');
        }
      })
      .catch(() => setBlueprints([]));
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const handleSelectProject = (proj) => {
    setSelected(proj);
    setStatus(proj.approval_status || 'Pending Review');
    setComments(proj.faculty_feedback || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await axios.post('http://localhost:8000/api/faculty/review', {
        project_name: selected.project_details.name,
        status,
        comments
      });
      alert('Review saved successfully.');
      fetchBlueprints();
    } catch {
      alert('Failed to save review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Faculty Review & Student Evaluation Portal</h2>
        <p className="text-xs text-slate-500">Evaluate architecture blueprints, approve scopes, and provide feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Submissions List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Submitted Projects</h3>
          {blueprints.map((item, idx) => {
            const active = selected?.project_details?.name === item.project_details?.name;
            return (
              <div
                key={idx}
                onClick={() => handleSelectProject(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  active ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900">{item.project_details?.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    item.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.approval_status || 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.user_email}</p>
              </div>
            );
          })}
        </div>

        {/* Selected Project Details & Grading Form */}
        {selected && (
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">{selected.project_details?.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{selected.project_details?.domain} • Submitted by {selected.user_email}</p>

              <div className="bg-slate-50 p-4 rounded-lg text-xs text-slate-700 mb-6">
                <span className="font-bold block text-slate-900 mb-1">Problem Statement:</span>
                {selected.project_details?.problem_statement}
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 max-h-80 overflow-y-auto border p-4 rounded-lg mb-6">
                <h4 className="text-xs font-bold uppercase text-slate-500">Agent Idea Evaluation</h4>
                <ReactMarkdown>{selected.idea_evaluation}</ReactMarkdown>
              </div>

              {/* Review Input Form */}
              <form onSubmit={handleSaveReview} className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Evaluation Verdict
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Faculty Remarks & Revision Notes
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g., Narrow the MVP to two core modes and refine the schema before final defense."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Submit Official Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}