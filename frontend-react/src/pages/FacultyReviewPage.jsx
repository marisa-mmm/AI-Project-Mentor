import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, 
  Send, 
  Eye, 
  Layers, 
  Code2, 
  Calendar, 
  ShieldAlert, 
  FileText,
  X,
  Sparkles,
  Bot,
  User,
  Search,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  MessageSquare
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const SECTION_NAMES = {
  idea: 'Feasibility & Academic Merit',
  scope: 'Scope & Deliverables',
  tech: 'Technology Stack',
  plan: 'Time Planning & Milestones',
  risk: 'Risk Mitigation',
  thesis: 'Thesis Documentation Outline'
};

// Formats raw LLM markdown into styled HTML elements
function FormattedContent({ text }) {
  if (!text) return <p className="text-slate-400 italic">No content recorded.</p>;

  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Detect Subheadings like **1. Is this a good academic project?** or ## Headings
        if (
          (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 90) ||
          trimmed.match(/^\*{0,2}\d+\.\s+.*?\*{0,2}$/)
        ) {
          const cleanHeading = trimmed.replace(/\*\*/g, '').replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-base font-black text-slate-900 pt-3 pb-1 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block"></span>
              {cleanHeading}
            </h4>
          );
        }

        // Detect Bullets
        if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const cleanBullet = trimmed.replace(/^[*\-•]\s*/, '');
          const formatted = cleanBullet.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2">
              <span className="text-blue-500 font-black mt-1">•</span>
              <p 
                className="flex-1 text-[15px] text-slate-700" 
                dangerouslySetInnerHTML={{ __html: formatted }} 
              />
            </div>
          );
        }

        // Standard Paragraph with bold replacements
        const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return (
          <p 
            key={idx} 
            className="text-[15px] text-slate-700"
            dangerouslySetInnerHTML={{ __html: formatted }} 
          />
        );
      })}
    </div>
  );
}

