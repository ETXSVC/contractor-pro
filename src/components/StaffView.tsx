import React, { useState } from "react";
import { TeamMember } from "../types";
import { 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Search, 
  X,
  MessageSquare
} from "lucide-react";

interface StaffProps {
  team: TeamMember[];
  onAddMember: (member: TeamMember) => void;
}

type StaffTab = "All Staff" | "Management" | "Electricians" | "Plumbing" | "Carpentry";

export const StaffView: React.FC<StaffProps> = ({
  team,
  onAddMember
}) => {
  const [activeTab, setActiveTab] = useState<StaffTab>("All Staff");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState<TeamMember["department"]>("Carpentry");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newProject, setNewProject] = useState("");

  const filtered = team.filter((m) => {
    const matchTab = activeTab === "All Staff" || m.department === activeTab;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAddNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;

    const avatarsArray = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
    ];
    const itemAvatar = avatarsArray[Math.floor(Math.random() * avatarsArray.length)];

    const created: TeamMember = {
      id: "team_" + Date.now(),
      name: newName,
      role: newRole,
      avatar: itemAvatar,
      activeProjects: newProject ? [newProject] : ["Standby HQ"],
      status: "Online",
      department: newDept,
      phone: newPhone || "555-9000",
      email: newEmail || `${newName.toLowerCase().replace(" ", ".")}@contractorpro.co`
    };

    onAddMember(created);
    setShowAddModal(false);

    // Reset
    setNewName("");
    setNewRole("");
    setNewPhone("");
    setNewEmail("");
    setNewProject("");
  };

  return (
    <div id="crew-staff-root" className="space-y-6">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Personnel & Subcontractors</h1>
          <p className="text-xs text-slate-400">Track active trade certifications, physical coordinates, cell numbers, and daily timesheets.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Crew Member
        </button>
      </div>

      {/* Control filters bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        
        {/* Trade tags */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800/80 rounded-lg w-full sm:w-auto overflow-x-auto">
          {(["All Staff", "Management", "Electricians", "Plumbing", "Carpentry"] as StaffTab[]).map((tab) => (
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
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search team or certificates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Staff Bento Cards directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-slate-900/65 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/85 transition flex flex-col justify-between space-y-4"
          >
            {/* Top row alignment with active status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{member.name}</h3>
                  <span className="text-[11px] text-slate-450 font-medium block">{member.role}</span>
                </div>
              </div>

              {/* Status bullet */}
              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                member.status === "Online"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : member.status === "In Meeting"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-slate-800 text-slate-405"
              }`}>
                {member.status}
              </span>
            </div>

            {/* Middle part: active builds tags */}
            <div className="space-y-2 border-t border-b border-slate-850/60 py-3 text-xs">
              <div className="flex items-center justify-between text-slate-455 text-[11px]">
                <span className="font-mono">BUILD ASSIGNMENT</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-405 font-medium leading-none">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{member.activeProjects.join(", ") || "HQ On Standby"}</span>
              </div>
            </div>

            {/* Bottom: Contact handles */}
            <div className="space-y-2 text-[11px] font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full border border-dashed border-slate-800 rounded-xl py-12 text-center text-slate-500 text-xs">
            No active trades crew found matching search query parameters.
          </div>
        )}
      </div>

      {/* Dynamic Add member modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Add Subcontractor / Trade Personnel</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMember} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Crew Member Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Neeson"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Specific Trade Role *</label>
                  <input
                    type="text"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Lead Finish Carpenter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Trade Program Division</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Management">Management</option>
                    <option value="Electricians">Electricians</option>
                    <option value="Plumbing">Plumbing / MEP</option>
                    <option value="Carpentry">Carpentry / Framing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Cell Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="555-0100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Secure PM email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@contractorpro.co"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Assign Site Location</label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="e.g. Davis Bathroom Renovation"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
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
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
