import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import { FolderItem } from '../types';
import {
    Folder, FolderOpen, Plus, MoreVertical, Pencil, Trash2,
    Share2, X, FileText, Search, Check, Users, ShieldOff,
    LayoutGrid, List,
} from 'lucide-react';

/* ─── Helpers ──────────────────────────────────────────────── */
function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

/* ─── Create / Rename Modal ─────────────────────────────────── */
function FolderNameModal({ title, initial = '', onClose, onSave }: {
    title: string; initial?: string; onClose: () => void; onSave: (name: string) => void;
}) {
    const [name, setName] = useState(initial);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={16} className="text-gray-500" /></button>
                </div>
                <div className="px-6 py-5">
                    <label className="block text-sm font-semibold text-teal-600 mb-1">Folder Name</label>
                    <input autoFocus value={name} onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && name.trim() && (onSave(name.trim()), onClose())}
                        placeholder="e.g. Marketing Forms"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => { if (name.trim()) { onSave(name.trim()); onClose(); } }}
                        disabled={!name.trim()}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                        {initial ? 'Rename' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Share Folder Modal ────────────────────────────────────── */
function ShareFolderModal({ folder, onClose, onShare }: {
    folder: FolderItem; onClose: () => void; onShare: (emails: string[]) => void;
}) {
    const [input, setInput] = useState('');
    const [emails, setEmails] = useState<string[]>(folder.sharedWith);

    const addEmail = () => {
        const e = input.trim();
        if (e && /\S+@\S+\.\S+/.test(e) && !emails.includes(e)) {
            setEmails(prev => [...prev, e]);
            setInput('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Share Folder</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={16} /></button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                            <Folder size={18} style={{ color: folder.color }} />
                        </div>
                        <span className="font-semibold text-gray-900">{folder.name}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-teal-600 mb-1">Add people (email)</label>
                        <div className="flex gap-2">
                            <input value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addEmail()}
                                placeholder="user@company.com" type="email"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                            <button onClick={addEmail}
                                className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700">Add</button>
                        </div>
                    </div>

                    {emails.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Shared with</p>
                            {emails.map(e => (
                                <div key={e} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-bold text-blue-600">{e[0].toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm text-gray-800">{e}</span>
                                    </div>
                                    <button onClick={() => setEmails(prev => prev.filter(x => x !== e))}
                                        className="text-gray-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button onClick={() => { onShare(emails); onClose(); }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
                        Save Sharing
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Folder Detail View (forms inside a folder) ────────────── */
function FolderDetailView({ folder, forms, onBack, onUnassignForm }: {
    folder: FolderItem;
    forms: { id: string; name: string; submissions: number; type: string }[];
    onBack: () => void;
    onUnassignForm: (formId: string) => void;
}) {
    const navigate = useNavigate();
    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 mb-5 font-medium">
                ← All Folders
            </button>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                    <FolderOpen size={22} style={{ color: folder.color }} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{folder.name}</h2>
                    <p className="text-sm text-gray-400">{forms.length} form{forms.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {forms.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                    <FileText size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No forms in this folder yet.</p>
                    <p className="text-xs text-gray-300 mt-1">Move forms here from the dashboard via the card menu.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {forms.map(form => (
                        <div key={form.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                    <FileText size={18} style={{ color: folder.color }} />
                                </div>
                                <button onClick={() => onUnassignForm(form.id)}
                                    title="Remove from folder"
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                                    <X size={14} />
                                </button>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate" onClick={() => navigate(`/builder/${form.id}`)}>{form.name}</h3>
                            <p className="text-xs text-gray-400">{form.submissions} submissions</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Context Menu ───────────────────────────────────────────── */
function FolderMenu({ folder, onRename, onShare, onUnshare, onDelete }: {
    folder: FolderItem;
    onRename: () => void; onShare: () => void;
    onUnshare: () => void; onDelete: () => void;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={e => { e.stopPropagation(); setOpen(p => !p); }}
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical size={16} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-7 bg-white rounded-xl shadow-xl border border-gray-200 py-2 w-44 z-20">
                        <button onClick={() => { onRename(); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                            <Pencil size={14} className="text-gray-500" /> Rename
                        </button>
                        <button onClick={() => { onShare(); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                            <Share2 size={14} className="text-gray-500" /> Share
                        </button>
                        {folder.isShared && (
                            <button onClick={() => { onUnshare(); setOpen(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                                <ShieldOff size={14} className="text-gray-500" /> Stop Sharing
                            </button>
                        )}
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={() => { onDelete(); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function MyFolders() {
    const allForms = useFormStore(state => state.forms);
    const folders = useFormStore(state => state.folders);
    const addFolder = useFormStore(state => state.addFolder);
    const renameFolder = useFormStore(state => state.renameFolder);
    const deleteFolder = useFormStore(state => state.deleteFolder);
    const shareFolder = useFormStore(state => state.shareFolder);
    const unshareFolder = useFormStore(state => state.unshareFolder);
    const updateForm = useFormStore(state => state.updateForm);

    const [showCreate, setShowCreate] = useState(false);
    const [renaming, setRenaming] = useState<FolderItem | null>(null);
    const [sharing, setSharing] = useState<FolderItem | null>(null);
    const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const myFolders = folders.filter(f => !f.sharedBy);

    const filtered = useMemo(() =>
        myFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
        [myFolders, search]
    );

    const formsInFolder = useMemo(() =>
        openFolder
            ? allForms.filter(f => f.folder === openFolder.name && !f.isDeleted)
            : [],
        [allForms, openFolder]
    );

    if (openFolder) {
        return (
            <MainLayout onNewFormClick={() => { }}>
                <div className="max-w-6xl mx-auto">
                    <FolderDetailView
                        folder={openFolder}
                        forms={formsInFolder}
                        onBack={() => setOpenFolder(null)}
                        onUnassignForm={(formId) => updateForm(formId, { folder: undefined })}
                    />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Folders</h1>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                            <button onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <LayoutGrid size={15} />
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <List size={15} />
                            </button>
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                            <Plus size={16} /> New Folder
                        </button>
                    </div>
                </div>

                {/* Search */}
                {myFolders.length > 0 && (
                    <div className="relative mb-5 max-w-xs">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search folders..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                )}

                {/* Empty state */}
                {myFolders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24">
                        <div className="relative mb-6">
                            <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
                                <rect x="4" y="20" width="80" height="48" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                                <path d="M4 28h80" stroke="#e2e8f0" strokeWidth="1.5" />
                                <rect x="4" y="16" width="32" height="12" rx="4" fill="#e9fafb" stroke="#99f6e4" strokeWidth="1.5" />
                                <rect x="16" y="36" width="16" height="14" rx="3" fill="#e9fafb" stroke="#99f6e4" strokeWidth="1.5" />
                                <rect x="40" y="36" width="16" height="14" rx="3" fill="#e9fafb" stroke="#99f6e4" strokeWidth="1.5" />
                                <rect x="64" y="36" width="16" height="14" rx="3" fill="#e9fafb" stroke="#99f6e4" strokeWidth="1.5" />
                                {/* sparkles */}
                                <circle cx="10" cy="12" r="2" fill="#cbd5e1" />
                                <circle cx="78" cy="10" r="1.5" fill="#cbd5e1" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-6">You don't have any folders yet.</p>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors font-medium text-sm shadow-sm">
                            <Plus size={16} /> New Folder
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">No folders match your search.</div>
                ) : viewMode === 'grid' ? (
                    /* Grid view */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(folder => {
                            const formCount = allForms.filter(f => f.folder === folder.name && !f.isDeleted).length;
                            return (
                                <div key={folder.id}
                                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer relative"
                                    onClick={() => setOpenFolder(folder)}>
                                    {/* shared badge */}
                                    {folder.isShared && (
                                        <span className="absolute top-3 right-10 flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                            <Users size={9} /> Shared
                                        </span>
                                    )}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                            <Folder size={24} style={{ color: folder.color }} />
                                        </div>
                                        <div onClick={e => e.stopPropagation()}>
                                            <FolderMenu
                                                folder={folder}
                                                onRename={() => setRenaming(folder)}
                                                onShare={() => setSharing(folder)}
                                                onUnshare={() => unshareFolder(folder.id)}
                                                onDelete={() => deleteFolder(folder.id)}
                                            />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 truncate mb-1">{folder.name}</h3>
                                    <p className="text-xs text-gray-400">{formCount} form{formCount !== 1 ? 's' : ''}</p>
                                    <p className="text-xs text-gray-300 mt-0.5">{folder.createdAt}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* List view */
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                            <span>Name</span><span>Forms</span><span>Shared</span><span>Created</span><span></span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {filtered.map(folder => {
                                const formCount = allForms.filter(f => f.folder === folder.name && !f.isDeleted).length;
                                return (
                                    <div key={folder.id}
                                        className="group grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setOpenFolder(folder)}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                                <Folder size={16} style={{ color: folder.color }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate">{folder.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{formCount}</span>
                                        <span>
                                            {folder.isShared
                                                ? <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><Check size={10} /> Yes</span>
                                                : <span className="text-xs text-gray-400">—</span>
                                            }
                                        </span>
                                        <span className="text-sm text-gray-400">{folder.createdAt}</span>
                                        <div onClick={e => e.stopPropagation()}>
                                            <FolderMenu folder={folder} onRename={() => setRenaming(folder)} onShare={() => setSharing(folder)} onUnshare={() => unshareFolder(folder.id)} onDelete={() => deleteFolder(folder.id)} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreate && (
                <FolderNameModal title="New Folder" onClose={() => setShowCreate(false)} onSave={(name) => addFolder(name)} />
            )}
            {renaming && (
                <FolderNameModal title="Rename Folder" initial={renaming.name} onClose={() => setRenaming(null)}
                    onSave={(name) => renameFolder(renaming.id, name)} />
            )}
            {sharing && (
                <ShareFolderModal folder={sharing} onClose={() => setSharing(null)}
                    onShare={(emails) => shareFolder(sharing.id, emails)} />
            )}
        </MainLayout>
    );
}
