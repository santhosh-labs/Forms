import { useState, useRef, useEffect, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import {
    X, Search, ChevronDown, LayoutGrid, Trash2,
    BarChart3, BarChart2, PieChart, Table2, TrendingUp,
    Calendar, ExternalLink, Plus,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
type ReportType = 'Summary' | 'Tabular' | 'Matrix' | 'Chart';

interface Report {
    id: string;
    name: string;
    formId: string;
    formName: string;
    type: ReportType;
    createdAt: string;
}

const REPORT_TYPES: { type: ReportType; icon: React.ReactNode; desc: string }[] = [
    { type: 'Summary', icon: <BarChart2 size={20} />, desc: 'Aggregate data with totals and averages' },
    { type: 'Tabular', icon: <Table2 size={20} />, desc: 'View all entries in a spreadsheet layout' },
    { type: 'Matrix', icon: <LayoutGrid size={20} />, desc: 'Cross-tabulate data by row and column' },
    { type: 'Chart', icon: <PieChart size={20} />, desc: 'Visualize data with bar, pie, or line charts' },
];

/* ─── Searchable Select ──────────────────────────────────────── */
interface SelectOption { value: string; label: string; isGroupHeader?: boolean; }

function SearchableSelect({ options, value, onChange, placeholder = 'Select', label }: {
    options: SelectOption[]; value: string; onChange: (v: string) => void;
    placeholder?: string; label?: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase();
        return options.filter(o => o.isGroupHeader || o.label.toLowerCase().includes(q));
    }, [options, query]);

    const selectedLabel = options.find(o => o.value === value && !o.isGroupHeader)?.label || placeholder;

    return (
        <div className="relative" ref={ref}>
            {label && <label className="block text-sm font-semibold text-primary mb-1">{label}</label>}
            <button
                type="button"
                onClick={() => { setOpen(p => !p); setQuery(''); }}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-border rounded-lg bg-background text-foreground hover:border-primary/40 transition-colors"
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{selectedLabel}</span>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in">
                    <div className="p-2 border-b border-border">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
                            <Search size={14} className="text-muted-foreground shrink-0" />
                            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                                placeholder="Search..." className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                        <button type="button" onClick={() => { onChange(''); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg mb-1 font-medium transition-colors">
                            {placeholder}
                        </button>
                        {filtered.map((opt, i) =>
                            opt.isGroupHeader ? (
                                <div key={i} className="px-3 pt-2 pb-1 text-xs font-black uppercase tracking-widest text-muted-foreground">{opt.label}</div>
                            ) : (
                                <button key={i} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 rounded-lg hover:bg-muted transition-colors ${value === opt.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}`}>
                                    {opt.label}
                                </button>
                            )
                        )}
                        {filtered.filter(o => !o.isGroupHeader).length === 0 && (
                            <div className="px-3 py-6 text-sm text-center text-muted-foreground">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── New Report Modal ───────────────────────────────────────── */
function NewReportModal({ onClose, onSave, formOptions }: {
    onClose: () => void;
    onSave: (r: Omit<Report, 'id' | 'createdAt'>) => void;
    formOptions: SelectOption[];
}) {
    const [formId, setFormId] = useState('');
    const [reportName, setReportName] = useState('');
    const [reportType, setReportType] = useState<ReportType>('Summary');

    const selectedForm = formOptions.find(o => o.value === formId && !o.isGroupHeader);

    const handleCreate = () => {
        if (!formId || !reportName) return;
        onSave({ name: reportName, formId, formName: selectedForm?.label || '', type: reportType });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-border animate-in">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">New Report</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <SearchableSelect label="Select Form" options={formOptions} value={formId} onChange={setFormId} placeholder="Select a form" />

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Report Name</label>
                        <input
                            value={reportName}
                            onChange={e => setReportName(e.target.value)}
                            placeholder="e.g. Monthly Summary"
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Report Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {REPORT_TYPES.map(({ type, icon, desc }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setReportType(type)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${reportType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted'
                                        }`}
                                >
                                    <span className={`mt-0.5 ${reportType === type ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</span>
                                    <span>
                                        <span className={`block text-sm font-semibold ${reportType === type ? 'text-primary' : 'text-foreground'}`}>{type}</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">{desc}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-5 pt-4 flex items-center justify-end gap-3 border-t border-border">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={handleCreate} disabled={!formId || !reportName}
                        className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                        Create Report
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Report Type Badge ──────────────────────────────────────── */
function TypeBadge({ type }: { type: ReportType }) {
    const map: Record<ReportType, React.ReactNode> = {
        Summary: <BarChart2 size={11} />,
        Tabular: <Table2 size={11} />,
        Matrix: <LayoutGrid size={11} />,
        Chart: <PieChart size={11} />,
    };
    const color: Record<ReportType, string> = {
        Summary: 'bg-primary/15 text-primary border-primary/25',
        Tabular: 'bg-violet-500/15 text-violet-600 border-violet-500/25',
        Matrix: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
        Chart: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${color[type]}`}>
            {map[type]} {type}
        </span>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MyReports() {
    const [showModal, setShowModal] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [filterType, setFilterType] = useState<ReportType | 'All'>('All');

    const allForms = useFormStore(state => state.forms);
    const activeForms = allForms.filter(f => !f.isDeleted);

    const formOptions: SelectOption[] = useMemo(() =>
        activeForms.map(f => ({ value: f.id, label: f.name })),
        [activeForms]
    );

    const handleCreate = (data: Omit<Report, 'id' | 'createdAt'>) => {
        setReports(prev => [...prev, { ...data, id: `report-${Date.now()}`, createdAt: new Date().toISOString() }]);
    };

    const handleDelete = (id: string) => setReports(prev => prev.filter(r => r.id !== id));

    const filtered = filterType === 'All' ? reports : reports.filter(r => r.type === filterType);

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-5xl mx-auto animate-in">

                {/* Page header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">My Reports</h1>
                        <p className="text-sm text-muted-foreground mt-1">Analyze form submissions with powerful reporting tools</p>
                    </div>
                    {reports.length > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
                        >
                            <Plus size={15} /> New Report
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                {reports.length > 0 && (
                    <div className="flex items-center gap-8 border-b border-border pb-1 mb-6">
                        {(['All', 'Summary', 'Tabular', 'Matrix', 'Chart'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${filterType === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                                    }`}
                            >
                                {t}
                                {t !== 'All' && (
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterType === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {reports.filter(r => r.type === t).length}
                                    </span>
                                )}
                                {filterType === t && (
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {reports.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center justify-center py-28 px-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                            <BarChart3 size={28} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No reports yet</h2>
                        <p className="text-sm text-muted-foreground mb-7 max-w-xs">Create your first report to analyze and visualize form submission data.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg"
                        >
                            <Plus size={15} /> New Report
                        </button>
                    </div>
                ) : (
                    /* Reports list */
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-background text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                            <span>Report Name</span>
                            <span>Form</span>
                            <span>Type</span>
                            <span>Created</span>
                            <span></span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">No reports for this filter.</div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {filtered.map(report => (
                                    <div
                                        key={report.id}
                                        className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors"
                                    >
                                        {/* Name */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                <TrendingUp size={14} className="text-primary" />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground truncate">{report.name}</span>
                                        </div>

                                        {/* Form */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <BarChart3 size={13} className="text-muted-foreground shrink-0" />
                                            <span className="text-sm text-muted-foreground truncate">{report.formName}</span>
                                        </div>

                                        {/* Type */}
                                        <div><TypeBadge type={report.type} /></div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar size={12} className="shrink-0" />
                                            {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Open report">
                                                <ExternalLink size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(report.id)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete report">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && (
                <NewReportModal onClose={() => setShowModal(false)} onSave={handleCreate} formOptions={formOptions} />
            )}
        </MainLayout>
    );
}
