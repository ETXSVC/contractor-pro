import React, { useState } from "react";
import { Document } from "../types";
import { 
  Folder, 
  Search, 
  Upload, 
  Download, 
  Share2, 
  Trash2, 
  FileText, 
  Plus,
  Eye,
  Settings,
  X
} from "lucide-react";

interface DocumentProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentView: React.FC<DocumentProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form upload fields
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Document["category"]>("Blueprints");
  const [newSize, setNewSize] = useState("2.4 MB");

  const folders: { id: string; name: string; count: number; color: string }[] = [
    { id: "All", name: "All Vault", count: documents.length, color: "text-slate-400 bg-slate-900" },
    { id: "Blueprints", name: "Blueprints / CAD", count: documents.filter(d => d.category === "Blueprints").length, color: "text-cyan-400 bg-cyan-950/40" },
    { id: "Permits", name: "Building Permits", count: documents.filter(d => d.category === "Permits").length, color: "text-amber-400 bg-amber-950/40" },
    { id: "Field Reports", name: "Field Logs", count: documents.filter(d => d.category === "Field Reports").length, color: "text-teal-400 bg-teal-950/40" },
    { id: "Contracts", name: "Signed Agreements", count: documents.filter(d => d.category === "Contracts").length, color: "text-indigo-400 bg-indigo-950/40" }
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchFolder = selectedFolder === "All" || doc.category === selectedFolder;
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: Document = {
      id: "doc_" + Date.now(),
      name: newTitle.endsWith(".pdf") || newTitle.endsWith(".xml") || newTitle.endsWith(".docx") ? newTitle : `${newTitle}.pdf`,
      category: newCategory,
      uploadedBy: "Alex (General Contractor)",
      uploadedAt: "Today, Just Now",
      size: newSize || "1.2 MB",
      fileType: newCategory === "Blueprints" ? "Architectural Plan PDF" : newCategory === "Permits" ? "Regulatory PDF" : "Office Document"
    };

    onAddDocument(created);
    setShowUploadModal(false);
    setNewTitle("");
  };

  return (
    <div id="document-vault-view" className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Drawing & Document Vault</h1>
          <p className="text-xs text-slate-400">Secure regulatory permit registry, signed agreements, and AutoCAD markup revisions.</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition shadow-md cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Grid of Folder Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {folders.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFolder(f.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between h-28 ${
              selectedFolder === f.id
                ? "bg-slate-900 border-cyan-500/40 text-cyan-400 glow-cyan"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <Folder className={`w-6 h-6 ${selectedFolder === f.id ? "text-cyan-400" : "text-slate-450"}`} />
            <div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{f.name}</h4>
              <span className="text-[10px] font-mono text-slate-450">{f.count} items stored</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <span className="text-xs font-bold font-mono text-slate-350">
          Showing {filteredDocs.length} of {documents.length} digital files
        </span>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-450" />
          <input
            type="text"
            placeholder="Search specific file names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Roster Table of Documents */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">File Title</th>
              <th className="p-3">Vault folder</th>
              <th className="p-3">Uploaded By</th>
              <th className="p-3">Revision Date</th>
              <th className="p-3">Memory Size</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-350">
            {filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-850/40 transition">
                <td className="p-3 font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-450 flex-shrink-0" />
                  <span>{doc.name}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                    doc.category === "Blueprints" 
                      ? "bg-cyan-500/10 text-cyan-400" 
                      : doc.category === "Permits"
                      ? "bg-amber-500/10 text-amber-500"
                      : doc.category === "Field Reports"
                      ? "bg-teal-500/10 text-teal-400"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}>
                    {doc.category}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{doc.uploadedBy}</td>
                <td className="p-3 font-mono text-slate-400">{doc.uploadedAt}</td>
                <td className="p-3 font-mono">{doc.size}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => alert(`Reviewing Blueprint Sheet Content: ${doc.name}`)}
                      title="Inspect PDF File" 
                      className="p-1 px-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button 
                      onClick={() => alert(`Initiating secure local network download for ${doc.name}`)}
                      title="Download Sheet" 
                      className="p-1 px-1.5 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button 
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Archive File"
                      className="p-1 px-1.5 rounded hover:bg-slate-800/80 hover:text-rose-450 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-slate-450 hover:text-rose-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-450 font-mono">
                  No blueprints, field sheets, or agreements listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Interactive Modal: SOW File upload mock */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Upload Blueprint Sheet or Permit</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-slate-450 font-mono mb-1">Document File Name *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Foundation Layout Draft E.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-450 font-mono mb-1">Vault Folder Type</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Blueprints">Blueprints / CAD</option>
                    <option value="Permits">Building Permits</option>
                    <option value="Field Reports">Field Logs</option>
                    <option value="Contracts">Signed Agreements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 font-mono mb-1">Estimated File Weight</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g. 5.8 MB"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Drag drop zone placeholder */}
              <div className="border border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950 rounded-xl p-6 text-center transition">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <span className="text-xs text-slate-400 block font-semibold">Drag & Drop drawings here</span>
                <span className="text-[10px] text-slate-500 block mt-1">Accepts PDF, DWG, BIMx, DOCX up to 50MB</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-800 text-slate-350 hover:bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-bold font-mono text-slate-950 rounded cursor-pointer"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
