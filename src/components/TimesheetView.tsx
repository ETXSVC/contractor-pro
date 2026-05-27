import React, { useState } from "react";
import { TimeRecord, Project, TeamMember } from "../types";
import { 
  Clock, 
  Calendar, 
  Plus, 
  DollarSign, 
  Trash2, 
  Activity, 
  CheckCircle,
  X 
} from "lucide-react";

interface TimesheetProps {
  timeRecords: TimeRecord[];
  projects: Project[];
  team: TeamMember[];
  onAddRecord: (rec: TimeRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const TimesheetView: React.FC<TimesheetProps> = ({
  timeRecords,
  projects,
  team,
  onAddRecord,
  onDeleteRecord
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Log form states
  const [logProjId, setLogProjId] = useState(projects[0]?.id || "");
  const [logEmployeeId, setLogEmployeeId] = useState(team[0]?.id || "");
  const [logDate, setLogDate] = useState("2026-05-26");
  const [logHours, setLogHours] = useState("8");
  const [logDesc, setLogDesc] = useState("");
  const [logBillable, setLogBillable] = useState(true);

  // Compute stats
  const totalHours = timeRecords.reduce((sum, r) => sum + r.hours, 0);
  const totalBillableHrs = timeRecords.filter(r => r.billable).reduce((sum, r) => sum + r.hours, 0);
  const estimatedPayroll = timeRecords.reduce((sum, r) => sum + (r.hours * (r.billable ? 125 : 85)), 0);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logHours || !logDesc) return;

    const matchedProj = projects.find(p => p.id === logProjId);
    const matchedCrew = team.find(m => m.id === logEmployeeId);

    const created: TimeRecord = {
      id: "time_" + Date.now(),
      projectId: logProjId,
      projectName: matchedProj ? matchedProj.name : "HQ Office",
      employeeId: logEmployeeId,
      employeeName: matchedCrew ? matchedCrew.name : "Crew Tech",
      date: logDate,
      hours: Number(logHours),
      billable: logBillable,
      description: logDesc
    };

    onAddRecord(created);
    setShowLogModal(false);

    // Reset SOW
    setLogDesc("");
  };

  return (
    <div id="timecard-tracking-root" className="space-y-6">
      
      {/* Overview tally counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Total Clocked (Wk)</span>
            <div className="text-2xl font-bold font-display text-white mt-1">{totalHours} Hrs</div>
          </div>
          <Clock className="w-8 h-8 text-cyan-400/40" />
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Billable Allocation</span>
            <div className="text-2xl font-bold font-display text-emerald-400 mt-1">
              {Math.round((totalBillableHrs / (totalHours || 1)) * 100)}%
            </div>
          </div>
          <Activity className="w-8 h-8 text-emerald-400/40" />
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Run Billable Amount</span>
            <div className="text-2xl font-bold font-display text-cyan-400 mt-1">${estimatedPayroll.toLocaleString()}</div>
          </div>
          <DollarSign className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono uppercase block">Daily Cap Compliance</span>
            <div className="text-xs text-slate-300 font-medium mt-1">Ready for PDF submission</div>
          </div>
          <CheckCircle className="w-7 h-7 text-cyan-400" />
        </div>
      </div>

      {/* Controller bar */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-xl">
        <div>
          <h2 className="text-sm font-bold font-display text-white">Daily Labor Sheets Log</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved timesheets are pooled automatically to cost nodes.</p>
        </div>

        <button 
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Log SOW Hours
        </button>
      </div>

      {/* Log list table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">Operative Staff</th>
              <th className="p-3">Build Site Assignment</th>
              <th className="p-3 font-mono">Date logs</th>
              <th className="p-3 text-center">Hours</th>
              <th className="p-3">Billable status</th>
              <th className="p-3">Labor SOW Description</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-350">
            {timeRecords.map((r) => (
              <tr key={r.id} className="hover:bg-slate-850/30 transition">
                <td className="p-3 font-semibold text-white">{r.employeeName}</td>
                <td className="p-3">{r.projectName}</td>
                <td className="p-3 font-mono text-slate-400">{r.date}</td>
                <td className="p-3 text-center font-bold text-white font-mono">{r.hours} hr</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                    r.billable 
                      ? "bg-emerald-500/10 text-emerald-450" 
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {r.billable ? "Billable (125/hr)" : "Overhead (85/hr)"}
                  </span>
                </td>
                <td className="p-3 text-slate-400 font-sans line-clamp-1 max-w-[280px]">{r.description}</td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => onDeleteRecord(r.id)} 
                    className="p-1 px-2 text-slate-450 hover:text-rose-450 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800/60 cursor-pointer transition text-[11px]"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {timeRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-mono">
                  No logged labor hours found. Fill a timesheet above to synchronize labor expenses.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic SOW clock modal dialog */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Log SOW Active Hours</h3>
              <button onClick={() => setShowLogModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Operative Staff *</label>
                <select
                  value={logEmployeeId}
                  onChange={(e) => setLogEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Target Build Site *</label>
                <select
                  value={logProjId}
                  onChange={(e) => setLogProjId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Date Logged</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Hours Logged *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={logHours}
                    onChange={(e) => setLogHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Billable to Client budget</span>
                  <span className="text-[10px] text-slate-450 block font-mono">Billed at standard $125/hr rate line</span>
                </div>
                <input
                  type="checkbox"
                  checked={logBillable}
                  onChange={(e) => setLogBillable(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">SOW Labor description *</label>
                <textarea
                  rows={3}
                  required
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  placeholder="Describe active tasks completed..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-bold font-mono text-slate-950 rounded cursor-pointer"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
