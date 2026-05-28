import React, { useState, useRef } from "react";
import { Document } from "../types";
import { api } from "../lib/api";
import {
  Folder,
  Search,
  Upload,
  Download,
  Trash2,
  FileText,
  Eye,
  X,
  CheckCircle2,
  Loader2,
  Pencil
} from "lucide-react";

interface DocumentProps {
  documents: Document[];
  onAddDocument: (doc: Document) => void;
  onUpdateDocument: (docId: string, patch: Partial<Document>) => void;
  onDeleteDocument: (docId: string) => void;
}

const CATEGORIES: Document["category"][] = ["Blueprints", "Permits", "Field Reports", "Contracts"];

const categoryLabel: Record<string, string> = {
  Blueprints: "Blueprints / CAD",
  Permits: "Building Permits",
  "Field Reports": "Field Logs",
  Contracts: "Signed Agreements",
};

const categoryColor: Record<string, string> = {
  Blueprints:    "bg-cyan-500/10 text-cyan-400",
  Permits:       "bg-amber-500/10 text-amber-400",
  "Field Reports": "bg-teal-500/10 text-teal-400",
  Contracts:     "bg-indigo-500/10 text-indigo-400",
};

export const DocumentView: React.FC<DocumentProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Document["category"]>("Blueprints");
  const [newSize, setNewSize] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit modal
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<Document["category"]>("Blueprints");
  const [editUploadedBy, setEditUploadedBy] = useState("");
  const [editRevisionDate, setEditRevisionDate] = useState("");
  const [editFileType, setEditFileType] = useState("");
  const [saving, setSaving] = useState(false);

  const folders = [
    { id: "All",           name: "All Vault",         count: documents.length },
    { id: "Blueprints",    name: "Blueprints / CAD",  count: documents.filter(d => d.category === "Blueprints").length },
    { id: "Permits",       name: "Building Permits",  count: documents.filter(d => d.category === "Permits").length },
    { id: "Field Reports", name: "Field Logs",        count: documents.filter(d => d.category === "Field Reports").length },
    { id: "Contracts",     name: "Signed Agreements", count: documents.filter(d => d.category === "Contracts").length },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchFolder = selectedFolder === "All" || doc.category === selectedFolder;
    const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  // ── Upload helpers ────────────────────────────────────────────────────────

  const applyFile = (file: File) => {
    setDroppedFile(file);
    setNewTitle(file.name);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setNewSize(sizeMB === "0.0" ? "< 0.1 MB" : `${sizeMB} MB`);
    const n = file.name.toLowerCase();
    if (n.includes("permit") || n.includes("license") || n.includes("licence")) setNewCategory("Permits");
    else if (n.includes("contract") || n.includes("agreement") || n.includes("sign")) setNewCategory("Contracts");
    else if (n.includes("report") || n.includes("log") || n.includes("daily") || n.includes("field")) setNewCategory("Field Reports");
    else setNewCategory("Blueprints");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setNewTitle("");
    setNewSize("");
    setDroppedFile(null);
    setDragOver(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setUploading(true);
    try {
      let created: Document;
      if (droppedFile) {
        const fd = new FormData();
        fd.append("file", droppedFile);
        fd.append("name", newTitle);
        fd.append("category", newCategory);
        fd.append("uploadedBy", "You");
        fd.append("fileType", newCategory === "Blueprints" ? "Architectural Plan" : newCategory === "Permits" ? "Regulatory PDF" : "Document");
        created = await api.documents.upload(fd);
      } else {
        created = {
          id: "doc_" + Date.now(),
          name: newTitle.includes(".") ? newTitle : `${newTitle}.pdf`,
          category: newCategory,
          uploadedBy: "You",
          uploadedAt: "Today, Just Now",
          size: newSize || "—",
          fileType: newCategory === "Blueprints" ? "Architectural Plan" : newCategory === "Permits" ? "Regulatory PDF" : "Document",
        };
        created = await api.documents.create(created);
      }
      onAddDocument(created);
      closeUploadModal();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Edit helpers ──────────────────────────────────────────────────────────

  const openEdit = (doc: Document) => {
    setEditDoc(doc);
    setEditName(doc.name);
    setEditCategory(doc.category);
    setEditUploadedBy(doc.uploadedBy);
    setEditRevisionDate(doc.uploadedAt);
    setEditFileType(doc.fileType);
  };

  const closeEdit = () => {
    setEditDoc(null);
    setSaving(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    setSaving(true);
    const patch: Partial<Document> = {
      name: editName.trim() || editDoc.name,
      category: editCategory,
      uploadedBy: editUploadedBy.trim() || editDoc.uploadedBy,
      uploadedAt: editRevisionDate.trim() || editDoc.uploadedAt,
      fileType: editFileType.trim() || editDoc.fileType,
    };
    onUpdateDocument(editDoc.id, patch);
    closeEdit();
  };

  // ── View / Download ───────────────────────────────────────────────────────

  const handleView = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
    } else {
      alert(`No file attached to "${doc.name}".\nUpload a file to enable viewing.`);
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      const a = document.createElement("a");
      a.href = doc.fileUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`No file attached to "${doc.name}".\nUpload a file to enable downloading.`);
    }
  };

  return (
    <div id="document-vault-view" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Drawing & Document Vault</h1>
          <p className="text-xs text-slate-400">Secure regulatory permit registry, signed agreements, and AutoCAD markup revisions.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 text-xs font-bold font-mono rounded-lg transition shadow-md cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Folder cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {folders.map(f => (
          <div
            key={f.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedFolder(f.id)}
            onKeyDown={e => e.key === "Enter" && setSelectedFolder(f.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between h-28 ${
              selectedFolder === f.id
                ? "bg-slate-900 border-cyan-500/40 text-cyan-400"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <Folder className={`w-6 h-6 ${selectedFolder === f.id ? "text-cyan-400" : "text-slate-500"}`} />
            <div>
              <h4 className="text-xs font-bold text-white line-clamp-1">{f.name}</h4>
              <span className="text-[10px] font-mono text-slate-500">{f.count} items stored</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
        <span className="text-xs font-bold font-mono text-slate-400">
          Showing {filteredDocs.length} of {documents.length} digital files
        </span>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search specific file names..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
          />
        </div>
      </div>

      {/* Documents table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">File Title</th>
              <th className="p-3">Vault Folder</th>
              <th className="p-3">Uploaded By</th>
              <th className="p-3">Revision Date</th>
              <th className="p-3">Size</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-400">
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-800/20 transition">
                <td className="p-3 font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{doc.name}</span>
                    {!doc.fileUrl && (
                      <span className="text-[9px] text-slate-600 font-mono px-1.5 py-0.5 border border-slate-700 rounded">metadata only</span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${categoryColor[doc.category] ?? "bg-slate-500/10 text-slate-400"}`}>
                    {doc.category}
                  </span>
                </td>
                <td className="p-3 text-slate-400">{doc.uploadedBy}</td>
                <td className="p-3 font-mono text-slate-400">{doc.uploadedAt}</td>
                <td className="p-3 font-mono">{doc.size}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="View file"
                      onClick={() => handleView(doc)}
                      disabled={!doc.fileUrl}
                      className="p-1.5 rounded hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      title="Download file"
                      onClick={() => handleDownload(doc)}
                      disabled={!doc.fileUrl}
                      className="p-1.5 rounded hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 text-slate-400 hover:text-cyan-400" />
                    </button>
                    <button
                      type="button"
                      title="Edit document metadata"
                      onClick={() => openEdit(doc)}
                      className="p-1.5 rounded hover:bg-slate-800 transition"
                    >
                      <Pencil className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                    </button>
                    <button
                      type="button"
                      title="Delete document"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                  No blueprints, field sheets, or agreements listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Upload modal ───────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-display">Upload Blueprint Sheet or Permit</h3>
              <button type="button" title="Close" onClick={closeUploadModal} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Document File Name *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Foundation Layout Draft E.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Vault Folder Type</label>
                  <select
                    title="Vault folder type"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as Document["category"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">File Size</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    placeholder="auto-detected on drop"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl p-6 text-center transition cursor-pointer select-none ${
                  dragOver    ? "border-cyan-500 bg-cyan-500/5" :
                  droppedFile ? "border-emerald-500/50 bg-emerald-500/5" :
                                "border-slate-700 hover:border-cyan-500/40 bg-slate-950"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  title="Upload document"
                  accept=".pdf,.dwg,.docx,.bimx,.png,.jpg,.jpeg,.xlsx,.dxf"
                  className="hidden"
                  onChange={handleFileInput}
                />
                {droppedFile ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-xs text-emerald-400 block font-semibold truncate px-4">{droppedFile.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{newSize} · Click to swap file</span>
                  </>
                ) : (
                  <>
                    <Upload className={`w-8 h-8 mx-auto mb-2 transition ${dragOver ? "text-cyan-400 scale-110" : "text-slate-500"}`} />
                    <span className={`text-xs block font-semibold ${dragOver ? "text-cyan-400" : "text-slate-400"}`}>
                      {dragOver ? "Drop to attach" : "Drag & Drop drawings here"}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">or click to browse · PDF, DWG, BIMx, DOCX up to 50MB</span>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={closeUploadModal} className="px-4 py-2 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 font-bold font-mono text-slate-950 rounded cursor-pointer transition disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {uploading ? "Uploading…" : "Upload & Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit metadata modal ────────────────────────────────────────────── */}
      {editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-display">Edit Document Metadata</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">{editDoc.name}</p>
              </div>
              <button type="button" title="Close" onClick={closeEdit} className="p-1 text-slate-400 hover:text-white rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-mono mb-1">File Title</label>
                <input
                  type="text"
                  title="File title"
                  placeholder="Document file title"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Vault Folder</label>
                  <select
                    title="Vault folder"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as Document["category"])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">File Type</label>
                  <input
                    type="text"
                    value={editFileType}
                    onChange={e => setEditFileType(e.target.value)}
                    placeholder="e.g. Architectural Plan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Uploaded By</label>
                  <input
                    type="text"
                    title="Uploaded by"
                    placeholder="e.g. John Smith"
                    value={editUploadedBy}
                    onChange={e => setEditUploadedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-mono mb-1">Revision Date</label>
                  <input
                    type="text"
                    value={editRevisionDate}
                    onChange={e => setEditRevisionDate(e.target.value)}
                    placeholder="e.g. Jun 12, 2026"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {editDoc.fileUrl && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <FileText className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <span className="text-slate-400 truncate">{editDoc.fileUrl}</span>
                  <span className="text-[9px] text-emerald-400 font-mono ml-auto">file attached</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={closeEdit} className="px-4 py-2 border border-slate-800 text-slate-400 hover:bg-slate-800 rounded transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold font-mono text-slate-950 rounded cursor-pointer transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
