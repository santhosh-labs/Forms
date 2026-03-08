import { useState, useRef, useEffect, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import {
    CheckSquare, X, Search, ChevronDown, LayoutGrid, Trash2,
    Calendar, User, Flag, CheckCircle2, Clock, Circle, Plus
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
type Priority = 'Low' | 'Medium' | 'High';
type Status = 'Open' | 'In Progress' | 'Completed';

interface Task {
    id: string;
    reportId: string;
    reportLabel: string;
    assignee: string;
    dueDate: string;
    priority: Priority;
    status: Status;
    notes: string;
    createdAt: string;
}

/* ─── Searchable Select ──────────────────────────────────────── */
interface SelectOption {
    value: string;
    label: string;
    isGroupHeader?: boolean;
    icon?: boolean;
}

function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select',
    label,
}: {
    options: SelectOption[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    label?: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = useMemo(() => {
        if (!query) return options;
        const q = query.toLowerCase();
        return options.filter(o => o.isGroupHeader || o.label.toLowerCase().includes(q));
    }, [options, query]);

    const selectedLabel = options.find(o => o.value === value && !o.isGroupHeader)?.label || placeholder;

    return (
        <div className="relative" ref={ref}>
            {label && (
                <label className="block text-sm font-semibold text-primary mb-1">{label}</label>
            )}
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
                            <input
                                autoFocus
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1">
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg mb-1 font-medium transition-colors"
                        >
                            {placeholder}
                        </button>

                        {filtered.map((opt, i) =>
                            opt.isGroupHeader ? (
                                <div key={i} className="px-3 pt-2 pb-1 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    {opt.label}
                                </div>
                            ) : (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 rounded-lg hover:bg-muted transition-colors ${value === opt.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                        }`}
                                >
                                    {opt.icon && (
                                        <span className="w-5 h-5 bg-muted rounded flex items-center justify-center shrink-0">
                                            <LayoutGrid size={12} className="text-muted-foreground" />
                                        </span>
                                    )}
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

/* ─── Assign Task Modal ──────────────────────────────────────── */
function AssignTaskModal({
    onClose,
    onSave,
    reportOptions,
}: {
    onClose: () => void;
    onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    reportOptions: SelectOption[];
}) {
    const [reportId, setReportId] = useState('');
    const [assignee, setAssignee] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Priority>('Medium');
    const [notes, setNotes] = useState('');

    const selectedReport = reportOptions.find(o => o.value === reportId && !o.isGroupHeader);

    const handleSave = () => {
        if (!reportId || !assignee || !dueDate) return;
        onSave({
            reportId,
            reportLabel: selectedReport?.label || '',
            assignee,
            dueDate,
            priority,
            status: 'Open',
            notes,
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in border border-border">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">Assign Task</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <SearchableSelect
                        label="Select Report"
                        options={reportOptions}
                        value={reportId}
                        onChange={setReportId}
                        placeholder="Choose a report..."
                    />

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Assign To</label>
                        <div className="relative">
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={assignee}
                                onChange={e => setAssignee(e.target.value)}
                                placeholder="Enter name or email"
                                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Due Date</label>
                        <div className="relative">
                            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Priority</label>
                        <div className="flex gap-2">
                            {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${priority === p
                                        ? p === 'High'
                                            ? 'bg-destructive/15 border-destructive/40 text-destructive'
                                            : p === 'Medium'
                                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600'
                                                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
                                        : 'border-border text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Flag size={12} className="inline mr-1 mb-0.5" />
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add any notes about this task..."
                            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground resize-none"
                        />
                    </div>
                </div>

                <div className="px-6 pb-5 flex items-center justify-end gap-3 border-t border-border pt-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!reportId || !assignee || !dueDate}
                        className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Assign Task
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
    if (status === 'Completed') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 border border-emerald-500/25">
            <CheckCircle2 size={11} /> Completed
        </span>
    );
    if (status === 'In Progress') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/15 text-primary border border-primary/25">
            <Clock size={11} /> In Progress
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
            <Circle size={11} /> Open
        </span>
    );
}

/* ─── Priority Badge ─────────────────────────────────────────── */
function PriorityBadge({ priority }: { priority: Priority }) {
    const map = {
        High: 'bg-destructive/15 text-destructive border-destructive/25',
        Medium: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
        Low: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${map[priority]}`}>
            <Flag size={10} /> {priority}
        </span>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MyTasks() {
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterStatus, setFilterStatus] = useState<Status | 'All'>('All');

    const allForms = useFormStore(state => state.forms);
    const activeForms = allForms.filter(f => !f.isDeleted);

    const reportOptions: SelectOption[] = useMemo(() => {
        const opts: SelectOption[] = [];
        activeForms.forEach(form => {
            opts.push({ value: `__group__${form.id}`, label: form.name, isGroupHeader: true });
            opts.push({ value: `${form.id}::all`, label: `${form.name} - All Entries`, icon: true });
        });
        return opts;
    }, [activeForms]);

    const handleAssign = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
        setTasks(prev => [...prev, { ...taskData, id: `task-${Date.now()}`, createdAt: new Date().toISOString() }]);
    };

    const handleDelete = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

    const handleStatusChange = (id: string, status: Status) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    };

    const filtered = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-5xl mx-auto animate-in">
                {/* Page header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">My Tasks</h1>
                        <p className="text-sm text-muted-foreground mt-1">Track and manage your assigned tasks</p>
                    </div>
                    {tasks.length > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
                        >
                            <Plus size={15} /> Assign Task
                        </button>
                    )}
                </div>

                {/* Filter tabs */}
                {tasks.length > 0 && (
                    <div className="flex items-center gap-8 border-b border-border pb-1 mb-6">
                        {(['All', 'Open', 'In Progress', 'Completed'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${filterStatus === s ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                                    }`}
                            >
                                {s}
                                {s !== 'All' && (
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterStatus === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {tasks.filter(t => t.status === s).length}
                                    </span>
                                )}
                                {filterStatus === s && (
                                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {tasks.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col items-center justify-center py-28 px-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                            <CheckSquare size={28} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">No tasks yet</h2>
                        <p className="text-sm text-muted-foreground mb-7 max-w-xs">You don't have any tasks assigned. Assign one to get started.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg"
                        >
                            <Plus size={15} /> Assign Task
                        </button>
                    </div>
                ) : (
                    /* Task list */
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-background text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                            <span>Report</span>
                            <span>Assigned To</span>
                            <span>Due Date</span>
                            <span>Priority</span>
                            <span>Status</span>
                            <span></span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-sm">No tasks for this filter.</div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {filtered.map(task => (
                                    <div key={task.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors">
                                        {/* Report */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                                <LayoutGrid size={14} className="text-primary" />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground truncate">{task.reportLabel}</span>
                                        </div>

                                        {/* Assignee */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-primary">{task.assignee[0]?.toUpperCase()}</span>
                                            </div>
                                            <span className="text-sm text-foreground truncate">{task.assignee}</span>
                                        </div>

                                        {/* Due date */}
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <Calendar size={13} className="text-muted-foreground shrink-0" />
                                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>

                                        {/* Priority */}
                                        <div><PriorityBadge priority={task.priority} /></div>

                                        {/* Status - clickable to cycle */}
                                        <div>
                                            <button
                                                onClick={() => {
                                                    const next: Status = task.status === 'Open' ? 'In Progress' : task.status === 'In Progress' ? 'Completed' : 'Open';
                                                    handleStatusChange(task.id, next);
                                                }}
                                                title="Click to change status"
                                            >
                                                <StatusBadge status={task.status} />
                                            </button>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Delete task"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tasks.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                        <CheckSquare size={12} className="shrink-0" />
                        Click a status badge to cycle through Open → In Progress → Completed.
                    </p>
                )}
            </div>

            {showModal && (
                <AssignTaskModal
                    onClose={() => setShowModal(false)}
                    onSave={handleAssign}
                    reportOptions={reportOptions}
                />
            )}
        </MainLayout>
    );
}
