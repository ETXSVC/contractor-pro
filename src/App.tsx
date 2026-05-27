import { useState, useEffect } from "react";
import { 
  Project, 
  Task, 
  Document, 
  TeamMember, 
  Proposal, 
  Invoice, 
  TimeRecord, 
  BudgetCostCode, 
  ChangeOrder 
} from "./types";
import { 
  initialProjects, 
  initialTasks, 
  initialDocuments, 
  initialTeamMembers, 
  initialProposals, 
  initialInvoices, 
  initialTimeRecords, 
  initialBudgetCostCodes, 
  initialChangeOrders 
} from "./data";

// Sub-views
import { DashboardView } from "./components/DashboardView";
import { PortfolioView } from "./components/PortfolioView";
import { TaskBoardView } from "./components/TaskBoardView";
import { DocumentView } from "./components/DocumentView";
import { EstimatorView } from "./components/EstimatorView";
import { StaffView } from "./components/StaffView";
import { TimesheetView } from "./components/TimesheetView";
import { InvoicesView } from "./components/InvoicesView";
import { BudgetsView } from "./components/BudgetsView";
import { ChangeOrdersView } from "./components/ChangeOrdersView";

// Icons
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Clock,
  Receipt,
  Menu,
  X,
  Bell,
  Search,
  Wrench,
  Folder,
  ClipboardList,
  Settings,
  LogOut,
  BarChart2,
  BookOpen,
  FileSignature
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "projects"
  | "tasks"
  | "documents"
  | "estimate"
  | "staff"
  | "timesheets"
  | "invoices"
  | "changeorders"
  | "budgets";

