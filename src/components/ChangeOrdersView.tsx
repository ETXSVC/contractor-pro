import React from "react";
import { ChangeOrder, Project } from "../types";
import { ClipboardList, CheckCircle, XCircle, Clock } from "lucide-react";

interface ChangeOrdersProps {
  changeOrders: ChangeOrder[];
  projects: Project[];
  onApproveChangeOrder: (id: string) => void;
  onDeclineChangeOrder: (id: string) => void;
}

export const ChangeOrdersView: React.FC<ChangeOrdersProps> = ({
  changeOrders,
  onApproveChangeOrder,
  onDeclineChangeOrder,
}) => {
  const pending = changeOrders.filter(co => co.status === "Pending");
  const approved = changeOrders.filter(co => co.status === "Approved");
  const declined = changeOrders.filter(co => co.status === "Declined");
  const totalRequested = changeOrders.reduce((sum, co) => sum + co.amount, 0);
  const totalApproved = approved.reduce((sum, co) => sum + co.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Requested</span>
          <div className="text-2xl font-bold text-white mt-1">${totalRequested.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 mt-1">{changeOrders.length} orders total</p>
        </div>
        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
          <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Pending Review</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{pending.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">awaiting decision</p>
        </div>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Approved Value</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">${totalApproved.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 mt-1">{approved.length} approved</p>
        </div>
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
          <span className="text-[10px] text-rose-400 font-mono uppercase tracking-wider block">Declined</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{declined.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">orders rejected</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
        <ClipboardList className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-bold text-white">Owner Change Order Approval Desk</h2>
        {pending.length > 0 && (
          <span className="ml-auto px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Change order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {changeOrders.map((co) => (
          <div
            key={co.id}
            className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-white leading-tight truncate">{co.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">
                  Site: {co.projectName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Asked: {co.dateRequested}
                </span>
              </div>
              <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                co.status === "Approved"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : co.status === "Declined"
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-amber-400/10 text-amber-500 animate-pulse"
              }`}>
                {co.status === "Approved" && <CheckCircle className="w-2.5 h-2.5" />}
                {co.status === "Declined" && <XCircle className="w-2.5 h-2.5" />}
                {co.status === "Pending"  && <Clock className="w-2.5 h-2.5" />}
                {co.status}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-850/60 pt-3">
              <div>
                <span className="text-[10px] text-slate-450 uppercase block font-mono">Requested Draw Value</span>
                <span className="text-white font-bold text-sm">${co.amount.toLocaleString()}</span>
              </div>

              {co.status === "Pending" && (
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDeclineChangeOrder(co.id)}
                    className="px-2.5 py-1.5 border border-slate-700 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded transition text-xs font-bold"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveChangeOrder(co.id)}
                    className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 font-bold rounded transition text-xs"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
