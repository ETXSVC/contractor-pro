import React, { useState } from "react";
import { Project } from "../types";
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  Search, 
  DollarSign, 
  FileText, 
  X,
  AlertTriangle,
  FolderOpen
} from "lucide-react";

interface PortfolioProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  onSelectProject: (project: Project) => void;
}

type TabType = "All" | "In Progress" | "Bidding" | "Completed";

export const PortfolioView: React.FC<PortfolioProps> = ({ 
  projects, 
  onAddProject,
  onSelectProject
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState<"In Progress" | "Bidding" | "Completed">("In Progress");
  const [newClient, setNewClient] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSqft, setNewSqft] = useState("");

  // Filters projects
  const filtered = projects.filter(p => {
    const matchTab = activeTab === "All" || p.category === activeTab;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newClient || !newBudget) return;

    // Sourcing generic placeholder images
    const imagesArray = [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400"
    ];
    const itemImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];

    const created: Project = {
      id: "proj_" + Date.now(),
      name: newName,
      category: newCat,
      status: newCat === "In Progress" ? "Site Setup" : newCat === "Bidding" ? "Drafting Proposal" : "Completed",
      progress: newCat === "Completed" ? 100 : 0,
      duration: newDuration || "TBD",
      description: newDesc || `${newName} planned for client ${newClient}. Built on premium construction specifications.`,
      image: itemImage,
      clientName: newClient,
      budget: Number(newBudget),
      spent: 0,
      unreadMessages: 0,
      tasksCount: 0
    };

    onAddProject(created);
    setShowAddModal(false);

    // Reset fields
    setNewName("");
    setNewClient("");
    setNewBudget("");
    setNewDuration("");
    setNewDesc("");
    setNewSqft("");
  };

  return (
    <div id="portfolio-view" className="space-y-6">
      
      {/* Search Header and Trigger */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Project Library Portfolio</h1>
          <p className="text-xs text-slate-400">Review status logs, progress trends, cost utilization, and daily reports.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition duration-200 shadow-md glow-cyan cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Proposal Card
        </button>
      </div>

      {/* Control Bar: Filters and Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        
        {/* Tab filters */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800/80 rounded-lg w-full sm:w-auto overflow-x-auto">
          {(["All", "In Progress", "Bidding", "Completed"] as TabType[]).map((tab) => (
            <button
              key={tab}
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

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/80 transition"
          />
        </div>
      </div>

      {/* Portfolio Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onSelectProject(proj)}
            className="flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700/85 overflow-hidden transition cursor-pointer group"
          >
            {/* Image banner */}
            <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
              <img
                src={proj.image}
                alt={proj.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              {/* Category tag */}
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-semibold rounded ${
                proj.category === "In Progress"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : proj.category === "Bidding"
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "bg-emerald-400 text-slate-950 font-bold"
              }`}>
                {proj.category}
              </span>

              {proj.alert && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> {proj.alert}
                </span>
              )}

              {/* Progress counter circular or basic layout */}
              <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 text-white text-[11px] font-bold font-mono px-2 py-0.5 rounded">
                {proj.progress}%
              </div>
            </div>

            {/* General Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="font-bold text-white text-base leading-snug group-hover:text-cyan-400 transition">
                  {proj.name}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Client: <strong>{proj.clientName}</strong></span>
                </div>
                <p className="text-xs text-slate-400 leading-snug line-clamp-3 pt-1">
                  {proj.description}
                </p>
              </div>

              {/* Budget Details & Metric Progress Line */}
              <div className="space-y-3 pt-2">
                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Spent Progress</span>
                    <span className="text-white font-semibold">${proj.spent.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Budget</span>
                    <span className="text-cyan-400 font-bold">${proj.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Blank Proposal Card */}
        <div 
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/10 rounded-xl flex flex-col items-center justify-center p-8 text-center min-h-[300px] cursor-pointer transition"
        >
          <FolderOpen className="w-10 h-10 text-slate-500 hover:text-cyan-400 mb-3 transition" />
          <h4 className="text-sm font-semibold text-white">Create New Build Site</h4>
          <p className="text-xs text-slate-400 max-w-[200px] mt-1">Specify parameters to bootstrap task lists, material estimations, and drawing packages.</p>
        </div>
      </div>

      {/* Interactive Modal: New Site Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-display">New Construction Proposal Setup</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-450 font-mono mb-1">Build Site Name / Title *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Oakridge Kitchen Gut..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-450 font-mono mb-1">Construction Program Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Bidding">Bidding</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 font-mono mb-1">Estimated Sq Ft Size *</label>
                  <input
                    type="number"
                    value={newSqft}
                    onChange={(e) => setNewSqft(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-455 font-mono mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-455 font-mono mb-1">Authorized Target Budget ($) *</label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-455 font-mono mb-1">Target Milestone Timeline</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. Jun 10 - Aug 25, 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-455 font-mono mb-1">SOW Brief Description</label>
                  <textarea
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Provide scope parameters..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
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
                  Save Proposed Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
