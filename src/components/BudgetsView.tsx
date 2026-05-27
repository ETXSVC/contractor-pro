import React, { useState } from "react";
import { BudgetCostCode, Project } from "../types";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface BudgetsProps {
  costCodes: BudgetCostCode[];
  projects: Project[];
}

export const BudgetsView: React.FC<BudgetsProps> = ({ costCodes }) => {
  const [selectedCode, setSelectedCode] = useState<BudgetCostCode | null>(costCodes[2] || null);

  // Compute aggregate stats
  const totalBudgeted = costCodes.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActual = costCodes.reduce((sum, c) => sum + c.actual, 0);
  const totalCommitted = costCodes.reduce((sum, c) => sum + c.committed, 0);
  const overspentCodes = costCodes.filter(c => c.actual > c.budgeted).length;

  return (
    <div id="cost-codes-contracts-root" className="space-y-6">
      
      {/* Overview Tally Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl relative overflow-hidden">
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Total SOW Authorized Budget</span>
          <div className="text-2xl font-bold font-display text-white mt-1">${totalBudgeted.toLocaleString()}</div>
          <p className="text-[10px] text-slate-455 mt-1">CSI division allocations</p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-450 font-mono tracking-wider uppercase block">Spent to Date (Actuals)</span>
          <div className="text-2xl font-bold font-display text-cyan-405 mt-1">${totalActual.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-450 mt-1">
            {Math.round((totalActual / (totalBudgeted || 1)) * 100)}% budget burn rate
          </p>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-450 font-mono tracking-wider uppercase block">Committed Subcontracts</span>
          <div className="text-2xl font-bold font-display text-white mt-1">${totalCommitted.toLocaleString()}</div>
          <p className="text-[10px] text-slate-450 mt-1">Legall obligations bound</p>
        </div>

        <div className="p-4 bg-rose-950/15 border border-rose-500/10 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-rose-400 font-mono uppercase block font-bold">Overspent Code Divisions</span>
            <div className="text-xl font-bold font-display text-rose-455 mt-1">{overspentCodes} CSI Nodes</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-rose-450/40" />
        </div>
      </div>

      {/* Main Budget layout Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Table: 7 columns */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl flex justify-between items-center">
            <h2 className="text-sm font-bold font-display text-white">Project Cost Code Ledger (CSI Standard)</h2>
            <span className="text-xs text-slate-450 font-mono">Select a row to inspect cost audit logs</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">CSI Code</th>
                  <th className="p-3">Division Name</th>
                  <th className="p-3">Scope group</th>
                  <th className="p-3 text-right">Budgeted Limit</th>
                  <th className="p-3 text-right">Actual Cost</th>
                  <th className="p-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-350 font-mono">
                {costCodes.map((cc) => {
                  const variance = cc.budgeted - cc.actual;
                  const isNegative = variance < 0;
                  return (
                    <tr 
                      key={cc.code} 
                      onClick={() => setSelectedCode(cc)}
                      className={`hover:bg-slate-850/40 cursor-pointer transition ${
                        selectedCode?.code === cc.code ? "bg-cyan-500/5 border-l-2 border-cyan-505" : ""
                      }`}
                    >
                      <td className="p-3 font-semibold text-white">{cc.code}</td>
                      <td className="p-3 font-sans font-medium text-slate-300 truncate max-w-[150px]">{cc.description}</td>
                      <td className="p-3 text-slate-400 font-sans">{cc.category}</td>
                      <td className="p-3 text-right text-slate-400">${cc.budgeted.toLocaleString()}</td>
                      <td className="p-3 text-right text-white font-bold">${cc.actual.toLocaleString()}</td>
                      <td className={`p-3 text-right font-bold ${isNegative ? "text-rose-455" : "text-emerald-450"}`}>
                        {isNegative ? "-" : ""}${Math.abs(variance).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Cost Code Inspector Detail Panel: 4 columns */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
            <h2 className="text-sm font-bold font-display text-white">Division Inspector</h2>
          </div>

          {selectedCode ? (
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-5 text-xs">
              <div className="space-y-1.5 pb-3 border-b border-slate-800">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                  CSI {selectedCode.code}
                </span>
                <h3 className="text-sm font-bold text-white font-display pt-1">{selectedCode.description}</h3>
                <p className="text-[11px] text-slate-400">Classified: <strong>{selectedCode.category}</strong> program code.</p>
              </div>

              {/* Calculations metrics lists */}
              <div className="space-y-3.5 font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Total Authorized Budget</span>
                  <span className="text-white font-bold">${selectedCode.budgeted.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Actual Spent to Date</span>
                  <span className="text-white font-bold text-cyan-405">${selectedCode.actual.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Committed Subcontracts</span>
                  <span className="text-white font-bold">${selectedCode.committed.toLocaleString()}</span>
                </div>

                {/* Progress bar ratio */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-450 mb-1 font-mono uppercase">
                    <span>Ledger utilization ratio</span>
                    <span>{Math.round((selectedCode.actual / selectedCode.budgeted) * 100)}% Used</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        selectedCode.actual > selectedCode.budgeted ? "bg-rose-500" : "bg-cyan-500"
                      }`} 
                      style={{ width: `${Math.min(100, (selectedCode.actual / selectedCode.budgeted) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-450 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal font-sans">
                  Cost code is certified and logged correctly. Subcontractor time allocations match physical geospatial markers.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 p-8 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              Select any budget row to inspect division audit records.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
