import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FolderGit2, 
  ChevronDown, 
  CheckCircle2, 
  HelpCircle, 
  GraduationCap, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Trash2,
  CornerDownLeft
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const SUGGESTED_QUESTIONS = [
  {
    icon: GraduationCap,
    title: "Viva Defense Prep",
    query: "What are the most challenging viva questions a professor or external examiner might ask about this project, and how should I answer them?"
  },
  {
    icon: ShieldCheck,
    title: "Security & Edge Cases",
    query: "What security vulnerabilities, rate limits, or edge cases should I safeguard against before deploying this app?"
  },
  {
    icon: Zap,
    title: "Architecture Review",
    query: "How can I optimize the data flow and latency between my frontend client, FastAPI backend, and MongoDB database?"
  },
  {
    icon: BookOpen,
    title: "Literature Review Tips",
    query: "What key academic papers, benchmarks, or industry standards should I cite in my project report for this domain?"
  }
];

export default function ChatMentorPage({ user, activeBlueprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    activeBlueprint?.project_details?.name || activeBlueprint?.name || ''
  );
  const [activeProjectData, setActiveProjectData] = useState(activeBlueprint || null);

  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user projects list
  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE}/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          setProjects(res.data || []);
          if (!selectedProject && res.data && res.data.length > 0) {
            const first = res.data[0];
            setSelectedProject(first.project_details?.name || first.name || '');
            setActiveProjectData(first);
          }
        })
        .catch(() => setProjects([]));
    }
  }, [user]);

  // Sync selected project data and load persistent chat history
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const match = projects.find(
        p => (p.project_details?.name || p.name) === selectedProject
      );
      if (match) setActiveProjectData(match);
    }

    if (selectedProject) {
      const savedChatKey = `mentor_chat_${user?.email || 'guest'}_${selectedProject}`;
      const saved = localStorage.getItem(savedChatKey);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch {
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    }
  }, [selectedProject, projects, user?.email]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveChatHistory = (updated) => {
    setMessages(updated);
    if (selectedProject) {
      const savedChatKey = `mentor_chat_${user?.email || 'guest'}_${selectedProject}`;
      localStorage.setItem(savedChatKey, JSON.stringify(updated));
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Clear this conversation history?")) {
      saveChatHistory([]);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedWithUser = [...messages, userMessage];
    saveChatHistory(updatedWithUser);
    setInputQuery('');
    setLoading(true);

    // Build context string from active project
    const context = activeProjectData ? `
Project: ${activeProjectData.project_details?.name || activeProjectData.name}
Domain: ${activeProjectData.project_details?.domain || 'Computer Engineering'}
Problem: ${activeProjectData.project_details?.problem_statement || ''}
Key Tech: ${activeProjectData.technology_stack || ''}
Scope: ${activeProjectData.scope_definition || ''}
    `.trim() : 'Academic Software Engineering Project';

    try {
      const res = await axios.post(`${API_BASE}/api/mentor/chat`, {
        project_name: selectedProject || 'Engineering Project',
        context: context,
        query: query
      });

      const assistantMessage = {
        role: 'assistant',
        content: res.data.reply || "I've reviewed your query. Please refer to your active architecture specifications.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      saveChatHistory([...updatedWithUser, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I had trouble connecting to the advisory server. Please check your backend connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveChatHistory([...updatedWithUser, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            AI Academic Advisor
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            AI Mentor Chat
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Context-aware technical mentoring and viva preparation for your active project.
          </p>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-2.5 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Custom Project Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl shadow-xs transition-all cursor-pointer min-w-[220px]"
            >
              <div className="flex items-center gap-2.5 truncate">
                <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-black text-slate-800 truncate">
                  {selectedProject || 'Select Project...'}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 flex justify-between">
                  <span>Switch Project Context</span>
                  <span>{projects.length} Total</span>
                </div>
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                  {projects.map((p, idx) => {
                    const pName = p.project_details?.name || p.name || `Project ${idx + 1}`;
                    const isSelected = pName === selectedProject;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedProject(pName);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-2">{pName}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Bot className="w-9 h-9 stroke-[2.2]" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ready to guide your project: {selectedProject || 'Your Project'}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-md">
              I have loaded your architecture, technology stack, and timeline. Ask me anything about coding bottlenecks, examiner questions, or thesis formatting.
            </p>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8 text-left">
              {SUGGESTED_QUESTIONS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-2xl transition-all group cursor-pointer text-left flex items-start gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.query}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 stroke-[2.2]" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-md shadow-blue-500/20'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed font-normal" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-extrabold text-slate-950 inline" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-outside space-y-1.5 my-2.5 ml-4" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside space-y-1.5 my-2.5 ml-4" {...props} />,
                            li: ({ node, ...props }) => <li className="text-slate-700 font-medium" {...props} />,
                            code: ({ node, inline, className, children, ...props }) => {
                              return !inline ? (
                                <pre className="my-2.5 rounded-xl overflow-x-auto border border-slate-800 bg-slate-900 text-slate-100 p-3.5 font-mono text-xs leading-relaxed">
                                  <code>{children}</code>
                                </pre>
                              ) : (
                                <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[11px] font-semibold text-slate-400 block px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing / Loading Bubble */}
        {loading && (
          <div className="flex gap-3.5 max-w-md mr-auto animate-in fade-in duration-200">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-slate-600 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Advisor is reviewing your project context...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="pt-4 border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-white border-2 border-slate-300 focus-within:border-blue-600 rounded-2xl shadow-xs transition-all p-1.5"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder={`Ask a technical or viva question about ${selectedProject || 'your project'}...`}
            className="flex-1 px-4 py-3 bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
          />

          <div className="flex items-center gap-2 pr-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
              <CornerDownLeft className="w-3 h-3" /> Enter
            </span>

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-blue-500/20 active:scale-[0.96] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}