export default function App() {
  const [activeTab, setActiveTab2] = useState<ActiveTab>("dashboard");
  const [activeFinancialLink, setActiveFinancialLink] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);

  // Core Persistent State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("cp_projects");
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("cp_tasks");
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem("cp_documents");
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem("cp_team");
    return saved ? JSON.parse(saved) : initialTeamMembers;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem("cp_proposals");
    return saved ? JSON.parse(saved) : initialProposals;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("cp_invoices");
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(() => {
    const saved = localStorage.getItem("cp_timeRecords");
    return saved ? JSON.parse(saved) : initialTimeRecords;
  });

  const [costCodes, setCostCodes] = useState<BudgetCostCode[]>(() => {
    const saved = localStorage.getItem("cp_costCodes");
    return saved ? JSON.parse(saved) : initialBudgetCostCodes;
  });

  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(() => {
    const saved = localStorage.getItem("cp_changeOrders");
    return saved ? JSON.parse(saved) : initialChangeOrders;
  });

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem("cp_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("cp_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("cp_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("cp_team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("cp_proposals", JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem("cp_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("cp_timeRecords", JSON.stringify(timeRecords));
  }, [timeRecords]);

  useEffect(() => {
    localStorage.setItem("cp_costCodes", JSON.stringify(costCodes));
  }, [costCodes]);

  useEffect(() => {
    localStorage.setItem("cp_changeOrders", JSON.stringify(changeOrders));
  }, [changeOrders]);

  // Global triggers
  const handleAddProject = (p: Project) => {
    setProjects([p, ...projects]);
  };

  const handleSelectProject = (p: Project) => {
    setSelectedProjectDetail(p);
  };

  const handleAddTask = (t: Task) => {
    setTasks([t, ...tasks]);
    // increment project tasks count
    setProjects(prev => prev.map(p => p.id === t.projectId ? { ...p, tasksCount: p.tasksCount + 1 } : p));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddDocument = (d: Document) => {
    setDocuments([d, ...documents]);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleAddMember = (m: TeamMember) => {
    setTeam([...team, m]);
  };

  const handleAddProposal = (prop: Proposal) => {
    setProposals([prop, ...proposals]);
    // If proposal is instantly approved, let's bootstrap a new In-Progress project!
    if (prop.status === "Approved") {
      const createdProj: Project = {
        id: "proj_ai_" + Date.now(),
        name: prop.projectName,
        category: "In Progress",
        status: "AI Planning active",
        progress: 10,
        duration: "Next 12 Weeks",
        description: `Custom build portfolio bootstrapped automatically from approved bid estimate. Client: ${prop.clientName}`,
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19040fa?auto=format&fit=crop&q=80&w=400",
        clientName: prop.clientName,
        budget: prop.value,
        spent: 0,
        unreadMessages: 0,
        tasksCount: 0
      };
      setProjects(prev => [createdProj, ...prev]);
    }
  };

  const handleAddInvoice = (inv: Invoice) => {
    setInvoices([inv, ...invoices]);
  };

  const handleAddRecord = (rec: TimeRecord) => {
    setTimeRecords([rec, ...timeRecords]);
  };

  const handleDeleteRecord = (id: string) => {
    setTimeRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleApproveChangeOrder = (id: string) => {
    const co = changeOrders.find(c => c.id === id);
    if (!co) return;

    // Approve the change order
    setChangeOrders(prev => prev.map(c => c.id === id ? { ...c, status: "Approved" } : c));

    // Dynamic Financial Sync: Increment the associated project's spent amount!
    setProjects(prev => prev.map(p => {
      // Fuzzy matching name
      if (p.id === co.projectId || p.name.includes(co.projectName)) {
        return { ...p, spent: p.spent + co.amount, progress: Math.min(95, p.progress + 5) };
      }
      return p;
    }));

    // Dynamic Cost Code Sync: Add to actual spent of a target code (e.g., structural steel or general contractor codes)
    setCostCodes(prev => prev.map(cc => {
      // Add spending to Finish Carpentry or General MEP code depending on matching
      if (co.title.toLowerCase().includes("electrical") && cc.code === "26-000") {
        return { ...cc, actual: cc.actual + co.amount };
      }
      if (co.title.toLowerCase().includes("quartz") && cc.code === "09-300") {
        return { ...cc, actual: cc.actual + co.amount };
      }
      if (co.title.toLowerCase().includes("foundation") && cc.code === "03-200") {
        return { ...cc, actual: cc.actual + co.amount };
      }
      return cc;
    }));

    alert(`Change order "${co.title}" approved! Project cost ledgers and CSI division spending updated dynamically.`);
  };

  const handleDeclineChangeOrder = (id: string) => {
    setChangeOrders(prev => prev.map(c => c.id === id ? { ...c, status: "Declined" } : c));
  };

  // Helper to change tab & close drawer
  const navigateTo = (tab: ActiveTab) => {
    setActiveTab2(tab);
    setActiveFinancialLink("");
    setSidebarOpen(false);
  };

  const navigateFinancial = (tab: ActiveTab, label: string) => {
    setActiveTab2(tab);
    setActiveFinancialLink(label);
    setSidebarOpen(false);
  };

  const pendingCOs = changeOrders.filter(co => co.status === "Pending").length;

  // Sidebar link items
  const mainNavLinks = [
    { id: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
    { id: "projects",   label: "Projects",        icon: Briefcase },
    { id: "tasks",      label: "Tasks",           icon: CheckSquare },
    { id: "documents",  label: "Documents",       icon: Folder },
    { id: "estimate",   label: "Proposals",       icon: FileSignature },
    { id: "staff",      label: "Team",            icon: Users },
    { id: "timesheets", label: "Time Tracking",   icon: Clock },
    { id: "invoices",   label: "Invoicing",       icon: Receipt },
  ];

  const financialNavLinks = [
    { id: "changeorders", label: "Change Orders", icon: ClipboardList, badge: pendingCOs },
    { id: "budgets",      label: "Budgets",       icon: BarChart2,     badge: 0 },
    { id: "documents",    label: "Daily Logs",    icon: BookOpen,      badge: 0 },
  ];

  return (
    <div id="contractor-pro-portal" className="flex min-h-screen bg-transparent text-slate-100 antialiased font-sans">
      
      {/* Sidebar - Desktop persistent, Mobile absolute */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#07090f] border-r border-white/[0.07] transform lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Branding */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shadow-md">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-none">Contractor Pro</h2>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider">Enterprise v1.2</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded text-slate-500 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {mainNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.label}
                type="button"
                onClick={() => navigateTo(link.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </button>
            );
          })}

          {/* Integrated Financials section */}
          <div className="pt-4 mt-2 border-t border-white/[0.07]">
            <p className="px-3 pb-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">
              Integrated Financials
            </p>
            {financialNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeFinancialLink === link.label;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => navigateFinancial(link.id as ActiveTab, link.label)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-950 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-white/[0.07] p-3 space-y-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        
        {/* Top Header navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 bg-[#07090f]/80 backdrop-blur-lg border-b border-white/[0.07]">

          {/* Mobile menu trigger */}
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded text-slate-400 hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:block w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects, tasks, documents…"
              disabled
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-8 pr-4 py-2 text-xs text-slate-400 cursor-not-allowed outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              type="button"
              aria-label="View notifications"
              onClick={() => alert("Recent alerts: John Smith logged on-site, Drawings approved")}
              className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <Bell className="w-4.5 h-4.5" />
              {pendingCOs > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center text-[8px] font-bold bg-cyan-500 text-slate-950 rounded-full leading-none">
                  {pendingCOs}
                </span>
              )}
            </button>

            {/* User identity */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.07]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow">
                AH
              </div>
              <div className="hidden xl:block text-left leading-none">
                <span className="text-xs font-semibold text-white block">Alex Hartman</span>
                <span className="text-[10px] text-slate-500 font-mono">General Contractor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Core application body contents */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === "dashboard" && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              team={team}
              documents={documents}
              changeOrders={changeOrders}
              onNavigate={(t) => navigateTo(t as ActiveTab)}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === "projects" && (
            <PortfolioView 
              projects={projects} 
              onAddProject={handleAddProject}
              onSelectProject={handleSelectProject}
            />
          )}

          {activeTab === "tasks" && (
            <TaskBoardView 
              tasks={tasks} 
              projects={projects} 
              team={team} 
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === "documents" && (
            <DocumentView 
              documents={documents} 
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === "estimate" && (
            <EstimatorView 
              proposals={proposals} 
              onAddProposal={handleAddProposal}
            />
          )}

          {activeTab === "staff" && (
            <StaffView 
              team={team}
              onAddMember={handleAddMember}
            />
          )}

          {activeTab === "timesheets" && (
            <TimesheetView 
              timeRecords={timeRecords} 
              projects={projects} 
              team={team} 
              onAddRecord={handleAddRecord}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesView 
              invoices={invoices} 
              onAddInvoice={handleAddInvoice}
            />
          )}

          {activeTab === "changeorders" && (
            <ChangeOrdersView
              changeOrders={changeOrders}
              projects={projects}
              onApproveChangeOrder={handleApproveChangeOrder}
              onDeclineChangeOrder={handleDeclineChangeOrder}
            />
          )}

          {activeTab === "budgets" && (
            <BudgetsView
              costCodes={costCodes}
              projects={projects}
            />
          )}
        </main>
      </div>

      {/* Project Inspector drawer modal selection */}
      {selectedProjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-[#0a0d1c] border-l border-slate-800 w-full max-w-md h-full overflow-y-auto p-6 space-y-5 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Site Audit Report
                </span>
                <button
                  type="button"
                  aria-label="Close project detail"
                  onClick={() => setSelectedProjectDetail(null)}
                  className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950">
                <img 
                  src={selectedProjectDetail.image} 
                  alt="" 
                  className="w-full h-full object-cover opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d1c] via-transparent" />
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold font-display text-white leading-tight">{selectedProjectDetail.name}</h2>
                <span className="text-[11px] text-slate-450 block font-mono">Client: <strong>{selectedProjectDetail.clientName}</strong></span>
                <span className="text-[11px] text-slate-450 block font-mono">Target Program: {selectedProjectDetail.duration}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedProjectDetail.description}</p>

              {/* Progress and financials metrics */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-450 uppercase text-[10px]">Division actual spent</span>
                  <span className="text-white font-bold text-sm">${selectedProjectDetail.spent.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-455 uppercase text-[10px]">Total site budget authorized</span>
                  <span className="text-cyan-404 font-bold text-sm">${selectedProjectDetail.budget.toLocaleString()}</span>
                </div>

                {/* Progress ratio bar */}
                <div className="pt-2 border-t border-slate-850/60">
                  <div className="flex justify-between items-center text-[10px] text-slate-455 mb-1 uppercase">
                    <span>Task progress complete</span>
                    <span>{selectedProjectDetail.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${selectedProjectDetail.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedProjectDetail(null)}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 font-bold uppercase font-mono rounded-lg shadow-md transition cursor-pointer text-center block mt-6"
            >
              Verify Site Audit Complete
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
