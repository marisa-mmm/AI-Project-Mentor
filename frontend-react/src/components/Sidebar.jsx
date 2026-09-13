import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Compass, 
  History,
  MessageSquare, 
  Kanban, 
  FileText, 
  Users 
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Create New Project', icon: Compass },
    { id: 'history', label: 'Project History', icon: History },
    { id: 'kanban', label: 'Roadmap & Tasks', icon: Kanban },
    { id: 'mentor', label: 'AI Mentor Chat', icon: MessageSquare },
    { id: 'thesis', label: 'Thesis & Export', icon: FileText },
    { id: 'showcase', label: 'Project Showcase', icon: Users },
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen">
      {/* Brand Icon Header - Enlarged and High-Contrast */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 shrink-0">
          <GraduationCap className="w-8 h-8 stroke-[2.3]" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs font-black text-blue-600 uppercase tracking-widest leading-tight block">
            Student Platform
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight leading-tight block mt-0.5">
            Project Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Icon className={`w-6 h-6 shrink-0 ${active ? 'text-blue-600 stroke-[2.5]' : 'text-slate-400 stroke-[2]'}`} />
              <span className="tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}