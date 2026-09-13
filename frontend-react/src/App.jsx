import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import ProjectHistoryPage from './pages/ProjectHistoryPage';
import ChatMentorPage from './pages/ChatMentorPage';
import KanbanPage from './pages/KanbanPage';
import ThesisDocPage from './pages/ThesisDocPage';
import BenchmarksPage from './pages/BenchmarksPage';
import FacultyReviewPage from './pages/FacultyReviewPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeBlueprint, setActiveBlueprint] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setActiveBlueprint(null);
    setCurrentTab('dashboard');
  };

  if (!user) {
    return (
      <AuthPage
        onAuthSuccess={(userData) => {
          setUser(userData);
          setCurrentTab(userData.role === 'Faculty' ? 'review' : 'dashboard');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 overflow-y-auto min-h-screen">
        {currentTab === 'dashboard' && (
          <DashboardPage
            user={user}
            onLogout={handleLogout}
            onNavigateToWorkspace={() => setCurrentTab('workspace')}
            onSelectProject={(proj) => {
              setActiveBlueprint(proj);
              setCurrentTab('workspace');
            }}
          />
        )}
        {currentTab === 'workspace' && (
          <WorkspacePage 
            user={user} 
            selectedBlueprint={activeBlueprint}
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
        {currentTab === 'showcase' && (
          <BenchmarksPage 
            user={user} 
          />
        )}
        {currentTab === 'review' && (
          <FacultyReviewPage 
            user={user} 
          />
        )}
      </main>
    </div>
  );
}