export default function FacultyReviewPage({ user, selectedProject, onClearSelectedProject }) {
  const [blueprints, setBlueprints] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [status, setStatus] = useState('Approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // AI Summary State
  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  // Modal State
  const [showFullBlueprintModal, setShowFullBlueprintModal] = useState(false);
  const [modalTab, setModalTab] = useState('idea');

  // Thesis Revision Comments State
  const [sectionComment, setSectionComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [commentStatusMsg, setCommentStatusMsg] = useState('');

  const handleSaveSectionComment = async () => {
    if (!sectionComment.trim() || !activeProject) return;
    try {
      setSavingComment(true);
      const secName = SECTION_NAMES[modalTab] || modalTab;
      const projName = activeProject.project_details?.name || activeProject.name || '';
      await axios.post(`${API_BASE}/api/faculty/thesis-comment`, {
        project_name: projName,
        faculty_email: user?.email || 'faculty@university.edu',
        section: secName,
        comment: sectionComment.trim()
      });
      setCommentStatusMsg('Revision comment saved!');
      const newComment = {
        faculty_email: user?.email || 'faculty@university.edu',
        section: secName,
        comment: sectionComment.trim(),
        created_at: 'Recent'
      };
      setActiveProject(prev => ({
        ...prev,
        thesis_comments: [...(prev?.thesis_comments || []), newComment]
      }));
      setSectionComment('');
      setTimeout(() => setCommentStatusMsg(''), 4000);
    } catch (err) {
      console.error('Failed to submit thesis comment:', err);
    } finally {
      setSavingComment(false);
    }
  };

  useEffect(() => {
    fetchBlueprints();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setActiveProject(selectedProject);
      setStatus(selectedProject.approval_status || 'Approved');
      setFeedback(selectedProject.faculty_feedback || '');
      setAiSummary('');
    }
  }, [selectedProject]);

  const fetchBlueprints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/faculty/blueprints`);
      const data = res.data || [];
      setBlueprints(data);
      if (!selectedProject && data.length > 0) {
        setActiveProject(data[0]);
        setStatus(data[0].approval_status || 'Approved');
        setFeedback(data[0].faculty_feedback || '');
      }
    } catch (err) {
      console.error('Failed to load blueprints:', err);
    }
  };

  const handleSelectProject = (proj) => {
    setActiveProject(proj);
    setStatus(proj.approval_status || 'Approved');
    setFeedback(proj.faculty_feedback || '');
    setMessage('');
    setAiSummary('');
  };

  const handleGenerateSummary = async () => {
    if (!activeProject) return;
    setSummarizing(true);
    try {
      const res = await axios.post(`${API_BASE}/api/faculty/summarize`, {
        name: activeProject.project_details?.name || activeProject.name,
        problem: activeProject.project_details?.problem_statement || '',
        idea_eval: activeProject.idea_evaluation || '',
        scope_def: activeProject.scope_definition || ''
      });
      setAiSummary(res.data?.summary || 'Summary generated successfully.');
    } catch (err) {
      console.error('Failed to generate summary:', err);
      setAiSummary('Failed to generate AI executive summary.');
    } finally {
      setSummarizing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!activeProject) return;
    setSubmitting(true);
    setMessage('');

    const projectName = activeProject.project_details?.name || activeProject.name;

    try {
      await axios.post(`${API_BASE}/api/faculty/review`, {
        project_name: projectName,
        status: status,
        comments: feedback
      });

      setMessage('Verdict recorded successfully!');
      setActiveProject({
        ...activeProject,
        approval_status: status,
        faculty_feedback: feedback
      });
      fetchBlueprints();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setMessage('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDetails = activeProject?.project_details || {};
  const currentName = currentDetails.name || activeProject?.name || 'Untitled';
  const currentDomain = currentDetails.domain || 'Engineering';

  const filteredBlueprints = blueprints.filter(p => {
    const name = (p.project_details?.name || p.name || '').toLowerCase();
    const email = (p.user_email || '').toLowerCase();
    const q = searchFilter.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            Faculty Evaluation Desk
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Review & Evaluate Blueprints
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Evaluate engineering rigor, review AI summaries, and issue academic decisions.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Redesigned Submissions List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Submissions ({filteredBlueprints.length})
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
            {filteredBlueprints.map((p, idx) => {
              const pName = p.project_details?.name || p.name || 'Untitled';
              const pStatus = p.approval_status || 'Pending Review';
              const isSelected = activeProject && (activeProject.name === p.name || activeProject.project_details?.name === pName);

              return (
                <div
                  key={idx}
                  onClick={() => handleSelectProject(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                      {pName}
                    </h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wider ${
                      pStatus.toLowerCase().includes('approved')
                        ? 'bg-emerald-100 text-emerald-800'
                        : pStatus.toLowerCase().includes('revision')
                        ? 'bg-amber-100 text-amber-800'
                        : pStatus.toLowerCase().includes('rejected')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {pStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-2">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{p.user_email || 'student@portal.edu'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Evaluation Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
          {activeProject ? (
            <>
              {/* Project Head & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {currentName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-bold text-slate-500">
                    <span className="text-blue-700 bg-blue-50 border border-blue-200/70 px-3 py-1 rounded-lg font-black">
                      {currentDomain}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-lg font-medium">
                      Submitter: {activeProject.user_email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFullBlueprintModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4" />
                    View Full Blueprint
                  </button>
                </div>
              </div>

              {/* Instant AI Executive Summary Card */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/50 to-white border border-indigo-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Bot className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-black tracking-tight">
                      AI Executive Summary for Faculty
                    </h3>
                  </div>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summarizing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {summarizing ? 'Analyzing...' : aiSummary ? 'Regenerate' : 'Summarize Blueprint'}
                  </button>
                </div>

                {aiSummary ? (
                  <div className="pt-2 border-t border-indigo-100">
                    <FormattedContent text={aiSummary} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">
                    Short on time? Click <strong>Summarize Blueprint</strong> to let the AI summarize feasibility, deliverables, and a verdict recommendation in 4 bullet points.
                  </p>
                )}
              </div>

              {/* Student Problem Statement */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Student Problem Formulation
                </span>
                <p className="text-[15px] font-medium text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {currentDetails.problem_statement || 'No description provided.'}
                </p>
              </div>

              {/* Snapshots with readable text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/90">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700 block mb-2">
                    Academic Merit & Feasibility
                  </span>
                  <div className="max-h-48 overflow-y-auto pr-1">
                    <FormattedContent text={activeProject.idea_evaluation} />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/90">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-2">
                    Scope & Features
                  </span>
                  <div className="max-h-48 overflow-y-auto pr-1">
                    <FormattedContent text={activeProject.scope_definition} />
                  </div>
                </div>
              </div>

              {/* Review Action Form */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                    Evaluation Verdict
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Approved', 'Needs Revision', 'Pending Review', 'Rejected'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setStatus(opt)}
                        className={`py-3 px-4 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          status === opt
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                    Faculty Remarks & Revision Notes
                  </label>
                  <textarea
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter actionable remarks or instructions for the student..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>

                {message && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Recording Verdict...' : 'Submit Official Review'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold text-sm">
              Select a project from the roster to begin evaluation.
            </div>
          )}
        </div>
      </div>

      {/* FULL BLUEPRINT MODAL WITH PARSED FORMATTING */}
      {showFullBlueprintModal && activeProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-8">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                  {currentDomain}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  {currentName}
                </h3>
              </div>
              <button
                onClick={() => setShowFullBlueprintModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
              {[
                { id: 'idea', label: '1. Feasibility', icon: ClipboardCheck },
                { id: 'scope', label: '2. Scope', icon: Layers },
                { id: 'tech', label: '3. Tech Stack', icon: Code2 },
                { id: 'plan', label: '4. Roadmap', icon: Calendar },
                { id: 'risk', label: '5. Risks', icon: ShieldAlert },
                { id: 'thesis', label: '6. Thesis Outline', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = modalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setModalTab(tab.id)}
                    className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Content with Formatted Elements */}
            <div className="p-8 overflow-y-auto max-h-[60vh] space-y-4 bg-white">
              {modalTab === 'idea' && <FormattedContent text={activeProject.idea_evaluation} />}
              {modalTab === 'scope' && <FormattedContent text={activeProject.scope_definition} />}
              {modalTab === 'tech' && <FormattedContent text={activeProject.technology_stack} />}
              {modalTab === 'plan' && <FormattedContent text={activeProject.time_planning || activeProject.timeline_milestones} />}
              {modalTab === 'risk' && <FormattedContent text={activeProject.risk_assessment} />}
              {modalTab === 'thesis' && <FormattedContent text={activeProject.thesis_format || activeProject.documentation_plan} />}

              {/* Leave Thesis Revision Comment Box */}
              <div className="pt-6 border-t border-slate-200 bg-slate-50/80 -mx-8 -mb-8 p-6 rounded-b-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Leave Thesis Revision Comment: <span className="text-amber-700">{SECTION_NAMES[modalTab] || 'Section'}</span>
                    </span>
                  </div>
                  {commentStatusMsg && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
                      {commentStatusMsg}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    rows={2}
                    value={sectionComment}
                    onChange={(e) => setSectionComment(e.target.value)}
                    placeholder={`Specify required revisions or feedback for ${SECTION_NAMES[modalTab] || 'this section'}...`}
                    className="flex-1 p-3.5 bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all resize-none shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveSectionComment}
                    disabled={savingComment || !sectionComment.trim()}
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {savingComment ? 'Saving...' : 'Submit Revision'}
                  </button>
                </div>

                {/* Display any previous revision comments for this section */}
                {activeProject?.thesis_comments && activeProject.thesis_comments.filter(c => c.section === (SECTION_NAMES[modalTab] || modalTab)).length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Previous Revision Comments for this Section:</span>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {activeProject.thesis_comments.filter(c => c.section === (SECTION_NAMES[modalTab] || modalTab)).map((cm, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-white border border-amber-200/80 rounded-xl text-xs text-slate-700 flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-800 leading-snug">"{cm.comment}"</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{cm.created_at || 'Recent'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowFullBlueprintModal(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black cursor-pointer hover:bg-slate-800 transition-all"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}