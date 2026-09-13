import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  PlusCircle, 
  Tag, 
  Calendar, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Megaphone,
  User,
  Filter
} from 'lucide-react';

import CustomSelect from '../components/CustomSelect';

const API_BASE = 'http://127.0.0.1:8000';

const TAGS = ['Deadline', 'Viva Notice', 'Report Guidelines', 'General'];

export default function NoticeboardPage({ user, onMarkNoticesRead }) {
  const isFaculty = user?.role === 'Faculty';
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // New notice form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Deadline');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/announcements`);
      const list = res.data || [];
      setAnnouncements(list);
      if (list.length > 0) {
        const maxTs = Math.max(...list.map(a => a.timestamp || 0), 0);
        if (maxTs > 0) {
          localStorage.setItem('last_seen_notice', String(maxTs));
        } else {
          localStorage.setItem('last_seen_notice', String(Date.now()));
        }
      }
      if (onMarkNoticesRead) {
        onMarkNoticesRead();
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Please provide both title and announcement details.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      const payload = {
        title: title.trim(),
        content: content.trim(),
        tag: tag,
        faculty_name: user?.username || user?.email || 'Faculty Committee'
      };

      await axios.post(`${API_BASE}/api/faculty/announcements`, payload);
      setSuccessMsg('Announcement successfully published to the cohort noticeboard!');
      setTitle('');
      setContent('');
      setTag('Deadline');

      // Refresh list
      fetchAnnouncements();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to post announcement:', err);
      setErrorMsg(err.response?.data?.detail || 'Failed to post announcement. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTagBadge = (t) => {
    const val = (t || 'General').toLowerCase();
    if (val.includes('deadline')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (val.includes('viva') || val.includes('schedule')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (val.includes('report') || val.includes('guideline')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredNotices = announcements.filter((notice) => {
    if (activeFilter === 'All') return true;
    return (notice.tag || '').toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <div className="p-8 sm:p-12 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Official Broadcasts
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Noticeboard & Deadlines
          </h1>
          <p className="text-base font-medium text-slate-500 mt-2">
            {isFaculty 
              ? 'Publish academic deadlines, thesis formatting guidelines, and viva defense timetables.' 
              : 'Official university project notices, defense schedules, and milestone deadlines.'}
          </p>
        </div>
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

      {/* Faculty Posting Form */}
      {isFaculty && (
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Megaphone className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-black text-slate-900">
              Post New Announcement
            </h2>
          </div>

          <form onSubmit={handlePostNotice} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Final Thesis Hardcopy Submission Deadline..."
                  className="w-full p-4 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  Category Tag
                </label>
                <CustomSelect
                  value={tag}
                  onChange={setTag}
                  options={TAGS.map(t => ({
                    value: t,
                    label: t,
                    badge: t
                  }))}
                  placeholder="Select Tag"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Announcement Content
              </label>
              <textarea
                rows={3}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detailed instructions, formatting criteria, room allocations, or viva instructions..."
                className="w-full p-4 bg-slate-50 border border-slate-300 focus:border-blue-600 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 stroke-[2.5]" />
                    <span>Publish Announcement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {['All', ...TAGS].map((t) => {
          const isSelected = activeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-500 mt-3">Loading notices...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
            <Bell className="w-14 h-14 text-slate-300 mx-auto" />
            <h3 className="text-xl font-black text-slate-800">No announcements in this category</h3>
            <p className="text-sm font-medium text-slate-500">
              Check back soon for new updates from the faculty evaluation board.
            </p>
          </div>
        ) : (
          filteredNotices.map((notice, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${getTagBadge(notice.tag)}`}>
                    {notice.tag || 'General'}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">
                    {notice.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{notice.created_at || 'Recent'}</span>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                {notice.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted by: <strong className="text-slate-700">{notice.faculty_name || 'Academic Committee'}</strong></span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
