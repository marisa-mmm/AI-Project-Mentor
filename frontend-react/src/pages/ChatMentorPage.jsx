import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Send, 
  User, 
  Trash2, 
  ChevronDown, 
  Check, 
  CornerDownLeft 
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function ChatMentorPage({ user, activeBlueprint, projects: propProjects = [] }) {
  const [projects, setProjects] = useState(propProjects);
  const [currentProject, setCurrentProject] = useState(activeBlueprint || (propProjects[0] || null));
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your lead academic project mentor. Ask me any viva defense questions, architecture advice, or implementation steps for your capstone project."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user projects list if not provided or to ensure fresh history
  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          const list = res.data || [];
          setProjects(list);
          if (!currentProject && list.length > 0) {
            const activeMatch = activeBlueprint 
              ? list.find(p => (p.project_details?.name || p.name) === (activeBlueprint.project_details?.name || activeBlueprint.name))
              : null;
            setCurrentProject(activeMatch || list[0]);
          }
        })
        .catch(() => {});
    }
  }, [user, activeBlueprint]);

  useEffect(() => {
    if (activeBlueprint) {
      setCurrentProject(activeBlueprint);
    } else if (projects.length > 0 && !currentProject) {
      setCurrentProject(projects[0]);
    }
  }, [activeBlueprint, projects]);

  // Load chat history from localStorage
  useEffect(() => {
    if (currentProject) {
      const projName = currentProject?.project_details?.name || currentProject?.name;
      if (projName) {
        const savedChatKey = `mentor_chat_${user?.email || 'guest'}_${projName}`;
        const saved = localStorage.getItem(savedChatKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              return;
            }
          } catch (e) {}
        }
      }
    }
  }, [currentProject, user]);

  const saveChatHistory = (newMessages) => {
    setMessages(newMessages);
    const projName = currentProject?.project_details?.name || currentProject?.name;
    if (projName) {
      const savedChatKey = `mentor_chat_${user?.email || 'guest'}_${projName}`;
      localStorage.setItem(savedChatKey, JSON.stringify(newMessages));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMsg = inputQuery.trim();
    setInputQuery('');
    const updatedWithUser = [...messages, { sender: 'user', text: userMsg }];
    saveChatHistory(updatedWithUser);
    setLoading(true);

    const projName = currentProject?.project_details?.name || currentProject?.name || 'My Capstone Project';
    const projContext = `
      Domain: ${currentProject?.project_details?.domain || 'Engineering'}
      Problem Statement: ${currentProject?.project_details?.problem_statement || ''}
      Scope: ${currentProject?.scope_definition || ''}
      Tech Stack: ${currentProject?.technology_stack || ''}
    `;

    try {
      const res = await axios.post(`${API_BASE}/api/mentor/chat`, {
        project_name: projName,
        context: projContext,
        query: userMsg
      });

      const reply = res.data?.reply || 'Could not generate advice at this moment.';
      saveChatHistory([...updatedWithUser, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error(err);
      saveChatHistory([
        ...updatedWithUser, 
        { sender: 'bot', text: 'Error connecting to the AI Mentor server. Please check your backend connection.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const cleared = [
      {
        sender: 'bot',
        text: "Conversation cleared. Feel free to ask another question about your system design or viva preparation."
      }
    ];
    saveChatHistory(cleared);
  };

  const currentName = currentProject?.project_details?.name || currentProject?.name || 'Select Project';
  const currentDomain = currentProject?.project_details?.domain || 'General';

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-full">
      <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden max-w-5xl mx-auto w-full bg-white border border-slate-200/90 rounded-3xl shadow-xs">
        {/* 1. FIXED TOP HEADER (shrink-0: Never scrolls away) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black">
              <Bot className="w-5 h-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  AI Mentor Chat
                </h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                Context-aware technical mentoring and viva preparation.
              </p>
            </div>
          </div>

          {/* Project Selector Dropdown + Clear Chat */}
          <div className="flex items-center gap-2">
            {/* Active Project Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 text-xs font-bold text-slate-800 transition-all cursor-pointer max-w-xs"
              >
                <span className="truncate max-w-[140px] font-black text-slate-900">{currentName}</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800 text-[10px] uppercase font-black shrink-0">
                  {currentDomain}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 max-h-64 overflow-y-auto">
                  {projects.map((proj, idx) => {
                    const pName = proj.project_details?.name || proj.name;
                    const isSel = (currentProject?.name === proj.name || currentProject?.project_details?.name === pName);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentProject(proj);
                          setDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                          isSel ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate flex-1">{pName}</span>
                        {isSel && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 stroke-[3]"/>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={handleClearChat}
              title="Clear Chat History"
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* 2. MIDDLE CHAT SCROLL AREA (flex-1 overflow-y-auto: Only this part scrolls) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user' || msg.role === 'user';
            const textContent = msg.text || msg.content || '';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-blue-600 text-white shadow-blue-500/20'
                }`}>
                  {isUser ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
                </div>

                <div className={`max-w-2xl p-5 rounded-3xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs font-semibold'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                }`}>
                  {isUser ? (
                    <p>{textContent}</p>
                  ) : (
                    <div className="space-y-3">
                      {textContent.split('\n').map((line, lIdx) => {
                        const clean = line.trim();
                        if (!clean) return <div key={lIdx} className="h-1"/>;
                        
                        const formatted = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <p 
                            key={lIdx} 
                            className="text-slate-700 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatted }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin"/>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Synthesizing response for {currentName}...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. FIXED BOTTOM QUESTION INPUT BAR (shrink-0: Permanently pinned at the bottom) */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask a technical or viva question about ${currentName}...`}
              className="w-full pl-5 pr-28 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-2 flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-md">
                <CornerDownLeft className="w-3 h-3"/> Enter
              </span>
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4"/>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}