import React, { useState } from "react";
import { Project, Task, TeamMember, Document, ChangeOrder } from "../types";
import { initialWritings } from "../data";
import {
  ChevronRight,
  ChevronDown,
  MessageSquare,
  ArrowUpRight,
  CalendarDays,
  UploadCloud,
  Megaphone,
  Map,
  ShieldCheck,
  FileText,
  ClipboardList,
  Zap,
  Plus,
  Bell
} from "lucide-react";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  documents: Document[];
  changeOrders: ChangeOrder[];
  onNavigate: (tab: string) => void;
  onSelectProject: (p: Project) => void;
}

// Gantt bar descriptor — positions are % of the 14-day window (50% = today)
interface GanttRow {
  name: string;
  color: string;
  left: number;
  width: number;
  trailLabel?: string;
}

interface GanttGroup {
  proj: Project | undefined;
  onSchedule: boolean;
  hasDelay: boolean;
  rows: GanttRow[];
}

export const DashboardView: React.FC<DashboardProps> = ({
  projects, tasks, team, documents, changeOrders, onNavigate, onSelectProject
}) => {
  const [ganttMode, setGanttMode] = useState<"gantt" | "calendar" | "list">("gantt");
  const [taskTab, setTaskTab] = useState<"list" | "kanban">("list");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const inProgressProjects = projects.filter(p => p.category === "In Progress").slice(0, 2);
  const totalBudgeted = inProgressProjects.reduce((s, p) => s + p.budget, 0);
  const totalSpent   = inProgressProjects.reduce((s, p) => s + p.spent,   0);
  const spentPct     = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;
  const approvedCOs  = changeOrders.filter(co => co.status === "Approved").slice(0, 2);
  const pendingCOs   = changeOrders.filter(co => co.status === "Pending").length;
  const recentDocs   = documents.slice(0, 3);
  const teamPreview  = team.slice(0, 3);

  const docIcon = (category: string) => {
    if (category === "Blueprints")   return Map;
    if (category === "Permits")      return ShieldCheck;
    if (category === "Field Reports") return ClipboardList;
    return FileText;
  };

  const ganttGroups: GanttGroup[] = [
    {
      proj: projects.find(p => p.id === "proj_1"),
      onSchedule: true,
      hasDelay: true,
      rows: [
        { name: "Schedule Master Electrical Inspection",   color: "bg-blue-500",   left: 36, width: 28 },
        { name: "Tape, mud & sand drywall partitions",     color: "bg-purple-500", left: 57, width: 22 },
        { name: "Grouting custom grey marble floor tiles", color: "bg-red-400",    left: 65, width: 26, trailLabel: "Deck Deck" },
      ],
    },
    {
      proj: projects.find(p => p.id === "proj_2"),
      onSchedule: true,
      hasDelay: true,
      rows: [
        { name: "Install deck post ambient LED layout", color: "bg-emerald-500", left: 7,  width: 36 },
        { name: "Waterproofing barrier flood test",     color: "bg-orange-400",  left: 40, width: 29 },
        { name: "Green kitchen renovation",             color: "bg-amber-400",   left: 55, width: 22, trailLabel: "Onen..." },
      ],
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Greeting + CTA ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{greeting}, Alex</h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your projects today.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("estimate")}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project Proposal
        </button>
      </div>

      {/* ── 3-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Column 1: Current Projects ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Projects</h2>

          {inProgressProjects.map(proj => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-blue-400 transition truncate">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{proj.clientName}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-md font-mono uppercase tracking-wide border ${
                  proj.status === "Completed"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : proj.status === "Pending Inspection"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {proj.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-[11px] text-slate-300 font-mono">
                  <Zap className="w-3 h-3 text-blue-400" />
                  {proj.tasksCount} Tasks
                </span>
                {proj.unreadMessages > 0 ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-[11px] text-slate-300 font-mono">
                    <MessageSquare className="w-3 h-3 text-rose-400" />
                    {proj.unreadMessages} Unread
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-[11px] text-slate-300 font-mono">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    Messages
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Column 2: Integrated Financials ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Integrated Financials</h2>

          {/* Mini-Gantt / Draw Schedule */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <p className="text-xs font-semibold text-white">Mini-Gantt/Draw Schedule</p>

            {/* Mini budget bar chart */}
            <div className="space-y-2 p-3 bg-slate-950/60 rounded-lg border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono mb-2">Budgeted vs Actual</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-16 font-mono shrink-0">Budgeted</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-full rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-16 font-mono shrink-0">Actual</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial rows */}
            <div className="space-y-2.5 border-t border-slate-800/60 pt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Budgeted vs Actual</span>
                <span className="font-semibold text-white font-mono">${totalBudgeted.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Change Orders</span>
                <span className="font-semibold text-white font-mono">{pendingCOs}</span>
              </div>
              {approvedCOs.map((co, i) => (
                <div key={co.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Draw #{i + 1}</span>
                  <span className="font-semibold text-emerald-400 font-mono">Approved</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white">Quick Access</h3>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigate("budgets")}
                className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-300 hover:border-blue-500/40 hover:text-white transition cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                Change Orders
              </button>
              <button
                type="button"
                onClick={() => onNavigate("timesheets")}
                className="flex items-center justify-center gap-1.5 flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-300 hover:border-blue-500/40 hover:text-white transition cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                Daily Logs
              </button>
            </div>
          </div>
        </div>

        {/* ── Column 3: Project Documentation ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Documentation</h2>

          {/* Recently Viewed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <p className="text-[11px] text-slate-500 font-mono">Recently Viewed</p>

            <div className="space-y-0.5">
              {recentDocs.map(doc => {
                const Icon = docIcon(doc.category);
                const shortName = doc.name.replace(/\s*[-–].+$/, "").replace(/\.[^.]+$/, "");
                return (
                  <button
                    type="button"
                    key={doc.id}
                    onClick={() => onNavigate("documents")}
                    className="w-full flex items-center justify-between px-2 py-2.5 hover:bg-slate-800/50 rounded-lg transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-xs text-slate-300 font-medium text-left truncate">{shortName}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate("documents")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>

          {/* What's New */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white">What's New</h3>
            <div className="space-y-3">
              {initialWritings.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {item.category === "Safety"
                      ? <Bell className="w-3.5 h-3.5 text-amber-400" />
                      : <Megaphone className="w-3.5 h-3.5 text-blue-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-snug">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Directory */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white">Team Directory</h3>
            <div className="space-y-2.5">
              {teamPreview.map(member => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-slate-900 ${
                        member.status === "Online"      ? "bg-emerald-400" :
                        member.status === "In Meeting"  ? "bg-amber-400"   : "bg-slate-500"
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white leading-none">{member.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{member.role.split(" & ")[0].replace("Finish ", "")}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    title={`Message ${member.name}`}
                    aria-label={`Message ${member.name}`}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-white cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── My Tasks + Gantt ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Tasks</h2>
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
            {(["Gantt", "Calendar", "List"] as const).map(mode => (
              <button
                type="button"
                key={mode}
                onClick={() => setGanttMode(mode.toLowerCase() as "gantt" | "calendar" | "list")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                  ganttMode === mode.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          {/* Sub-tabs */}
          <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/30">
            {(["list", "kanban"] as const).map(tab => (
              <button
                type="button"
                key={tab}
                onClick={() => setTaskTab(tab)}
                className={`px-4 py-3 text-xs font-medium capitalize border-b-2 -mb-px transition cursor-pointer ${
                  taskTab === tab
                    ? "border-blue-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {tab === "list" ? "List View" : "Kanban View"}
              </button>
            ))}
          </div>

          {/* Gantt body */}
          <div className="flex min-h-[220px]">

            {/* Left: task name panel */}
            <div className="w-52 shrink-0 border-r border-slate-800">
              {ganttGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-slate-800/60 bg-slate-950/50">
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-300 truncate">
                      {group.proj?.name ?? "Project"}
                    </span>
                  </div>
                  {group.rows.map((row, ri) => (
                    <div key={ri} className="px-3 py-2.5 border-b border-slate-800/30 flex items-center">
                      <span className="text-[11px] text-slate-500 truncate">{row.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Right: timeline + bars */}
            <div className="flex-1 overflow-hidden">

              {/* Timeline header with Today marker */}
              <div className="relative h-9 border-b border-slate-800 bg-slate-950/50">
                <div
                  className="absolute top-0 h-full flex flex-col items-center pointer-events-none"
                  style={{ left: "50%" }}
                >
                  <span className="text-[10px] text-blue-400 font-bold font-mono mt-1.5 -translate-x-1/2 whitespace-nowrap">Today</span>
                  <div className="w-px flex-1 bg-blue-500/50" />
                </div>
              </div>

              {/* Task rows per group */}
              {ganttGroups.map((group, gi) => (
                <div key={gi}>
                  {/* Group status badge row */}
                  <div className="relative h-9 border-b border-slate-800/60 bg-slate-950/30 flex items-center justify-end px-3 gap-1.5">
                    <div className="absolute inset-y-0 w-px bg-blue-500/20" style={{ left: "50%" }} />
                    {group.onSchedule && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono">
                        On Schedule
                      </span>
                    )}
                    {group.hasDelay && (
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono">
                        Material Delay
                      </span>
                    )}
                  </div>

                  {/* Task bar rows */}
                  {group.rows.map((row, ri) => (
                    <div key={ri} className="relative h-10 border-b border-slate-800/30">
                      <div className="absolute inset-y-0 w-px bg-blue-500/15" style={{ left: "50%" }} />
                      <div
                        className={`absolute top-2 h-6 ${row.color} rounded-md shadow-sm`}
                        style={{ left: `${row.left}%`, width: `${row.width}%` }}
                      />
                      {row.trailLabel && (
                        <span
                          className="absolute top-3.5 text-[10px] text-slate-400 font-mono whitespace-nowrap"
                          style={{ left: `${row.left + row.width + 0.5}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
