import React from 'react';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Activity, 
  History, 
  Kanban, 
  Bot, 
  FileText, 
  Bell, 
  Compass, 
  Settings, 
  GraduationCap,
  ClipboardCheck,
  Award
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  userRole = 'Student', 
  unreadNoticeCount = 0,
  user,
  hasUnreadNotice = false
}) {
  const role = user?.role || userRole || 'Student';
  const isFaculty = role.toLowerCase().includes('faculty');
  const noticeCount = unreadNoticeCount || (hasUnreadNotice ? 1 : 0);

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Create New Project', icon: FolderPlus },
    { id: 'student-progress', label: 'My Progress Update', icon: Activity },
    { id: 'history', label: 'Project History', icon: History },
    { id: 'kanban', label: 'Roadmap & Tasks', icon: Kanban },
    { id: 'mentor', label: 'AI Mentor Chat', icon: Bot },
    { id: 'thesis', label: 'Thesis & Export', icon: FileText },
    { id: 'noticeboard', label: 'Noticeboard', icon: Bell, badge: noticeCount },
    { id: 'showcase', label: 'Explore Projects', icon: Compass }
  ];

  const facultyNav = [
    { id: 'faculty-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'review', label: 'Evaluation Portal', icon: ClipboardCheck },
    { id: 'faculty-progress', label: 'Student Progress Tracker', icon: Activity },
    { id: 'viva-grading', label: 'Viva & Defense Rubric', icon: Award },
    { id: 'noticeboard', label: 'Noticeboard', icon: Bell },
    { id: 'showcase', label: 'Explore Projects', icon: Compass }
  ];

  const navItems = isFaculty ? facultyNav : studentNav;

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none overflow-hidden">
      {/* 1. Header Branding (Fixed) */}
      <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <GraduationCap className="w-6 h-6 stroke-[2.5]"/>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100/80">
            {isFaculty ? 'Faculty Portal' : 'Student Platform'}
          </span>
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight mt-0.5">
            Project Portal
          </h2>
        </div>
      </div>

      {/* 2. Middle Navigation Menu (Independently Scrollable if height is small) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">
          Navigation Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-2xs font-black'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom Pinned System Actions (Always Visible) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-1">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'bg-blue-600 text-white font-black shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className={`w-4 h-4 shrink-0 ${currentTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
          <span>Settings & Profile</span>
        </button>
      </div>
    </aside>
  );
}