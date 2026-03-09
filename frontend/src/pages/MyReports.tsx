import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import {
    X, Search, ChevronDown, LayoutGrid, Trash2,
    BarChart3, BarChart2, PieChart, Table2, TrendingUp,
    Calendar, ArrowLeft, Plus, Hash, AlignLeft,
    CheckSquare, Star, ToggleLeft,
} from 'lucide-react';
import { api } from '../lib/api';

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
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all ${reportType === type ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted'}`}
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

/* ─── MINI BAR CHART (no library) ───────────────────────────── */
function MiniBar({ value, max, color = '#10b981' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-[11px] font-bold text-gray-600 w-8 text-right">{value}</span>
        </div>
    );
}

/* ─── SVG PIE CHART (no library) ────────────────────────────── */
function SvgPie({ slices }: { slices: { label: string; value: number; color: string }[] }) {
    const total = slices.reduce((s, x) => s + x.value, 0);
    if (total === 0) return <div className="text-xs text-gray-400 text-center py-8">No data</div>;

    let angle = -90;
    const arcs = slices.map(s => {
        const sweep = (s.value / total) * 360;
        const start = angle;
        angle += sweep;
        return { ...s, start, sweep };
    });

    const polarToXY = (cx: number, cy: number, r: number, deg: number) => {
        const rad = (deg * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    const cx = 80, cy = 80, r = 68;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width={160} height={160} viewBox="0 0 160 160">
                {arcs.map((arc, i) => {
                    if (arc.sweep < 0.5) return null;
                    const s = polarToXY(cx, cy, r, arc.start);
                    const e = polarToXY(cx, cy, r, arc.start + arc.sweep);
                    const lg = arc.sweep > 180 ? 1 : 0;
                    const d = `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y} Z`;
                    return <path key={i} d={d} fill={arc.color} stroke="#fff" strokeWidth={2} />;
                })}
            </svg>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
                {slices.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-[11px] text-gray-600 font-medium">{s.label}</span>
                        <span className="text-[11px] text-gray-400">({Math.round((s.value / total) * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── PALETTE ────────────────────────────────────────────────── */
const PALETTE = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48'];

/* ─── SUMMARY VIEW ───────────────────────────────────────────── */
function SummaryView({ submissions, fields }: {
    submissions: { data: Record<string, unknown> }[];
    fields: { label: string; type: string }[];
}) {
    if (submissions.length === 0) return <EmptySubmissions />;

    const stats = fields.map((field, fi) => {
        const values = submissions.map(s => s.data[field.label]).filter(v => v !== undefined && v !== '');
        const isNumeric = ['number', 'decimal', 'currency', 'slider', 'rating'].includes(field.type);
        let summary: React.ReactNode;

        if (isNumeric) {
            const nums = values.map(Number).filter(n => !isNaN(n));
            const sum = nums.reduce((a, b) => a + b, 0);
            const avg = nums.length > 0 ? sum / nums.length : 0;
            const min = nums.length > 0 ? Math.min(...nums) : 0;
            const max = nums.length > 0 ? Math.max(...nums) : 0;
            summary = (
                <div className="grid grid-cols-4 gap-3 mt-3">
                    {[['Count', nums.length], ['Sum', sum.toFixed(2)], ['Avg', avg.toFixed(2)], ['Min/Max', `${min} / ${max}`]].map(([l, v]) => (
                        <div key={String(l)} className="bg-white rounded-lg border border-gray-100 px-3 py-2">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{l}</p>
                            <p className="text-[15px] font-bold text-gray-800 mt-0.5">{v}</p>
                        </div>
                    ))}
                </div>
            );
        } else {
            // Frequency count
            const freq: Record<string, number> = {};
            values.forEach(v => {
                const key = Array.isArray(v) ? v.join(', ') : String(v);
                freq[key] = (freq[key] || 0) + 1;
            });
            const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const maxCount = entries[0]?.[1] || 1;
            summary = (
                <div className="mt-3 space-y-2">
                    {entries.map(([label, count], i) => (
                        <div key={i} className="space-y-0.5">
                            <div className="flex justify-between text-[11.5px]">
                                <span className="text-gray-700 font-medium truncate max-w-[60%]">{label || '(empty)'}</span>
                            </div>
                            <MiniBar value={count} max={maxCount} color={PALETTE[fi % PALETTE.length]} />
                        </div>
                    ))}
                    {Object.keys(freq).length === 0 && <p className="text-[12px] text-gray-400">No responses</p>}
                </div>
            );
        }

        return { field, values, summary };
    });

    return (
        <div className="space-y-4">
            {/* Overview */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Submissions', value: submissions.length, icon: <Hash size={16} className="text-blue-500" /> },
                    { label: 'Fields Tracked', value: fields.length, icon: <AlignLeft size={16} className="text-purple-500" /> },
                    { label: 'Completion Rate', value: '100%', icon: <CheckSquare size={16} className="text-emerald-500" /> },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">{label}</span></div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* Per-field summaries */}
            {stats.map(({ field, summary }, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{field.type}</span>
                        <h3 className="text-[13.5px] font-bold text-gray-800">{field.label}</h3>
                    </div>
                    {summary}
                </div>
            ))}
        </div>
    );
}

/* ─── TABULAR VIEW ───────────────────────────────────────────── */
function TabularView({ submissions, fields }: {
    submissions: { id: string; submittedAt: string; data: Record<string, unknown> }[];
    fields: { label: string; type: string }[];
}) {
    if (submissions.length === 0) return <EmptySubmissions />;
    const cols = ['#', 'Submitted At', ...fields.map(f => f.label)];

    return (
        <div className="overflow-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-[12.5px]">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        {cols.map(col => (
                            <th key={col} className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wide text-[10px] whitespace-nowrap">{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {submissions.map((sub, idx) => (
                        <tr key={sub.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(sub.submittedAt).toLocaleString()}</td>
                            {fields.map(f => {
                                const v = sub.data[f.label];
                                const display = v === undefined || v === '' ? '—' : Array.isArray(v) ? v.join(', ') : String(v);
                                return (
                                    <td key={f.label} className="px-4 py-3 text-gray-800 max-w-[180px]">
                                        <span className="truncate block">{display}</span>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─── CHART VIEW ─────────────────────────────────────────────── */
function ChartView({ submissions, fields }: {
    submissions: { data: Record<string, unknown> }[];
    fields: { label: string; type: string }[];
}) {
    const [selectedField, setSelectedField] = useState(fields[0]?.label || '');
    const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

    if (submissions.length === 0) return <EmptySubmissions />;

    const field = fields.find(f => f.label === selectedField) || fields[0];
    const values = submissions.map(s => s.data[field?.label || '']).filter(v => v !== undefined && v !== '');

    const isNumeric = ['number', 'decimal', 'currency', 'slider', 'rating'].includes(field?.type || '');
    let chartData: { label: string; value: number; color: string }[] = [];

    if (isNumeric) {
        const nums = values.map(Number).filter(n => !isNaN(n));
        // Bucket into ranges
        if (nums.length > 0) {
            const min = Math.min(...nums), max = Math.max(...nums);
            const range = max - min || 1;
            const buckets = Math.min(5, nums.length);
            const step = range / buckets;
            const bucketCounts: number[] = Array(buckets).fill(0);
            nums.forEach(n => {
                const idx = Math.min(Math.floor((n - min) / step), buckets - 1);
                bucketCounts[idx]++;
            });
            chartData = bucketCounts.map((count, i) => ({
                label: `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`,
                value: count,
                color: PALETTE[i % PALETTE.length],
            }));
        }
    } else {
        const freq: Record<string, number> = {};
        values.forEach(v => {
            const key = Array.isArray(v) ? v.join(', ') : String(v);
            freq[key] = (freq[key] || 0) + 1;
        });
        chartData = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value], i) => ({
            label, value, color: PALETTE[i % PALETTE.length],
        }));
    }

    const maxVal = chartData.reduce((m, d) => Math.max(m, d.value), 1);
    const barH = 200;

    return (
        <div className="space-y-5">
            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Field</label>
                    <select
                        value={selectedField}
                        onChange={e => setSelectedField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-emerald-400/40 bg-white"
                    >
                        {fields.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Chart Type</label>
                    <div className="flex gap-1">
                        {(['bar', 'pie'] as const).map(t => (
                            <button key={t} onClick={() => setChartType(t)}
                                className={`px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all capitalize ${chartType === t ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                {t === 'bar' ? <BarChart3 size={14} /> : <PieChart size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No data for this field</div>
            ) : chartType === 'pie' ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-[13px] font-bold text-gray-700 mb-4">{field?.label} — Distribution</h3>
                    <SvgPie slices={chartData} />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-[13px] font-bold text-gray-700 mb-4">{field?.label} — Counts</h3>
                    <div className="flex items-end gap-3 h-[200px] mt-2">
                        {chartData.map((d, i) => {
                            const h = Math.round((d.value / maxVal) * barH);
                            return (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                                    <span className="text-[11px] font-bold text-gray-600">{d.value}</span>
                                    <div
                                        className="w-full rounded-t-md transition-all duration-500"
                                        style={{ height: `${h}px`, backgroundColor: d.color, minHeight: 4 }}
                                    />
                                    <span className="text-[10px] text-gray-500 text-center truncate w-full px-1">{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Table summary */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-[12.5px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase text-[10px] tracking-wider">Value</th>
                            <th className="px-4 py-2.5 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">Count</th>
                            <th className="px-4 py-2.5 text-right font-bold text-gray-500 uppercase text-[10px] tracking-wider">%</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {chartData.map((d, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2.5 text-gray-700 font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                        {d.label}
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-right font-bold text-gray-800">{d.value}</td>
                                <td className="px-4 py-2.5 text-right text-gray-500">{Math.round((d.value / submissions.length) * 100)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── MATRIX VIEW ────────────────────────────────────────────── */
function MatrixView({ submissions, fields }: {
    submissions: { data: Record<string, unknown> }[];
    fields: { label: string; type: string }[];
}) {
    const [rowField, setRowField] = useState(fields[0]?.label || '');
    const [colField, setColField] = useState(fields[1]?.label || fields[0]?.label || '');

    if (submissions.length === 0) return <EmptySubmissions />;

    const rowValues = [...new Set(submissions.map(s => {
        const v = s.data[rowField];
        return Array.isArray(v) ? v.join(', ') : String(v ?? '—');
    }))].sort();

    const colValues = [...new Set(submissions.map(s => {
        const v = s.data[colField];
        return Array.isArray(v) ? v.join(', ') : String(v ?? '—');
    }))].sort();

    // Build matrix counts
    const matrix: Record<string, Record<string, number>> = {};
    rowValues.forEach(r => { matrix[r] = {}; colValues.forEach(c => { matrix[r][c] = 0; }); });
    submissions.forEach(s => {
        const rv = s.data[rowField];
        const cv = s.data[colField];
        const rk = Array.isArray(rv) ? rv.join(', ') : String(rv ?? '—');
        const ck = Array.isArray(cv) ? cv.join(', ') : String(cv ?? '—');
        if (matrix[rk]) matrix[rk][ck] = (matrix[rk][ck] || 0) + 1;
    });

    const maxCell = Math.max(...rowValues.flatMap(r => colValues.map(c => matrix[r]?.[c] || 0)), 1);

    return (
        <div className="space-y-5">
            {/* Controls */}
            <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Row Field</label>
                    <select value={rowField} onChange={e => setRowField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-amber-400/40 bg-white">
                        {fields.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Column Field</label>
                    <select value={colField} onChange={e => setColField(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-amber-400/40 bg-white">
                        {fields.map(f => <option key={f.label} value={f.label}>{f.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="text-[12px] min-w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left font-bold text-gray-500 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                {rowField} \ {colField}
                            </th>
                            {colValues.map(c => (
                                <th key={c} className="px-4 py-3 text-center font-bold text-gray-600 whitespace-nowrap">{c}</th>
                            ))}
                            <th className="px-4 py-3 text-center font-bold text-amber-600 text-[10px] uppercase tracking-widest">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rowValues.map(r => {
                            const rowTotal = colValues.reduce((sum, c) => sum + (matrix[r]?.[c] || 0), 0);
                            return (
                                <tr key={r} className="bg-white hover:bg-amber-50/40 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">{r}</td>
                                    {colValues.map(c => {
                                        const val = matrix[r]?.[c] || 0;
                                        const intensity = Math.round((val / maxCell) * 80);
                                        return (
                                            <td key={c} className="px-4 py-3 text-center" style={{ backgroundColor: val > 0 ? `rgba(245,158,11,${intensity / 100})` : undefined }}>
                                                <span className={`font-bold ${val > 0 ? 'text-amber-800' : 'text-gray-300'}`}>{val || '—'}</span>
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-3 text-center font-black text-amber-700">{rowTotal}</td>
                                </tr>
                            );
                        })}
                        {/* Column totals */}
                        <tr className="bg-amber-50 border-t-2 border-amber-200">
                            <td className="px-4 py-3 font-black text-amber-700 text-[10px] uppercase tracking-widest">Total</td>
                            {colValues.map(c => {
                                const colTotal = rowValues.reduce((sum, r) => sum + (matrix[r]?.[c] || 0), 0);
                                return <td key={c} className="px-4 py-3 text-center font-black text-amber-700">{colTotal}</td>;
                            })}
                            <td className="px-4 py-3 text-center font-black text-amber-900">{submissions.length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ─── EMPTY STATE ─────────────────────────────────────────────── */
function EmptySubmissions() {
    return (
        <div className="bg-card rounded-xl border border-border py-20 text-center">
            <BarChart3 size={36} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No submissions yet for this form</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Share the form to start collecting responses</p>
        </div>
    );
}

/* ─── REPORT VIEWER ──────────────────────────────────────────── */
function ReportViewer({ report, onBack }: { report: Report; onBack: () => void }) {
    const allForms = useFormStore(s => s.forms);
    const allSubmissions = useFormStore(s => s.submissions);
    const loadSubmissions = useFormStore(s => s.loadSubmissions);

    const form = allForms.find(f => f.id === report.formId);
    const subs = allSubmissions.filter(s => s.formId === report.formId);

    useEffect(() => { loadSubmissions(report.formId); }, [report.formId]);

    const fields = useMemo(() =>
        (form?.fields || []).map(f => ({ label: f.label, type: f.type })),
        [form]
    );

    const typeColor: Record<ReportType, string> = {
        Summary: 'text-primary bg-primary/10',
        Tabular: 'text-violet-600 bg-violet-50',
        Matrix: 'text-amber-600 bg-amber-50',
        Chart: 'text-emerald-600 bg-emerald-50',
    };

    return (
        <div className="max-w-5xl mx-auto animate-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                    <ArrowLeft size={16} /> Reports
                </button>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-sm font-semibold text-foreground">{report.name}</span>
            </div>

            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">{report.name}</h1>
                        <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${typeColor[report.type]}`}>
                            {report.type}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Form: <span className="font-medium text-foreground">{report.formName}</span>
                        &nbsp;·&nbsp;{subs.length} submission{subs.length !== 1 ? 's' : ''}
                        &nbsp;·&nbsp;Created {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Content */}
            {report.type === 'Summary' && <SummaryView submissions={subs} fields={fields} />}
            {report.type === 'Tabular' && <TabularView submissions={subs} fields={fields} />}
            {report.type === 'Chart' && <ChartView submissions={subs} fields={fields} />}
            {report.type === 'Matrix' && <MatrixView submissions={subs} fields={fields} />}
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MyReports() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [filterType, setFilterType] = useState<ReportType | 'All'>('All');
    const [loading, setLoading] = useState(true);

    const allForms = useFormStore(state => state.forms);
    const activeForms = allForms.filter(f => !f.isDeleted);

    const formOptions: SelectOption[] = useMemo(() =>
        activeForms.map(f => ({ value: f.id, label: f.name })),
        [activeForms]
    );

    useEffect(() => {
        const loadReports = async () => {
            try {
                const data = await api.getReports();
                setReports(data as Report[]);
            } catch (err) {
                console.error('Failed to load reports:', err);
            } finally {
                setLoading(false);
            }
        };
        loadReports();
    }, []);

    const handleCreate = async (data: Omit<Report, 'id' | 'createdAt'>) => {
        try {
            const created = await api.createReport(data as any);
            setReports(prev => [created as Report, ...prev]);
            navigate(`/reports/${created.id}`);
        } catch (err) {
            console.error('Failed to create report:', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteReport(id);
            setReports(prev => prev.filter(r => r.id !== id));
            if (reportId === id) navigate('/reports');
        } catch (err) {
            console.error('Failed to delete report:', err);
        }
    };

    const filtered = filterType === 'All' ? reports : reports.filter(r => r.type === filterType);
    const openReport = reports.find(r => r.id === reportId);

    // Open report viewer
    if (openReport) {
        return (
            <MainLayout onNewFormClick={() => { }}>
                <ReportViewer report={openReport} onBack={() => navigate('/reports')} />
            </MainLayout>
        );
    }

    // If we have a reportId but no matching report and no longer loading, something is wrong
    if (reportId && !loading && !openReport) {
        return (
            <MainLayout onNewFormClick={() => { }}>
                <div className="flex flex-col items-center justify-center h-screen">
                    <p className="text-muted-foreground mb-4">Report not found</p>
                    <button onClick={() => navigate('/reports')} className="text-primary font-semibold">Back to Reports</button>
                </div>
            </MainLayout>
        );
    }

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
                                className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${filterType === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'}`}
                            >
                                {t}
                                {t !== 'All' && (
                                    <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filterType === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
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
                                        className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/reports/${report.id}`)}
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
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => navigate(`/reports/${report.id}`)}
                                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Open report"
                                            >
                                                <Star size={14} />
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
