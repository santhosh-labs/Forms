import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import {
    ClipboardCheck, Check, X, Eye, Search,
    Clock, CheckCircle, XCircle, FileText, MessageSquare,
    Calendar, User,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

interface Approval {
    id: string;
    formId: string;
    formName: string;
    submittedBy: string;
    submittedAt: string;
    status: ApprovalStatus;
    reviewNote?: string;
}

/* ─── Status Badge ───────────────────────────────────────────── */
function StatusBadge({ status }: { status: ApprovalStatus }) {
    const cfg: Record<ApprovalStatus, { cls: string; icon: React.ReactNode }> = {
        Pending: {
            cls: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
            icon: <Clock size={11} />
        },
        Approved: {
            cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
            icon: <CheckCircle size={11} />
        },
        Rejected: {
            cls: 'bg-destructive/15 text-destructive border-destructive/25',
            icon: <XCircle size={11} />
        },
    };
    const { cls, icon } = cfg[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cls}`}>
            {icon} {status}
        </span>
    );
}

/* ─── Action Modal ───────────────────────────────────────────── */
function ActionModal({ approval, action, onClose, onConfirm }: {
    approval: Approval;
    action: 'approve' | 'reject';
    onClose: () => void;
    onConfirm: (note: string) => void;
}) {
    const [note, setNote] = useState('');
    const isApprove = action === 'approve';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">
                        {isApprove ? 'Approve Submission' : 'Reject Submission'}
                    </h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg space-y-1 border border-border">
                        <p className="text-sm font-semibold text-foreground">{approval.formName}</p>
                        <p className="text-xs text-muted-foreground">Submitted by <span className="font-medium text-foreground">{approval.submittedBy}</span></p>
                        <p className="text-xs text-muted-foreground">{new Date(approval.submittedAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <label className={`block text-sm font-semibold mb-1 ${isApprove ? 'text-emerald-600' : 'text-destructive'}`}>
                            {isApprove ? 'Approval Note (optional)' : 'Rejection Reason'}
                        </label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            rows={3}
                            placeholder={isApprove ? 'Add a note for the submitter…' : 'Provide a reason for rejection…'}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none bg-background text-foreground placeholder:text-muted-foreground"
                        />
                    </div>
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3 border-t border-border pt-4">
                    <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                    <button
                        onClick={() => { onConfirm(note); onClose(); }}
                        disabled={!isApprove && !note.trim()}
                        className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-destructive hover:bg-destructive/90'
                            }`}
                    >
                        {isApprove ? 'Approve' : 'Reject'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Detail Modal ───────────────────────────────────────────── */
function DetailModal({ approval, onClose }: { approval: Approval; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md border border-border animate-in" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Approval Detail</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                    {[
                        { icon: <FileText size={15} />, label: 'Form', value: approval.formName },
                        { icon: <User size={15} />, label: 'Submitted By', value: approval.submittedBy },
                        { icon: <Calendar size={15} />, label: 'Submitted At', value: new Date(approval.submittedAt).toLocaleString() },
                        { icon: <ClipboardCheck size={15} />, label: 'Status', value: <StatusBadge status={approval.status} /> },
                        ...(approval.reviewNote ? [{ icon: <MessageSquare size={15} />, label: 'Review Note', value: approval.reviewNote }] : []),
                    ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                            <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                                <div className="text-sm font-medium text-foreground">{value}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="px-6 pb-5 pt-4 flex justify-end border-t border-border">
                    <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Seed demo approvals ────────────────────────────────────── */
function buildInitialApprovals(
    forms: { id: string; name: string }[],
    submissions: { id: string; formId: string; submittedAt: string; data: Record<string, unknown> }[]
): Approval[] {
    return submissions.slice(0, 6).map((sub, i) => {
        const form = forms.find(f => f.id === sub.formId);
        const statuses: ApprovalStatus[] = ['Pending', 'Pending', 'Approved', 'Pending', 'Rejected', 'Approved'];
        return {
            id: `approval-${sub.id}`,
            formId: sub.formId,
            formName: form?.name || 'Unknown Form',
            submittedBy: (sub.data['Full Name'] || sub.data['Email Address'] || `User ${i + 1}`) as string,
            submittedAt: sub.submittedAt,
            status: statuses[i] ?? 'Pending',
            reviewNote: statuses[i] === 'Rejected' ? 'Missing required documentation.' : statuses[i] === 'Approved' ? 'All checks passed.' : undefined,
        };
    });
}

type StatusFilter = ApprovalStatus | 'All';

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MyApprovals() {
    const allForms = useFormStore(state => state.forms);
    const allSubmissions = useFormStore(state => state.submissions);

    const [approvals, setApprovals] = useState<Approval[]>(() =>
        buildInitialApprovals(allForms, allSubmissions)
    );
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
    const [search, setSearch] = useState('');
    const [actionModal, setActionModal] = useState<{ approval: Approval; action: 'approve' | 'reject' } | null>(null);
    const [detailModal, setDetailModal] = useState<Approval | null>(null);

    const counts = useMemo(() => ({
        All: approvals.length,
        Pending: approvals.filter(a => a.status === 'Pending').length,
        Approved: approvals.filter(a => a.status === 'Approved').length,
        Rejected: approvals.filter(a => a.status === 'Rejected').length,
    }), [approvals]);

    const filtered = useMemo(() =>
        approvals.filter(a => {
            const matchStatus = statusFilter === 'All' || a.status === statusFilter;
            const matchSearch = !search || a.formName.toLowerCase().includes(search.toLowerCase()) || a.submittedBy.toLowerCase().includes(search.toLowerCase());
            return matchStatus && matchSearch;
        }),
        [approvals, statusFilter, search]
    );

    const handleAction = (id: string, newStatus: ApprovalStatus, note: string) => {
        setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, reviewNote: note || undefined } : a));
    };

    const TABS: StatusFilter[] = ['All', 'Pending', 'Approved', 'Rejected'];

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-6xl mx-auto animate-in">
                {/* Header */}
                <div className="mb-7">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">My Approvals</h1>
                    <p className="text-sm text-muted-foreground mt-1">Review and act on form submissions pending your approval</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`text-left p-5 rounded-xl border transition-all shadow-sm bg-card ${statusFilter === tab
                                ? 'border-primary ring-1 ring-primary/20'
                                : 'border-border hover:border-primary/30'
                                }`}
                        >
                            <p className={`text-xs font-black uppercase tracking-widest mb-2 ${statusFilter === tab ? 'text-primary' : 'text-muted-foreground'
                                }`}>{tab}</p>
                            <p className={`text-3xl font-bold ${statusFilter === tab ? 'text-primary' : 'text-foreground'}`}>
                                {counts[tab]}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Table card */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border">
                        {/* Tabs */}
                        <div className="flex items-center gap-8">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setStatusFilter(tab)}
                                    className={`pb-3.5 text-sm font-semibold transition-all relative whitespace-nowrap ${statusFilter === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                                        }`}
                                >
                                    {tab}
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === tab ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {counts[tab]}
                                    </span>
                                    {statusFilter === tab && (
                                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                        {/* Search */}
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by form or submitter…"
                                className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-56 bg-background text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-background text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                        <span>Form</span><span>Submitted By</span><span>Date</span><span>Status</span><span>Actions</span>
                    </div>

                    {/* Rows */}
                    {filtered.length === 0 ? (
                        <div className="py-16 flex flex-col items-center">
                            <ClipboardCheck size={40} className="mb-3 text-muted" />
                            <p className="text-muted-foreground font-medium text-sm">No approvals found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {filtered.map(approval => (
                                <div key={approval.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors">

                                    {/* Form */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText size={14} className="text-primary" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground truncate">{approval.formName}</span>
                                    </div>

                                    {/* Submitted by */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-primary">{approval.submittedBy[0]?.toUpperCase()}</span>
                                        </div>
                                        <span className="text-sm text-foreground truncate">{approval.submittedBy}</span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                        <Calendar size={12} className="shrink-0" />
                                        {new Date(approval.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>

                                    {/* Status */}
                                    <StatusBadge status={approval.status} />

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setDetailModal(approval)}
                                            title="View details"
                                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        {approval.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => setActionModal({ approval, action: 'approve' })}
                                                    title="Approve"
                                                    className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ approval, action: 'reject' })}
                                                    title="Reject"
                                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {actionModal && (
                <ActionModal
                    approval={actionModal.approval}
                    action={actionModal.action}
                    onClose={() => setActionModal(null)}
                    onConfirm={(note) => handleAction(
                        actionModal.approval.id,
                        actionModal.action === 'approve' ? 'Approved' : 'Rejected',
                        note
                    )}
                />
            )}
            {detailModal && (
                <DetailModal approval={detailModal} onClose={() => setDetailModal(null)} />
            )}
        </MainLayout>
    );
}
