import React, { useState, useRef } from "react";
import { Task, Project, TeamMember } from "../types";
import {
  Plus,
  List,
  Kanban,
  ArrowRight,
  ArrowLeft,
  Calendar,
  X,
  GripVertical
} from "lucide-react";

interface TaskProps {
  tasks: Task[];
  projects: Project[];
  team: TeamMember[];
  onAddTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: Task["status"]) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskBoardView: React.FC<TaskProps> = ({
  tasks,
  projects,
  team,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask
}) => {
  const [viewMode, setViewMode] = useState<"List" | "Kanban">("Kanban");
  const [filterProject, setFilterProject] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  
  // Drag and drop state
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Task["status"] | null>(null);
  const dragTask = useRef<Task | null>(null);

  // Create / add task state
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskProjId, setTaskProjId] = useState(projects[0]?.id || "");
  const [taskAssigneeId, setTaskAssigneeId] = useState(team[0]?.id || "");
  const [taskDueDate, setTaskDueDate] = useState("2026-06-01");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Filter tasks list
  const filteredTasks = tasks.filter((t) => {
    const matchProj = filterProject === "All" || t.projectId === filterProject;
    const matchAssignee = filterAssignee === "All" || t.assigneeId === filterAssignee;
    const matchPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchProj && matchAssignee && matchPriority;
  });

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const created: Task = {
      id: "task_" + Date.now(),
      projectId: taskProjId,
      title: taskTitle,
      assigneeId: taskAssigneeId,
      dueDate: taskDueDate,
      priority: taskPriority,
      status: "To Do"
    };

    onAddTask(created);
    setShowAddModal(false);
    setTaskTitle("");
  };

  const statusCategories: Task["status"][] = ["To Do", "In Progress", "Review", "Done"];

  // Helper to progress task forward/back directly in Kanban
  const moveTask = (task: Task, direction: "forward" | "back") => {
    const currentIndex = statusCategories.indexOf(task.status);
    let nextIndex = currentIndex;
    if (direction === "forward" && currentIndex < 3) {
      nextIndex += 1;
    } else if (direction === "back" && currentIndex > 0) {
      nextIndex -= 1;
    }
    if (nextIndex !== currentIndex) {
      onUpdateTaskStatus(task.id, statusCategories[nextIndex]);
    }
  };

  return (
    <div id="tasks-board-root" className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Daily Dispatch & Tasks</h1>
          <p className="text-xs text-slate-400">Manage crew deliverable logs, inspections, and material deliveries.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* List vs Kanban toggles */}
          <div className="flex border border-slate-800 p-0.5 rounded-lg bg-slate-950">
            <button
              onClick={() => setViewMode("List")}
              className={`p-1.5 rounded-md transition ${
                viewMode === "List" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-450 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("Kanban")}
              className={`p-1.5 rounded-md transition ${
                viewMode === "Kanban" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-450 hover:text-white"
              }`}
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs font-mono">
        <div>
          <label className="block text-slate-450 mb-1.5 uppercase tracking-wider text-[10px]">Filter by Site</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-cyan-500"
          >
            <option value="All">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-450 mb-1.5 uppercase tracking-wider text-[10px]">Assignee Trade</label>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-cyan-500"
          >
            <option value="All">All Staff ({team.length})</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-450 mb-1.5 uppercase tracking-wider text-[10px]">Critical Level</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-cyan-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>
      </div>

      {/* Render Mode: Kanban Board (Recommended) */}
      {viewMode === "Kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {statusCategories.map((colName) => {
            const columnTasks = filteredTasks.filter((t) => t.status === colName);
            const isDropTarget = dragOverCol === colName && dragTask.current?.status !== colName;
            return (
              <div
                key={colName}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(colName); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => {
                  if (dragTask.current && dragTask.current.status !== colName) {
                    onUpdateTaskStatus(dragTask.current.id, colName);
                  }
                  setDragOverCol(null);
                  setDragTaskId(null);
                  dragTask.current = null;
                }}
                className={`p-4 border rounded-xl space-y-4 min-h-[500px] flex flex-col transition-colors duration-150 ${
                  isDropTarget
                    ? "bg-cyan-500/5 border-cyan-500/40"
                    : "bg-slate-950/60 border-slate-900"
                }`}
              >
                {/* Column header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-semibold text-xs text-white font-mono uppercase tracking-wider">{colName}</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 w-5 h-5 flex items-center justify-center rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.map((t) => {
                    const linkedProj = projects.find((p) => p.id === t.projectId);
                    const linkedCrew = team.find((m) => m.id === t.assigneeId);
                    const isDragging = dragTaskId === t.id;

                    return (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={() => {
                          setDragTaskId(t.id);
                          dragTask.current = t;
                        }}
                        onDragEnd={() => {
                          setDragTaskId(null);
                          setDragOverCol(null);
                          dragTask.current = null;
                        }}
                        className={`bg-slate-900 border p-3.5 rounded-lg space-y-3 group transition-all select-none ${
                          isDragging
                            ? "opacity-40 scale-95 border-cyan-500/30"
                            : "border-slate-800 hover:border-slate-700 cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        {/* Drag handle + tags row */}
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 text-slate-600 shrink-0" />
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              t.priority === "High"
                                ? "bg-rose-500/15 text-rose-450 font-bold"
                                : t.priority === "Medium"
                                ? "bg-amber-400/10 text-amber-400"
                                : "bg-emerald-400/10 text-emerald-400"
                            }`}>
                              {t.priority} Urgent
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono truncate max-w-[90px]">
                            {linkedProj ? linkedProj.name : "Core HQ"}
                          </span>
                        </div>

                        {/* Description */}
                        <h4 className="text-xs font-semibold text-white leading-snug">{t.title}</h4>

                        {/* Footer crew avatar & due indicators */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-850/60">
                          {linkedCrew && (
                            <div className="flex items-center gap-1.5">
                              <img
                                src={linkedCrew.avatar}
                                alt={linkedCrew.name}
                                referrerPolicy="no-referrer"
                                className="w-5 h-5 rounded-full object-cover border border-slate-800"
                              />
                              <span className="text-[10px] text-slate-400 font-mono">{linkedCrew.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                            <Calendar className="w-3 h-3" />
                            <span>{t.dueDate}</span>
                          </div>
                        </div>

                        {/* Control arrows */}
                        <div className="flex justify-between items-center pt-2 gap-2">
                          <button
                            type="button"
                            onClick={() => moveTask(t, "back")}
                            disabled={t.status === "To Do"}
                            className="p-1 px-2 border border-slate-800/80 hover:bg-slate-850 hover:text-white rounded text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTask(t.id)}
                            className="text-[10px] hover:text-rose-400 text-slate-500 transition"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTask(t, "forward")}
                            disabled={t.status === "Done"}
                            className="p-1 px-2 border border-slate-800/80 hover:bg-slate-850 hover:text-white rounded text-slate-450 disabled:opacity-35 disabled:hover:bg-transparent transition"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className={`border border-dashed rounded-lg py-8 text-center text-xs transition-colors ${
                      isDropTarget ? "border-cyan-500/40 text-cyan-500/60" : "border-slate-900 text-slate-500"
                    }`}>
                      {isDropTarget ? "Drop here" : "Column Clear"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Regular List View */
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="p-3">Job Title & Checklist</th>
                <th className="p-3">Client Build Site</th>
                <th className="p-3">Lead Assignated</th>
                <th className="p-3">Time Target</th>
                <th className="p-3">Level Priority</th>
                <th className="p-3">Program State</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.map((t) => {
                const linkedProj = projects.find((p) => p.id === t.projectId);
                const linkedCrew = team.find((m) => m.id === t.assigneeId);
                return (
                  <tr key={t.id} className="hover:bg-slate-850/40 transition">
                    <td className="p-3 font-semibold text-white">{t.title}</td>
                    <td className="p-3 text-slate-400">
                      {linkedProj ? linkedProj.name : "Core HQ Headquarters"}
                    </td>
                    <td className="p-3">
                      {linkedCrew ? (
                        <div className="flex items-center gap-2">
                          <img src={linkedCrew.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-800" referrerPolicy="no-referrer" />
                          <span>{linkedCrew.name}</span>
                        </div>
                      ) : "Unassigned"}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{t.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                        t.priority === "High" ? "bg-rose-500/10 text-rose-400" : t.priority === "Medium" ? "bg-amber-400/10 text-amber-500" : "bg-emerald-500/10 text-emerald-450"
                      }`}>
                        {t.priority} Priority
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] bg-slate-950 font-bold ${
                        t.status === "Done" ? "text-emerald-400" : "text-cyan-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={t.status}
                        onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as any)}
                        className="bg-slate-900 border border-slate-850 p-1.5 focus:border-cyan-500 text-white rounded text-[11px]"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-450">
                    No matching construction tasks listed. Increase range criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Interactive Modal: New Task Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Dispatch New Job / Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="space-y-4">
              <div>
                <label className="block text-slate-450 font-mono mb-1">Task Title / scope SOW *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g., Deliver drywall composite packs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-450 font-mono mb-1">Target Build Site *</label>
                <select
                  value={taskProjId}
                  onChange={(e) => setTaskProjId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-450 font-mono mb-1">Trade Specialist *</label>
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-450 font-mono mb-1">Due Deadline Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-450 font-mono mb-1">Priority Level</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-bold font-mono text-slate-950 rounded cursor-pointer"
                >
                  Add Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
