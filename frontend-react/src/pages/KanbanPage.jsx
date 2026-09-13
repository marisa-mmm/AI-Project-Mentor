import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  ListTodo, 
  ChevronDown, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle, 
  Sparkles,
  GripVertical
} from 'lucide-react';

const DEFAULT_TASKS = {
  TODO: [
    { id: '1', title: 'System Architecture Specification', deadline: 'Month 1', priority: 'High' },
    { id: '2', title: 'Dataset Cleaning & Normalization', deadline: 'Month 1', priority: 'Medium' }
  ],
  IN_PROGRESS: [
    { id: '3', title: 'FastAPI Backend Endpoints & JWT Auth', deadline: 'Month 2', priority: 'High' }
  ],
  REVIEW: [
    { id: '4', title: 'Literature Review Document Draft', deadline: 'Month 2', priority: 'Medium' }
  ],
  DONE: [
    { id: '5', title: 'Project Proposal Defense Slides', deadline: 'Completed', priority: 'Completed' }
  ]
};

export default function KanbanPage({ user, activeBlueprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(
    activeBlueprint?.project_details?.name || activeBlueprint?.name || ''
  );
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Fetch user projects list
  useEffect(() => {
    if (user?.email) {
      axios.get(`http://localhost:8000/api/user/history?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          setProjects(res.data || []);
          if (!selectedProject && res.data && res.data.length > 0) {
            const initialName = res.data[0].project_details?.name || res.data[0].name || '';
            setSelectedProject(initialName);
          }
        })
        .catch(() => setProjects([]));
    }
  }, [user]);

  // 2. Load persistent board data from localStorage per project
  useEffect(() => {
    if (!selectedProject) return;
    const storageKey = `kanban_tasks_${user?.email || 'guest'}_${selectedProject}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing saved tasks:", err);
        setTasks(DEFAULT_TASKS);
      }
    } else {
      setTasks(DEFAULT_TASKS);
    }
  }, [selectedProject, user?.email]);

  const saveTasksState = (newTasks) => {
    setTasks(newTasks);
    if (selectedProject) {
      const storageKey = `kanban_tasks_${user?.email || 'guest'}_${selectedProject}`;
      localStorage.setItem(storageKey, JSON.stringify(newTasks));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const column = Array.from(tasks[source.droppableId]);
      const [moved] = column.splice(source.index, 1);
      column.splice(destination.index, 0, moved);
      saveTasksState({ ...tasks, [source.droppableId]: column });
    } else {
      const sourceCol = Array.from(tasks[source.droppableId]);
      const destCol = Array.from(tasks[destination.droppableId]);
      const [moved] = sourceCol.splice(source.index, 1);
      destCol.splice(destination.index, 0, moved);

      saveTasksState({
        ...tasks,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol
      });
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      deadline: 'Sprint Task',
      priority: 'Standard'
    };
    const updated = { ...tasks, TODO: [newTask, ...tasks.TODO] };
    saveTasksState(updated);
    setNewTaskTitle('');
  };

  const columns = [
    { 
      id: 'TODO', 
      title: 'Backlog / To Do', 
      accentColor: 'bg-slate-500', 
      lightBg: 'bg-slate-100', 
      borderTop: 'border-slate-400',
      icon: ListTodo 
    },
    { 
      id: 'IN_PROGRESS', 
      title: 'In Progress', 
      accentColor: 'bg-blue-600', 
      lightBg: 'bg-blue-50', 
      borderTop: 'border-blue-600',
      icon: Clock 
    },
    { 
      id: 'REVIEW', 
      title: 'Faculty Review', 
      accentColor: 'bg-amber-500', 
      lightBg: 'bg-amber-50', 
      borderTop: 'border-amber-500',
      icon: AlertCircle 
    },
    { 
      id: 'DONE', 
      title: 'Completed & Verified', 
      accentColor: 'bg-emerald-600', 
      lightBg: 'bg-emerald-50', 
      borderTop: 'border-emerald-600',
      icon: CheckCircle2 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 sm:p-12 space-y-8">
      {/* Top Header with Custom Project Selector Menu */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            Sprint Workflow
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Roadmap & Tasks
          </h1>
          <p className="text-base font-medium text-slate-500 mt-1">
            Track milestones, development stages, and faculty review checkpoints.
          </p>
        </div>

        {/* Custom Clean Dropdown (Replaces Browser OS Select) */}
        <div className="relative" ref={dropdownRef}>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Active Workspace Project
          </div>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-4 px-5 py-3 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-xs transition-all cursor-pointer min-w-[260px]"
          >
            <div className="flex items-center gap-3 truncate">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-4 h-4 stroke-[2.4]" />
              </div>
              <span className="text-sm font-black text-slate-900 truncate">
                {selectedProject || 'Select a project...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 stroke-[2.5] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
          </button>

          {/* Dropdown Menu Modal */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Select Project</span>
                <span>{projects.length} Available</span>
              </div>
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
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
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{pName}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white stroke-[2.5]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Input */}
      <form onSubmit={handleAddTask} className="flex gap-3 max-w-xl">
        <div className="relative flex-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new milestone or technical task..."
            className="w-full pl-5 pr-4 py-3.5 bg-white border border-slate-300 focus:border-blue-600 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-md shadow-blue-500/25 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Card
        </button>
      </form>

      {/* Board Columns */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((col) => {
            const ColumnIcon = col.icon;
            const taskList = tasks[col.id] || [];

            return (
              <div
                key={col.id}
                className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 flex flex-col min-h-[580px] shadow-xs"
              >
                {/* Modern Column Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${col.lightBg} flex items-center justify-center`}>
                      <ColumnIcon className={`w-4 h-4 ${col.accentColor.replace('bg-', 'text-')} stroke-[2.5]`} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      {col.title}
                    </h3>
                  </div>

                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center">
                    {taskList.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 rounded-2xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-50/80' : ''
                      }`}
                    >
                      {taskList.length === 0 ? (
                        <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                          <p className="text-xs font-bold text-slate-400">No tasks in this stage</p>
                          <span className="text-[11px] text-slate-400 mt-0.5">Drag tasks here</span>
                        </div>
                      ) : (
                        taskList.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 rounded-2xl bg-white border transition-all cursor-grab active:cursor-grabbing ${
                                  snapshot.isDragging
                                    ? 'border-blue-500 shadow-xl ring-4 ring-blue-500/10 rotate-1'
                                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-bold text-slate-900 leading-snug">
                                    {task.title}
                                  </p>
                                  <GripVertical className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    {task.deadline}
                                  </span>

                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                    Sprint Item
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}