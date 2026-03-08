import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import { FolderItem } from '../types';
import {
    FolderOpen, Folder, FileText, Search, Users,
    LayoutGrid, List, UserCircle2,
} from 'lucide-react';

function hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
}

/* ─── Folder Detail ─────────────────────────────────────────── */
function SharedFolderDetail({ folder, forms, onBack }: {
    folder: FolderItem;
    forms: { id: string; name: string; submissions: number }[];
    onBack: () => void;
}) {
    const navigate = useNavigate();
    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 mb-5 font-medium">
                ← Shared Folders
            </button>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                    <FolderOpen size={22} style={{ color: folder.color }} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{folder.name}</h2>
                    <p className="text-sm text-gray-400">Shared by {folder.sharedBy}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-6">{forms.length} form{forms.length !== 1 ? 's' : ''}</p>

            {forms.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                    <FileText size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">No forms in this shared folder.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {forms.map(form => (
                        <div key={form.id}
                            onClick={() => navigate(`/builder/${form.id}`)}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                                style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                <FileText size={18} style={{ color: folder.color }} />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{form.name}</h3>
                            <p className="text-xs text-gray-400">{form.submissions} submissions</p>
                            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1"><Users size={10} /> View only</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Demo shared folders (simulated) ───────────────────────── */
const DEMO_SHARED: FolderItem[] = [
    {
        id: 'shared-demo-1',
        name: 'HR Onboarding',
        color: '#8b5cf6',
        createdAt: '2024-01-10',
        isShared: true,
        sharedWith: [],
        sharedBy: 'manager@company.com',
    },
    {
        id: 'shared-demo-2',
        name: 'Marketing Campaigns',
        color: '#f59e0b',
        createdAt: '2024-01-15',
        isShared: true,
        sharedWith: [],
        sharedBy: 'marketing@company.com',
    },
];

/* ─── Main Page ─────────────────────────────────────────────── */
export default function SharedFolders() {
    const allFolders = useFormStore(state => state.folders);
    const allForms = useFormStore(state => state.forms);

    const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Collect folders that were explicitly shared to someone (from our own store)
    // plus the demo shared folders
    const sharedToMeFolders = useMemo<FolderItem[]>(() => [
        ...DEMO_SHARED,
        ...allFolders.filter(f => f.sharedBy),
    ], [allFolders]);

    const filtered = useMemo(() =>
        sharedToMeFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())),
        [sharedToMeFolders, search]
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
                    <SharedFolderDetail folder={openFolder} forms={formsInFolder} onBack={() => setOpenFolder(null)} />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Shared Folders</h1>
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
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                    <Users size={18} className="shrink-0 mt-0.5 text-blue-500" />
                    <p>These are folders shared with you by other team members. You can view and access forms inside them.</p>
                </div>

                {/* Search */}
                {filtered.length > 0 && (
                    <div className="relative mb-5 max-w-xs">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shared folders..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>
                )}

                {/* Empty state */}
                {sharedToMeFolders.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24">
                        <div className="relative mb-6">
                            <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
                                <rect x="4" y="20" width="80" height="48" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
                                <path d="M4 28h80" stroke="#e2e8f0" strokeWidth="1.5" />
                                <rect x="4" y="16" width="32" height="12" rx="4" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
                                {/* People icon in folder */}
                                <circle cx="44" cy="50" r="10" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
                                <circle cx="41" cy="48" r="3" fill="#bfdbfe" />
                                <circle cx="47" cy="48" r="3" fill="#bfdbfe" />
                                <path d="M36 54c0-3 5-4 8-4s8 1 8 4" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="10" cy="12" r="2" fill="#cbd5e1" />
                                <circle cx="78" cy="10" r="1.5" fill="#cbd5e1" />
                            </svg>
                        </div>
                        <p className="text-gray-500 mb-2">No folders have been shared with you.</p>
                        <p className="text-xs text-gray-300">When someone shares a folder, it will appear here.</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 text-sm">No shared folders match your search.</div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(folder => {
                            const formCount = allForms.filter(f => f.folder === folder.name && !f.isDeleted).length;
                            return (
                                <div key={folder.id} onClick={() => setOpenFolder(folder)}
                                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                            <Folder size={24} style={{ color: folder.color }} />
                                        </div>
                                        <span className="flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                            <Users size={9} /> Shared
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 truncate mb-1">{folder.name}</h3>
                                    <p className="text-xs text-gray-400">{formCount} form{formCount !== 1 ? 's' : ''}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                                            <UserCircle2 size={12} className="text-gray-500" />
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{folder.sharedBy}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                            <span>Name</span><span>Forms</span><span>Shared By</span><span>Created</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {filtered.map(folder => {
                                const formCount = allForms.filter(f => f.folder === folder.name && !f.isDeleted).length;
                                return (
                                    <div key={folder.id} onClick={() => setOpenFolder(folder)}
                                        className="grid grid-cols-[2fr_1fr_1.5fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-gray-50 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `rgba(${hexToRgb(folder.color)},0.15)` }}>
                                                <Folder size={16} style={{ color: folder.color }} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 truncate">{folder.name}</span>
                                        </div>
                                        <span className="text-sm text-gray-600">{formCount}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                                                <UserCircle2 size={13} className="text-gray-400" />
                                            </div>
                                            <span className="text-sm text-gray-500 truncate">{folder.sharedBy}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">{folder.createdAt}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
