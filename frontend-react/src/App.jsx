import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, ArrowRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FacultyDashboardPage from './pages/FacultyDashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import ProjectHistoryPage from './pages/ProjectHistoryPage';
import ChatMentorPage from './pages/ChatMentorPage';
import KanbanPage from './pages/KanbanPage';
import ThesisDocPage from './pages/ThesisDocPage';
import BenchmarksPage from './pages/BenchmarksPage';
import FacultyReviewPage from './pages/FacultyReviewPage';
import StudentProgressUpdatePage from './pages/StudentProgressUpdatePage';
import BatchProgressTrackerPage from './pages/BatchProgressTrackerPage';
import VivaGradingPage from './pages/VivaGradingPage';
import NoticeboardPage from './pages/NoticeboardPage';
import SettingsPage from './pages/SettingsPage';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState('Student');

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [facultySelectedProject, setFacultySelectedProject] = useState(null);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);

  const checkAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/announcements`);
      const list = res.data || [];
      if (list.length > 0) {
        const newest = list[0];
        const newestTs = newest.timestamp || 0;
        const lastSeen = parseInt(localStorage.getItem('last_seen_notice') || '0', 10);
        if (newestTs > lastSeen) {
          setHasUnreadNotice(true);
          setLatestNotice(newest);
        } else {
          setHasUnreadNotice(false);
        }
      } else {
        setHasUnreadNotice(false);
      }
    } catch (e) {
      // ignore network errors
    }
  };

  useEffect(() => {
    if (user && user.role !== 'Faculty') {
      checkAnnouncements();
      const interval = setInterval(checkAnnouncements, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenNoticeboard = () => {
    if (latestNotice?.timestamp) {
      localStorage.setItem('last_seen_notice', String(latestNotice.timestamp));
    } else {
      localStorage.setItem('last_seen_notice', String(Date.now()));
    }
    setHasUnreadNotice(false);
    setCurrentTab('noticeboard');
  };

  const handleSidebarClick = (tabId) => {
    if (tabId === 'workspace') {
      setActiveBlueprint(null);
    }
    if (tabId === 'noticeboard') {
      if (latestNotice?.timestamp) {
        localStorage.setItem('last_seen_notice', String(latestNotice.timestamp));
      } else {
        localStorage.setItem('last_seen_notice', String(Date.now()));
      }
      setHasUnreadNotice(false);
    }
    setCurrentTab(tabId);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    setAuthInitialRole('Student');
    setActiveBlueprint(null);
    setFacultySelectedProject(null);
    setCurrentTab('dashboard');
    setHasUnreadNotice(false);
  };

  // Public Unauthenticated Flow
  if (!user) {
    if (showAuth) {
      return (
        <AuthPage
          initialRole={authInitialRole}
          onBackToLanding={() => setShowAuth(false)}
          onAuthSuccess={(userData) => {
            setUser(userData);
            setShowAuth(false);
            setCurrentTab(userData.role === 'Faculty' ? 'faculty-dashboard' : 'dashboard');
          }}
        />
      );
    }

    return (
      <LandingPage
        onEnterStudent={() => {
          setAuthInitialRole('Student');
          setShowAuth(true);
        }}
        onEnterFaculty={() => {
          setAuthInitialRole('Faculty');
          setShowAuth(true);
        }}
      />
    );
  }

  // Authenticated Portal View
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleSidebarClick}
        userRole={user?.role || 'Student'}
        user={user}
        hasUnreadNotice={hasUnreadNotice}
        unreadNoticeCount={hasUnreadNotice ? 1 : 0}
      />

      {/* Main Content Area: ENABLE natural vertical scroll here */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-slate-50">
        {/* Persistent Notification Pill for Students */}
        {hasUnreadNotice && user?.role !== 'Faculty' && currentTab !== 'noticeboard' && (
          <div className="bg-slate-900 border-b border-blue-600 text-white px-6 py-3 shadow-md flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-200">
            <button
              onClick={handleOpenNoticeboard}
              className="flex items-center gap-3 text-left hover:underline cursor-pointer group flex-1"
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-black uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5" />
                  Notice Alert
                </span>
                <span className="text-sm font-black tracking-tight">
                  New Faculty Announcement Posted{latestNotice?.title ? `: "${latestNotice.title}"` : ''}
                </span>
              </div>
            </button>
            <button
              onClick={handleOpenNoticeboard}
              className="ml-4 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-500 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Open Noticeboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="min-h-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              user={user}
              onLogout={handleLogout}
              hasUnreadNotice={hasUnreadNotice}
              onOpenNoticeboard={handleOpenNoticeboard}
              onNavigateToWorkspace={() => {
                setActiveBlueprint(null);
                setCurrentTab('workspace');
              }}
              onSelectProject={(proj) => {
                setActiveBlueprint(proj);
                setCurrentTab('workspace');
              }}
            />
          )}

          {currentTab === 'faculty-dashboard' && (
            <FacultyDashboardPage
              user={user}
              onLogout={handleLogout}
              onNavigateToReview={() => setCurrentTab('review')}
              onSelectProjectForReview={(proj) => {
                setFacultySelectedProject(proj);
                setCurrentTab('review');
              }}
            />
          )}

          {currentTab === 'workspace' && (
            <WorkspacePage 
              user={user} 
              selectedBlueprint={activeBlueprint}
            />
          )}

          {currentTab === 'student-progress' && (
            <StudentProgressUpdatePage 
              user={user}
              activeBlueprint={activeBlueprint}
            />
          )}

          {currentTab === 'history' && (
            <ProjectHistoryPage
              user={user}
              onSelectProject={(proj) => {
                setActiveBlueprint(proj);
                setCurrentTab('workspace');
              }}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanPage 
              user={user} 
              activeBlueprint={activeBlueprint} 
            />
          )}

          {currentTab === 'mentor' && (
            <ChatMentorPage 
              user={user} 
              activeBlueprint={activeBlueprint} 
            />
          )}

          {currentTab === 'thesis' && (
            <ThesisDocPage 
              user={user} 
              activeBlueprint={activeBlueprint} 
            />
          )}

          {currentTab === 'noticeboard' && (
            <NoticeboardPage 
              user={user} 
              onMarkNoticesRead={() => setHasUnreadNotice(false)}
            />
          )}

          {currentTab === 'showcase' && (
            <BenchmarksPage 
              user={user} 
            />
          )}

          {currentTab === 'review' && (
            <FacultyReviewPage 
              user={user} 
              selectedProject={facultySelectedProject}
              onClearSelectedProject={() => setFacultySelectedProject(null)}
            />
          )}

          {currentTab === 'faculty-progress' && (
            <BatchProgressTrackerPage 
              user={user} 
            />
          )}

          {currentTab === 'viva-grading' && (
            <VivaGradingPage 
              user={user} 
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage 
              user={user} 
            />
          )}
        </div>
      </main>
    </div>
  );
}