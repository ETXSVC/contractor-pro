import React, { useState, useMemo } from "react";
import { Project } from "../types";
import {
  Plus, Search, X, AlertTriangle, FolderOpen,
  LayoutGrid, List, Columns2, CalendarDays, GanttChartSquare,
  ChevronLeft, ChevronRight, TrendingUp, DollarSign
} from "lucide-react";

interface PortfolioProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onSelectProject: (project: Project) => void;
}

type TabType = "All" | "In Progress" | "Bidding" | "Completed";
type ViewMode = "grid" | "list" | "kanban" | "calendar" | "gantt";

// ── Date helpers ──────────────────────────────────────────────────────────────

function parseDates(duration: string): { start: Date; end: Date } | null {
  // "Jun 10 - Aug 25, 2026" or "Jun 10 - Aug 25"
  const rangeMatch = duration.match(
    /([A-Za-z]+\.?\s+\d{1,2}(?:,?\s+\d{4})?)\s*[-–]\s*([A-Za-z]+\.?\s+\d{1,2}(?:,?\s+\d{4})?)/
  );
  if (rangeMatch) {
    const yearMatch = duration.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
    const s = new Date(`${rangeMatch[1].replace(",", "")} ${year}`);
    const e = new Date(`${rangeMatch[2].replace(",", "")} ${year}`);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) return { start: s, end: e };
  }
  // "12 weeks"
  const weeksMatch = duration.match(/(\d+)\s*weeks?/i);
  if (weeksMatch) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + parseInt(weeksMatch[1]) * 7);
    return { start, end };
  }
  return null;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CAT_COLOR: Record<string, string> = {
  "In Progress": "bg-cyan-500",
  "Bidding":     "bg-amber-400",
  "Completed":   "bg-emerald-400",
};
const CAT_TEXT: Record<string, string> = {
  "In Progress": "text-cyan-400",
  "Bidding":     "text-amber-400",
  "Completed":   "text-emerald-400",
};
const CAT_BORDER: Record<string, string> = {
  "In Progress": "border-cyan-500/30",
  "Bidding":     "border-amber-400/30",
  "Completed":   "border-emerald-400/30",
};

// ── Sub-views ─────────────────────────────────────────────────────────────────

