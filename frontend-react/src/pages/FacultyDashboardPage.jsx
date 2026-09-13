import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ArrowUpRight, 
  Search, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Check, 
  X, 
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function FacultyDashboardPage({ user, onLogout, onNavigateToReview, onSelectProjectForReview }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('mentees'); // 'mentees' | 'roster'
  
  // Verification Modal State
  const [evaluatingLog, setEvaluatingLog] = useState(null); // { project, logIndex, log }
  const [guideNotes, setGuideNotes] = useState('');
  const [verifyingAction, setVerifyingAction] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/faculty/blueprints`);
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to load faculty dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = projects.length;
  const pending = projects.filter(p => (p.approval_status || 'Pending Review').toLowerCase().includes('pending')).length;
  const approved = projects.filter(p => (p.approval_status || '').toLowerCase().includes('approved')).length;
  const revision = projects.filter(p => (p.approval_status || '').toLowerCase().includes('revision')).length;

  const userEmailClean = (user?.email || '').toLowerCase().trim();
  const myMentees = projects.filter(p => (p.assigned_guide?.guide_email || '').toLowerCase().trim() === userEmailClean);

  const filteredRoster = projects.filter(p => {
    const name = (p.project_details?.name || p.name || '').toLowerCase();
    const domain = (p.project_details?.domain || '').toLowerCase();
    const email = (p.user_email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || domain.includes(q) || email.includes(q);
  });

  const handleOpenProject = (proj) => {
    if (onSelectProjectForReview) {
      onSelectProjectForReview(proj);
    } else {
      onNavigateToReview();
    }
  };

  const handleClaimMentee = async (proj) => {
    const pName = proj.project_details?.name || proj.name;
    if (!pName) return;
    try {
      await axios.post(`${API_BASE}/api/mentor/assign`, {
        project_name: pName,
        guide_name: user?.username || 'Faculty Mentor',
        guide_email: user?.email || 'mentor@university.edu'
      });
      setActionSuccess(`Assigned yourself as guide for "${pName}".`);
      fetchFacultyData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to assign mentor:', err);
    }
  };

  const handleVerifyLog = async (status) => {
    if (!evaluatingLog) return;
    try {
      setVerifyingAction(true);
      await axios.post(`${API_BASE}/api/mentor/verify-log`, {
        project_name: evaluatingLog.project_name,
        log_index: evaluatingLog.logIndex,
        status: status, // "Approved" or "Needs Clarification"
        guide_notes: guideNotes
      });
      setEvaluatingLog(null);
      setGuideNotes('');
      setActionSuccess('Bi-weekly sprint evaluation saved successfully.');
      fetchFacultyData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to verify log:', err);
    } finally {
      setVerifyingAction(false);
    }
  };

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            Academic Evaluation Committee
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Faculty Overview & Review Hub
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Welcome back, <span className="text-slate-900 font-bold">{user?.username || 'Professor'}</span>. Supervise assigned mentees and evaluate departmental capstone submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs">
              <ShieldCheck className="w-5 h-5"/>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">{user?.username || 'Professor'}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">FACULTY</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4"/>
            Sign Out
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Submissions</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{total}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-600">Action Required</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{pending}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Approved Scopes</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{approved}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-blue-600">My Mentees</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{myMentees.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Card with Distinct Tabs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs space-y-6">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('mentees')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'mentees'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>My Mentees</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'mentees' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {myMentees.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-2.5 ${
                activeTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Department Roster</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'roster' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {total}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, domains, students..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-600 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Tab 1: My Mentees View */}
        {activeTab === 'mentees' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400">Loading mentee records...</p>
              </div>
            ) : myMentees.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 max-w-lg mx-auto">
                <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-800">No Mentees Assigned Yet</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                  You are not currently linked as official supervisor on any student project. Switch to the Department Roster tab to claim or assign yourself as guide.
                </p>
                <button
                  onClick={() => setActiveTab('roster')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Browse Department Roster</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myMentees.map((proj, pIdx) => {
                  const pName = proj.project_details?.name || proj.name || 'Untitled';
                  const domain = proj.project_details?.domain || 'Computer Engineering';
                  const email = proj.user_email || 'student@university.edu';
                  const logs = proj.mentor_logs || [];
                  const progressPct = proj.progress?.completion_percentage || 0;

                  return (
                    <div
                      key={pIdx}
                      className="border border-slate-200 rounded-2xl p-6 bg-white hover:border-blue-300 transition-all shadow-2xs space-y-4"
                    >
                      {/* Project Mentee Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg font-black text-slate-900">{pName}</h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                              {domain}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Student Submitter: <span className="text-slate-800 font-bold">{email}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-400 block">Syllabus Progress</span>
                            <span className="text-sm font-black text-slate-900">{progressPct}%</span>
                          </div>
                          <button
                            onClick={() => handleOpenProject(proj)}
                            className="px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Open Blueprint</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bi-Weekly Reporting Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            Bi-Weekly Sprint Logs & Attendance Sign-offs
                          </span>
                          <span className="text-xs font-bold text-slate-400">
                            {logs.length} {logs.length === 1 ? 'submission' : 'submissions'}
                          </span>
                        </div>

                        {logs.length === 0 ? (
                          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-500 italic">
                            Student has not submitted any bi-weekly logs yet.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {logs.map((log, lIdx) => (
                              <div
                                key={lIdx}
                                className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1 max-w-xl">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900">Sprint Log #{lIdx + 1}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="font-bold text-slate-600">{log.hours_spent || 0} Hours Logged</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-400 text-[11px]">{log.timestamp || 'Recent'}</span>
                                  </div>
                                  <p className="text-slate-700 font-medium leading-relaxed">
                                    {log.summary}
                                  </p>
                                  {log.blockers && (
                                    <p className="text-rose-700 font-semibold text-[11px]">
                                      Blockers: {log.blockers}
                                    </p>
                                  )}
                                  {log.guide_notes && (
                                    <p className="text-blue-800 font-semibold text-[11px] bg-blue-50 px-2 py-1 rounded border border-blue-100 mt-1">
                                      Guide Remarks: "{log.guide_notes}"
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${
                                    log.status === 'Approved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : log.status === 'Needs Clarification'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}>
                                    {log.status || 'Pending Guide Approval'}
                                  </span>

                                  <button
                                    onClick={() => {
                                      setEvaluatingLog({
                                        project_name: pName,
                                        logIndex: lIdx,
                                        log: log
                                      });
                                      setGuideNotes(log.guide_notes || '');
                                    }}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-all cursor-pointer shadow-2xs"
                                  >
                                    Evaluate
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Department Roster View */}
        {activeTab === 'roster' && (
          <div>
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400">Loading student rosters...</p>
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-sm">
                No submissions matched your search.
              </div>
            ) : (
              <div className="max-h-[480px] overflow-y-auto pr-1 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white z-10 shadow-2xs border-b border-slate-100">
                    <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="pb-3 px-2">Project Name</th>
                      <th className="pb-3 px-2">Domain</th>
                      <th className="pb-3 px-2">Submitter</th>
                      <th className="pb-3 px-2">Assigned Guide</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRoster.map((proj, idx) => {
                      const pName = proj.project_details?.name || proj.name || 'Untitled';
                      const domain = proj.project_details?.domain || 'Software Engineering';
                      const email = proj.user_email || 'student@university.edu';
                      const status = proj.approval_status || 'Pending Review';
                      const guide = proj.assigned_guide?.guide_name || null;
                      const isMyMentee = (proj.assigned_guide?.guide_email || '').toLowerCase().trim() === userEmailClean;

                      return (
                        <tr 
                          key={idx} 
                          onClick={() => handleOpenProject(proj)}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        >
                          <td className="py-4 px-2 font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            {pName}
                          </td>
                          <td className="py-4 px-2 text-slate-600 text-xs font-bold">{domain}</td>
                          <td className="py-4 px-2 text-slate-500 text-xs font-medium">{email}</td>
                          <td className="py-4 px-2 text-xs">
                            {guide ? (
                              <span className={`inline-flex items-center gap-1 font-bold ${isMyMentee ? 'text-blue-700' : 'text-slate-700'}`}>
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                {guide}
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimMentee(proj);
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-md font-bold text-[11px] transition-all cursor-pointer"
                              >
                                + Claim as Guide
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-2">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-black ${
                              status.toLowerCase().includes('approved')
                                ? 'bg-emerald-50 text-emerald-700'
                                : status.toLowerCase().includes('revision')
                                ? 'bg-amber-50 text-amber-700'
                                : status.toLowerCase().includes('rejected')
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenProject(proj);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              Review Blueprint
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guide Bi-Weekly Log Evaluation Modal */}
      {evaluatingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Evaluate Bi-Weekly Log</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Project: <span className="font-bold text-slate-800">{evaluatingLog.project_name}</span>
                </p>
              </div>
              <button
                onClick={() => setEvaluatingLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Logged Hours: <strong className="text-slate-900">{evaluatingLog.log.hours_spent || 0} hrs</strong></span>
                <span>Date: {evaluatingLog.log.timestamp || 'Recent'}</span>
              </div>
              <p className="text-slate-800 font-medium leading-relaxed">
                {evaluatingLog.log.summary}
              </p>
              {evaluatingLog.log.blockers && (
                <p className="text-rose-700 font-semibold text-[11px] pt-1">
                  Reported Blocker: {evaluatingLog.log.blockers}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Guide Evaluation Notes / Guidance
              </label>
              <textarea
                rows={3}
                value={guideNotes}
                onChange={(e) => setGuideNotes(e.target.value)}
                placeholder="Add feedback, next sprint objectives, or required clarifications..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={verifyingAction}
                onClick={() => handleVerifyLog('Needs Clarification')}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-all cursor-pointer"
              >
                Request Clarification
              </button>
              <button
                type="button"
                disabled={verifyingAction}
                onClick={() => handleVerifyLog('Approved')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Approve Log Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}