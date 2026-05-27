import React, { useState } from "react";
import { Invoice } from "../types";
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Plus, 
  AlertTriangle,
  X 
} from "lucide-react";

interface InvoicesProps {
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesProps> = ({
  invoices,
  onAddInvoice
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formProjName, setFormProjName] = useState("");
  const [formAmt, setFormAmt] = useState("");
  const [formDue, setFormDue] = useState("2026-06-15");
  const [formStatus, setFormStatus] = useState<Invoice["status"]>("Sent");

  // Compute stats
  const totalOutstanding = invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + i.amount, 0);
  const totalCollected = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + i.amount, 0);

  const handleInvoiceCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProjName || !formAmt) return;

    const created: Invoice = {
      projectName: formProjName,
      amount: Number(formAmt),
      dueDate: formDue,
      status: formStatus
    };

    onAddInvoice(created);
    setShowAddModal(false);
    setFormProjName("");
    setFormAmt("");
  };

  return (
    <div id="financial-invoices-root" className="space-y-6">
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block">Total Outstanding AR</span>
          <div className="text-2xl font-bold font-display text-white mt-1">${totalOutstanding.toLocaleString()}</div>
          <p className="text-[10px] text-slate-450 mt-1">Pending client remittance checks</p>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-450 font-mono tracking-wider uppercase block text-rose-450">Critical Overdue</span>
          <div className="text-2xl font-bold font-display text-rose-450 mt-1">${totalOverdue.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 mt-1">Remittance grace period elapsed</p>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-450 font-mono tracking-wider uppercase block">Remitted Collected</span>
          <div className="text-2xl font-bold font-display text-emerald-400 mt-1">${totalCollected.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 mt-1">Directly cleared to bank accounts</p>
        </div>

        <div className="p-4 bg-cyan-950/20 border border-cyan-500/10 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-white font-display">Linked Corporate Accounts</h4>
            <p className="text-[10px] text-cyan-400 font-mono leading-none mt-1">Chase Corporate • active</p>
          </div>
        </div>
      </div>

      {/* Controller bar */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-xl">
        <div>
          <h2 className="text-sm font-bold font-display text-white">Accounts Receivable Clearing Desk</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Approve invoice payments or dispatch direct ACH clearing links.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> Issue Invoice
        </button>
      </div>

      {/* Main Grid: Ledger list and bank accounts info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Invoice log List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Reference / Build Site</th>
                  <th className="p-3">Billed Sum</th>
                  <th className="p-3 font-mono">Remittance Due</th>
                  <th className="p-3">Remittance State</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-350">
                {invoices.map((inv, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/30 transition">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-cyan-405 flex-shrink-0" />
                      <span>{inv.projectName}</span>
                    </td>
                    <td className="p-3 font-bold text-white font-mono">${inv.amount.toLocaleString()}</td>
                    <td className="p-3 font-mono text-slate-400">{inv.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold leading-none uppercase ${
                        inv.status === "Paid" 
                          ? "bg-emerald-500/10 text-emerald-450" 
                          : inv.status === "Overdue"
                          ? "bg-rose-500/10 text-rose-455 animate-pulse"
                          : inv.status === "Sent"
                          ? "bg-amber-400/10 text-amber-500"
                          : "bg-cyan-500/10 text-cyan-405"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => alert(`Direct Payment clearing request dispatched to associated project accounts.`)}
                        className="px-2.5 py-1 text-[10px] bg-slate-950 border border-slate-800 hover:border-slate-700/80 hover:text-white rounded text-slate-400 cursor-pointer text-xs"
                      >
                        Resend ACH
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Bank accounts & forecasts */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-4 text-xs">
            <h3 className="font-bold text-white leading-none">Linked Clearing Gateways</h3>
            <p className="text-slate-450 leading-relaxed">
              Verify corporate bank settlements and continuous card allocation ledgers. Sourcing direct Stripe & Chase clearing portals.
            </p>

            <div className="space-y-3 font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-white block">Chase Corporate Premium</span>
                  <span className="text-[9px] text-slate-500 font-sans block mt-1">Cleared balance settle overnight</span>
                </div>
                <span className="text-emerald-400 font-bold">$342,080.50</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-white block">Bank of America Checkings</span>
                  <span className="text-[9px] text-slate-500 font-sans block mt-1">Automatic payroll ledger linkage</span>
                </div>
                <span className="text-emerald-400 font-bold">$45,120.10</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/40 border border-cyan-500/10 rounded-lg flex items-start gap-2 text-slate-350">
              <AlertTriangle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px]">
                Overdue remittance checks trigger automatic daily cost code holds for associated subcontractors on the <strong>Riverside</strong> site.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive issue invoice modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Create Billing Invoice / Draw</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInvoiceCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Build Reference site name *</label>
                <input
                  type="text"
                  required
                  value={formProjName}
                  onChange={(e) => setFormProjName(e.target.value)}
                  placeholder="e.g. Miller Kitchen Remodeling"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Billing Drawn Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={formAmt}
                    onChange={(e) => setFormAmt(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono mb-1">Remittance Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Sent">Sent</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">Settlement Deadline Date</label>
                <input
                  type="date"
                  value={formDue}
                  onChange={(e) => setFormDue(e.target.value)}
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
                  Publish Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