const ListView: React.FC<{ projects: Project[]; onSelect: (p: Project) => void }> = ({ projects, onSelect }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-800">
    <table className="w-full text-xs text-left">
      <thead>
        <tr className="bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider">
          <th className="px-4 py-3">Project</th>
          <th className="px-4 py-3">Client</th>
          <th className="px-4 py-3">Category</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Progress</th>
          <th className="px-4 py-3">Budget</th>
          <th className="px-4 py-3">Spent</th>
          <th className="px-4 py-3">Duration</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p, i) => (
          <tr
            key={p.id}
            onClick={() => onSelect(p)}
            className={`border-t border-slate-800 hover:bg-slate-800/60 cursor-pointer transition ${i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"}`}
          >
            <td className="px-4 py-3 font-semibold text-white max-w-[180px] truncate">{p.name}</td>
            <td className="px-4 py-3 text-slate-300">{p.clientName}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${CAT_COLOR[p.category]} text-slate-950`}>
                {p.category}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-300">{p.status}</td>
            <td className="px-4 py-3 min-w-[110px]">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-slate-300 font-mono w-8 text-right">{p.progress}%</span>
              </div>
            </td>
            <td className="px-4 py-3 text-cyan-400 font-mono font-semibold">${p.budget.toLocaleString()}</td>
            <td className="px-4 py-3 text-slate-300 font-mono">${p.spent.toLocaleString()}</td>
            <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate">{p.duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {projects.length === 0 && (
      <div className="text-center py-16 text-slate-500 text-sm">No projects match your filter.</div>
    )}
  </div>
);

const KanbanView: React.FC<{ projects: Project[]; onSelect: (p: Project) => void }> = ({ projects, onSelect }) => {
  const cols: Array<{ key: Project["category"]; label: string }> = [
    { key: "Bidding",     label: "Bidding" },
    { key: "In Progress", label: "In Progress" },
    { key: "Completed",   label: "Completed" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map(({ key, label }) => {
        const items = projects.filter(p => p.category === key);
        return (
          <div key={key} className={`bg-slate-900/40 border ${CAT_BORDER[key]} rounded-xl p-3 space-y-3 min-h-[300px]`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">{label}</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${CAT_COLOR[key]} text-slate-950`}>{items.length}</span>
            </div>
            {items.map(p => (
              <div
                key={p.id}
                onClick={() => onSelect(p)}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg p-3 space-y-2 cursor-pointer transition group"
              >
                {p.alert && (
                  <div className="flex items-center gap-1 text-[10px] text-rose-400 font-mono">
                    <AlertTriangle className="w-3 h-3" />{p.alert}
                  </div>
                )}
                <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition leading-snug">{p.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">Client: <span className="text-slate-300">{p.clientName}</span></p>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{p.progress}% complete</span>
                  <span className="text-cyan-400">${p.budget.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex items-center justify-center h-24 text-slate-600 text-xs">No projects</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CalendarView: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const projectsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return projects.filter(p => {
      const d = parseDates(p.duration);
      if (!d) return false;
      return date >= d.start && date <= d.end;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" title="Previous month" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold font-display text-white">{MONTHS[month]} {year}</span>
        <button type="button" title="Next month" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-slate-800 rounded-xl overflow-hidden">
        {DAYS.map(d => (
          <div key={d} className="bg-slate-900 border-r border-b border-slate-800 px-2 py-2 text-center text-[10px] font-mono font-bold text-slate-400 uppercase">
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          const hits = day ? projectsForDay(day) : [];
          const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
          return (
            <div
              key={idx}
              className={`border-r border-b border-slate-800 min-h-[80px] p-1.5 text-[11px] ${day ? "bg-slate-950" : "bg-slate-900/20"} ${isToday ? "ring-1 ring-inset ring-cyan-500/40" : ""}`}
            >
              {day && (
                <>
                  <span className={`font-mono text-[10px] font-bold ${isToday ? "text-cyan-400" : "text-slate-500"}`}>{day}</span>
                  <div className="mt-0.5 space-y-0.5 overflow-hidden max-h-[56px]">
                    {hits.slice(0, 3).map(p => (
                      <div
                        key={p.id}
                        className={`truncate rounded px-1 py-px text-[9px] font-semibold font-mono text-slate-950 ${CAT_COLOR[p.category]}`}
                        title={p.name}
                      >
                        {p.name}
                      </div>
                    ))}
                    {hits.length > 3 && <div className="text-[9px] text-slate-500 pl-1">+{hits.length - 3} more</div>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {projects.map(p => {
          const d = parseDates(p.duration);
          if (!d) return null;
          return (
            <div key={p.id} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded px-2 py-1">
              <span className={`w-2 h-2 rounded-full ${CAT_COLOR[p.category]}`} />
              <span className="text-slate-300 font-semibold">{p.name}</span>
              <span>{MONTHS[d.start.getMonth()]} {d.start.getDate()} – {MONTHS[d.end.getMonth()]} {d.end.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GanttView: React.FC<{ projects: Project[]; onSelect: (p: Project) => void }> = ({ projects, onSelect }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 24-week window starting 2 weeks before today
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 14);
  const WEEKS = 24;
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + WEEKS * 7);

  const weekLabels: Array<{ label: string; offset: number }> = [];
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + w * 7);
    const isMonthStart = d.getDate() <= 7;
    weekLabels.push({ label: isMonthStart ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "", offset: w });
  }

  const todayOffset = Math.max(0, (today.getTime() - windowStart.getTime()) / (7 * 24 * 3600 * 1000));

  const barFor = (p: Project) => {
    const d = parseDates(p.duration);
    if (!d) return null;
    const startOffset = (d.start.getTime() - windowStart.getTime()) / (7 * 24 * 3600 * 1000);
    const endOffset   = (d.end.getTime()   - windowStart.getTime()) / (7 * 24 * 3600 * 1000);
    const left  = Math.max(0, (startOffset / WEEKS) * 100);
    const right = Math.min(100, (endOffset   / WEEKS) * 100);
    const width = Math.max(right - left, 1);
    return { left, width };
  };

  const colW = 100 / WEEKS;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <div className="min-w-[900px]">
        {/* Header */}
        <div className="flex bg-slate-900/80">
          <div className="w-48 shrink-0 border-r border-b border-slate-800 px-3 py-2 text-[10px] font-mono font-bold text-slate-400 uppercase">Project</div>
          <div className="flex-1 relative border-b border-slate-800 overflow-hidden">
            <div className="flex h-full">
              {weekLabels.map((wl, i) => (
                <div key={i} className="border-r border-slate-800/60 px-1 py-2 text-[9px] font-mono text-slate-500 truncate" style={{ width: `${colW}%` }}>
                  {wl.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rows */}
        {projects.map((p, i) => {
          const bar = barFor(p);
          return (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              className={`flex cursor-pointer hover:bg-slate-800/40 transition ${i % 2 === 0 ? "bg-slate-950" : "bg-slate-900/20"}`}
            >
              <div className="w-48 shrink-0 border-r border-b border-slate-800 px-3 py-3">
                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.clientName}</p>
              </div>
              <div className="flex-1 relative border-b border-slate-800 min-h-[52px]">
                {/* Week grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {weekLabels.map((_, idx) => (
                    <div key={idx} className="border-r border-slate-800/40" style={{ width: `${colW}%` }} />
                  ))}
                </div>
                {/* Today line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-cyan-500/50 z-10 pointer-events-none"
                  style={{ left: `${(todayOffset / WEEKS) * 100}%` }}
                />
                {/* Bar */}
                {bar ? (
                  <div
                    className={`absolute top-3 bottom-3 rounded ${CAT_COLOR[p.category]} opacity-80 hover:opacity-100 transition flex items-center px-2`}
                    style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                    title={`${p.name} — ${p.duration}`}
                  >
                    <span className="text-[9px] font-bold font-mono text-slate-950 truncate">{p.progress}%</span>
                  </div>
                ) : (
                  <div className="absolute inset-y-0 flex items-center px-2">
                    <span className="text-[10px] text-slate-600 font-mono italic">No date — {p.duration}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No projects match your filter.</div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-3 border-t border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-mono">Legend:</span>
          {Object.entries(CAT_COLOR).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className={`w-3 h-2 rounded-sm ${v}`} />
              {k}
            </div>
          ))}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="w-px h-3 bg-cyan-500" />
            Today
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const VIEW_ICONS = [
  { mode: "grid" as ViewMode,     icon: LayoutGrid,        label: "Grid" },
  { mode: "list" as ViewMode,     icon: List,              label: "List" },
  { mode: "kanban" as ViewMode,   icon: Columns2,          label: "Kanban" },
  { mode: "calendar" as ViewMode, icon: CalendarDays,      label: "Calendar" },
  { mode: "gantt" as ViewMode,    icon: GanttChartSquare,  label: "Gantt" },
];

export const PortfolioView: React.FC<PortfolioProps> = ({ projects, onAddProject, onSelectProject }) => {
  const [activeTab,    setActiveTab]    = useState<TabType>("All");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [viewMode,     setViewMode]     = useState<ViewMode>("grid");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName,     setNewName]     = useState("");
  const [newCat,      setNewCat]      = useState<"In Progress" | "Bidding" | "Completed">("In Progress");
  const [newClient,   setNewClient]   = useState("");
  const [newBudget,   setNewBudget]   = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newDesc,     setNewDesc]     = useState("");
  const [newSqft,     setNewSqft]     = useState("");

  const filtered = useMemo(() => projects.filter(p => {
    const matchTab    = activeTab === "All" || p.category === activeTab;
    const matchSearch = [p.name, p.clientName, p.description]
      .join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  }), [projects, activeTab, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newClient || !newBudget) return;

    const images = [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
    ];

    onAddProject({
      id: "proj_" + Date.now(),
      name: newName,
      category: newCat,
      status: newCat === "In Progress" ? "Site Setup" : newCat === "Bidding" ? "Drafting Proposal" : "Completed",
      progress: newCat === "Completed" ? 100 : 0,
      duration: newDuration || "TBD",
      description: newDesc || `${newName} for client ${newClient}.`,
      image: images[Math.floor(Math.random() * images.length)],
      clientName: newClient,
      budget: Number(newBudget),
      spent: 0,
      unreadMessages: 0,
      tasksCount: 0,
    });

    setShowAddModal(false);
    setNewName(""); setNewClient(""); setNewBudget("");
    setNewDuration(""); setNewDesc(""); setNewSqft("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Project Library Portfolio</h1>
          <p className="text-xs text-slate-400">Review status logs, progress trends, cost utilization, and daily reports.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition shadow-md glow-cyan cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Proposal Card
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
        {/* Tab filters */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800/80 rounded-lg w-full sm:w-auto overflow-x-auto">
          {(["All", "In Progress", "Bidding", "Completed"] as TabType[]).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition font-mono whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/80 transition"
            />
          </div>

          {/* View toggles */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
            {VIEW_ICONS.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                title={label}
                onClick={() => setViewMode(mode)}
                className={`p-1.5 rounded transition cursor-pointer ${
                  viewMode === mode
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Views */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(proj => (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700/85 overflow-hidden transition cursor-pointer group"
            >
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img src={proj.image} alt={proj.name} referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-bold rounded ${CAT_COLOR[proj.category]} text-slate-950`}>
                  {proj.category}
                </span>
                {proj.alert && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> {proj.alert}
                  </span>
                )}
                <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-white text-[11px] font-bold font-mono px-2 py-0.5 rounded">
                  {proj.progress}%
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-400 transition">{proj.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Client: <strong>{proj.clientName}</strong></p>
                  <p className="text-xs text-slate-400 leading-snug line-clamp-3 pt-1">{proj.description}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Spent</span>
                      <span className="text-white font-semibold">${proj.spent.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Budget</span>
                      <span className="text-cyan-400 font-bold">${proj.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/10 rounded-xl flex flex-col items-center justify-center p-8 text-center min-h-[300px] cursor-pointer transition"
          >
            <FolderOpen className="w-10 h-10 text-slate-500 hover:text-cyan-400 mb-3 transition" />
            <h4 className="text-sm font-semibold text-white">Create New Build Site</h4>
            <p className="text-xs text-slate-400 max-w-[200px] mt-1">Bootstrap task lists, material estimations, and drawing packages.</p>
          </div>
        </div>
      )}

      {viewMode === "list"     && <ListView     projects={filtered} onSelect={onSelectProject} />}
      {viewMode === "kanban"   && <KanbanView   projects={filtered} onSelect={onSelectProject} />}
      {viewMode === "calendar" && <CalendarView projects={filtered} />}
      {viewMode === "gantt"    && <GanttView    projects={filtered} onSelect={onSelectProject} />}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">New Construction Proposal Setup</h3>
              <button type="button" title="Close" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-mono mb-1">Build Site Name *</label>
                  <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Oakridge Kitchen Gut" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Category</label>
                  <select title="Construction program category" value={newCat} onChange={e => setNewCat(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500">
                    <option value="In Progress">In Progress</option>
                    <option value="Bidding">Bidding</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Estimated Sq Ft</label>
                  <input type="number" value={newSqft} onChange={e => setNewSqft(e.target.value)} placeholder="e.g. 1500" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Client Name *</label>
                  <input type="text" required value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="e.g. Marcus Aurelius" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Budget ($) *</label>
                  <input type="number" required value={newBudget} onChange={e => setNewBudget(e.target.value)} placeholder="e.g. 75000" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-mono mb-1">Timeline (used in Gantt &amp; Calendar)</label>
                  <input type="text" value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="e.g. Jun 10 - Aug 25, 2026" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 font-mono mb-1">SOW Description</label>
                  <textarea rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Provide scope parameters..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-bold font-mono text-slate-950 rounded text-xs cursor-pointer">Save Proposed Site</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
