import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Search, 
  GraduationCap, 
  Sliders, 
  FileText, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

import CustomSelect from '../components/CustomSelect';

export default function VivaGradingPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [vivaScores, setVivaScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [archScore, setArchScore] = useState(8);      // / 10
  const [codeScore, setCodeScore] = useState(16);     // / 20
  const [presScore, setPresScore] = useState(8);      // / 10
  const [vivaScore, setVivaScore] = useState(8);      // / 10
  const [verdict, setVerdict] = useState('Excellent');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const totalScore = Number(archScore) + Number(codeScore) + Number(presScore) + Number(vivaScore);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projRes, scoresRes] = await Promise.all([
        axios.get(`${API_BASE}/api/faculty/blueprints`),
        axios.get(`${API_BASE}/api/faculty/viva-scores`)
      ]);
      const pList = projRes.data || [];
      setProjects(pList);
      setVivaScores(scoresRes.data || []);

      if (pList.length > 0) {
        const first = pList[0];
        const fName = first.project_details?.name || first.name || '';
        setSelectedProjectName(fName);
        setStudentEmail(first.user_email || 'student@university.edu');
      }
    } catch (err) {
      console.error('Failed to load viva grading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const targetName = e.target.value;
    setSelectedProjectName(targetName);
    const target = projects.find(p => (p.project_details?.name || p.name) === targetName);
    if (target) {
      setStudentEmail(target.user_email || 'student@university.edu');
    }
  };

  const handleSubmitScorecard = async (e) => {
    e.preventDefault();
    if (!selectedProjectName) {
      setErrorMsg('Please select a project to evaluate.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        project_name: selectedProjectName,
        student_email: studentEmail,
        faculty_email: user?.email || 'faculty@university.edu',
        architecture_score: Number(archScore),
        code_execution_score: Number(codeScore),
        presentation_score: Number(presScore),
        viva_qa_score: Number(vivaScore),
        total_score: totalScore,
        verdict: verdict,
        examiner_remarks: remarks.trim() || 'Candidate successfully defended project design and implementation.'
      };

      await axios.post(`${API_BASE}/api/faculty/viva-grading`, payload);
      setSuccessMsg(`Evaluation recorded for "${selectedProjectName}" with Total Score: ${totalScore}/50 (${verdict})`);

      // Refresh scores list
      const scoresRes = await axios.get(`${API_BASE}/api/faculty/viva-scores`);
      setVivaScores(scoresRes.data || []);

      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to submit viva scorecard:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to record grading. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const getVerdictBadge = (v) => {
    const val = (v || 'Satisfactory').toLowerCase();
    if (val.includes('excellent')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
          Excellent
        </span>
      );
    }
    if (val.includes('re-exam') || val.includes('resubmit')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
          Re-examination
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
        Satisfactory
      </span>
    );
  };

  return (
    <div className="p-8 sm:p-12 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-wider mb-2">
          <Award className="w-4 h-4 text-amber-600" />
          Viva & Defense Rubric
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Viva & Presentation Grading
        </h1>
        <p className="text-base font-medium text-slate-500 mt-1">
          Structured 50-point examination rubric assessing architecture, execution, presentation, and viva defense.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Form & Real-Time Scorecard */}
      <form onSubmit={handleSubmitScorecard} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Rubric Sliders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs space-y-4">
            <label className="block text-base font-black text-slate-900">
              Select Candidate / Project Under Review
            </label>
            <CustomSelect
              value={selectedProjectName}
              onChange={(val) => {
                setSelectedProjectName(val);
                const target = projects.find(p => (p.project_details?.name || p.name) === val);
                if (target) {
                  setStudentEmail(target.user_email || 'student@university.edu');
                }
              }}
              options={projects.map((p, idx) => {
                const name = p.project_details?.name || p.name || `Project #${idx + 1}`;
                return {
                  value: name,
                  label: name,
                  badge: p.project_details?.domain || 'Engineering',
                  subtitle: p.user_email
                };
              })}
              placeholder="Select candidate project under evaluation..."
            />
          </div>

          {/* 4 Rubric Criteria */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs space-y-7">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Assessment Dimensions (50 Points Total)
            </h2>

            {/* 1. Architecture & Design (/ 10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">1. System Architecture & Modularity</div>
                  <div className="text-xs text-slate-500">Separation of concerns, clean interfaces, scalability</div>
                </div>
                <div className="text-lg font-black text-blue-600 font-mono">{archScore} / 10</div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={archScore}
                onChange={(e) => setArchScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 2. Code Execution & Implementation (/ 20) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">2. Code Implementation & Execution</div>
                  <div className="text-xs text-slate-500">Working prototype, error handling, security, code cleanliness</div>
                </div>
                <div className="text-lg font-black text-blue-600 font-mono">{codeScore} / 20</div>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={codeScore}
                onChange={(e) => setCodeScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 3. Presentation & Slide Clarity (/ 10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">3. Presentation & Slide Clarity</div>
                  <div className="text-xs text-slate-500">Problem articulation, visual diagrams, time management</div>
                </div>
                <div className="text-lg font-black text-blue-600 font-mono">{presScore} / 10</div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={presScore}
                onChange={(e) => setPresScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* 4. Viva Defense & Q&A (/ 10) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-slate-900">4. Viva Defense & Technical Q&A</div>
                  <div className="text-xs text-slate-500">Depth of answers, theoretical foundation, trade-off understanding</div>
                </div>
                <div className="text-lg font-black text-blue-600 font-mono">{vivaScore} / 10</div>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={vivaScore}
                onChange={(e) => setVivaScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Examiner Remarks */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs space-y-3">
            <label className="block text-sm font-black text-slate-900">
              Examiner Remarks & Viva Feedback
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Candidate demonstrated exceptional technical mastery in API architecture. Recommended for departmental capstone honors..."
              className="w-full p-4 bg-white border border-slate-300 focus:border-blue-600 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none shadow-xs"
            />
          </div>
        </div>

        {/* Right Col: Live Total & Verdict Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs space-y-6 sticky top-6">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">Total Evaluated Score</div>
              <div className="text-6xl font-black text-slate-900 tracking-tight mt-1">
                {totalScore}
                <span className="text-2xl text-slate-400 font-normal"> / 50</span>
              </div>
              <div className="text-xs font-bold text-blue-600 mt-2">
                {Math.round((totalScore / 50) * 100)}% Overall Score
              </div>
            </div>

            {/* Verdict Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Committee Verdict
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'Excellent', label: 'Excellent', desc: '40–50 pts • Honors defense' },
                  { id: 'Satisfactory', label: 'Satisfactory', desc: '25–39 pts • Standard pass' },
                  { id: 'Re-examination', label: 'Re-examination', desc: '< 25 pts • Major rework needed' }
                ].map((item) => {
                  const isSelected = verdict === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setVerdict(item.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-sm font-black">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recording Scorecard...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 stroke-[2.5]" />
                  <span>Submit Viva Grade</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Graded Viva Scorecards History */}
      <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Evaluated Viva Scorecards ({vivaScores.length})
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Historical viva examination records and rubric marks
            </p>
          </div>
        </div>

        {vivaScores.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold text-sm">
            No candidates graded yet. Submit your first viva scorecard above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4 text-center">Arch (/10)</th>
                  <th className="py-3 px-4 text-center">Code (/20)</th>
                  <th className="py-3 px-4 text-center">Pres (/10)</th>
                  <th className="py-3 px-4 text-center">Viva (/10)</th>
                  <th className="py-3 px-4 text-center">Total (/50)</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {vivaScores.map((score, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{score.project_name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{score.student_email}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{score.architecture_score}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{score.code_execution_score}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{score.presentation_score}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{score.viva_qa_score}</td>
                    <td className="py-3.5 px-4 text-center font-black text-blue-600 font-mono text-base">
                      {score.total_score}
                    </td>
                    <td className="py-3.5 px-4">{getVerdictBadge(score.verdict)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 truncate max-w-xs" title={score.examiner_remarks}>
                      {score.examiner_remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
