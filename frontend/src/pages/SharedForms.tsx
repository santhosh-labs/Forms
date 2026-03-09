import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import {
    FileText, LayoutGrid, Search, Eye, BarChart2,
    Building2, UserCircle2, List, Filter, ChevronDown,
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type TypeFilter = 'all' | 'standard' | 'card';

export default function SharedForms() {
    // Vite force reload trigger
    const allForms = useFormStore(state => state.forms);
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const allFolders = useFormStore(state => state.folders);

    const sharedForms = useMemo(() => {
        // Collect names of folders shared with the user
        const sharedFolderNames = [
            'HR Onboarding', 'Marketing Campaigns', // from DEMO_SHARED
            ...allFolders.filter(f => f.sharedBy).map(f => f.name)
        ];

        return allForms.filter(f => !f.isDeleted).filter(f => {
            // Include if the form belongs to a shared folder
            const isShared = f.folder && sharedFolderNames.includes(f.folder);

            const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
            const matchType = typeFilter === 'all' || f.type === typeFilter;
            return isShared && matchSearch && matchType;
        });
    }, [allForms, allFolders, search, typeFilter]);

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-6xl mx-auto animate-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">Shared Forms</h1>
                        <p className="text-sm text-muted-foreground mt-1">Forms explicitly shared with you or within shared folders</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View toggle */}
                        <div className="flex items-center bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                            >
                                <List size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search shared forms…"
                            className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Type filter */}
                    <div className="relative">
                        <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value as TypeFilter)}
                            className="appearance-none pl-8 pr-7 py-2 border border-border rounded-lg text-sm bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                        >
                            <option value="all">All Types</option>
                            <option value="standard">Standard</option>
                            <option value="card">Card</option>
                        </select>
                        <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>

                    <span className="text-sm text-muted-foreground">{sharedForms.length} form{sharedForms.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Empty state */}
                {sharedForms.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center justify-center py-24">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/20">
                            <Building2 size={28} className="text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-1">No shared forms found</h2>
                        <p className="text-sm text-muted-foreground">Forms shared with you will appear here.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {sharedForms.map(form => (
                            <div
                                key={form.id}
                                className="bg-card rounded-xl border border-border hover:shadow-md transition-all p-4 group relative"
                            >
                                {/* Disabled badge */}
                                {form.isDisabled && (
                                    <span className="absolute top-2 left-2 text-[10px] font-black bg-destructive/15 text-destructive border border-destructive/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
                                        Disabled
                                    </span>
                                )}
                                {/* Type badge */}
                                <span className={`absolute top-2 right-2 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${form.type === 'card'
                                    ? 'bg-violet-500/15 text-violet-600 border-violet-500/20'
                                    : 'bg-primary/15 text-primary border-primary/20'
                                    }`}>
                                    {form.type === 'card' ? 'Card' : 'Standard'}
                                </span>

                                <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br ${form.type === 'card' ? 'from-violet-500 to-purple-600' : 'from-blue-500 to-indigo-600'
                                    }`}>
                                    {form.type === 'card'
                                        ? <LayoutGrid size={20} className="text-white" />
                                        : <FileText size={20} className="text-white" />
                                    }
                                </div>

                                <h3 className="font-semibold text-foreground text-sm truncate mb-1">{form.name}</h3>

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                                    <UserCircle2 size={12} />
                                    <span className="truncate">{form.owner || 'You'}</span>
                                </div>

                                <p className="text-xs text-muted-foreground mb-4">
                                    <span className="font-bold text-foreground">{form.submissions}</span> submissions
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/submissions/${form.id}`)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                    >
                                        <BarChart2 size={13} /> Submissions
                                    </button>
                                    <button
                                        onClick={() => navigate(`/form/${form.id}`)}
                                        className="btn-primary flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg"
                                    >
                                        <Eye size={13} /> View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List */
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-background text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                            <span>Form Name</span><span>Type</span><span>Owner</span><span>Submissions</span><span>Actions</span>
                        </div>
                        <div className="divide-y divide-border/30">
                            {sharedForms.map(form => (
                                <div
                                    key={form.id}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${form.type === 'card' ? 'from-violet-500 to-purple-600' : 'from-blue-500 to-indigo-600'
                                            }`}>
                                            {form.type === 'card' ? <LayoutGrid size={15} className="text-white" /> : <FileText size={15} className="text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-foreground truncate">{form.name}</span>
                                        {form.isDisabled && (
                                            <span className="text-[10px] bg-destructive/15 text-destructive border border-destructive/20 px-1.5 py-0.5 rounded-full shrink-0 font-black uppercase tracking-widest">Disabled</span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest w-fit border ${form.type === 'card'
                                        ? 'bg-violet-500/15 text-violet-600 border-violet-500/20'
                                        : 'bg-primary/15 text-primary border-primary/20'
                                        }`}>
                                        {form.type === 'card' ? 'Card' : 'Standard'}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <UserCircle2 size={13} className="text-muted-foreground" />
                                        <span className="truncate">{form.owner || 'You'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{form.submissions}</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => navigate(`/submissions/${form.id}`)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Submissions"
                                        >
                                            <BarChart2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/form/${form.id}`)}
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Preview"
                                        >
                                            <Eye size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
