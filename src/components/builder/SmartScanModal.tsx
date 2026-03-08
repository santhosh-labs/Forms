import { useRef, useState, useCallback, useEffect } from 'react';
import { X, ImagePlus, Info, Sparkles, ExternalLink, UploadCloud, CheckCircle2, Plus, Search, ChevronDown } from 'lucide-react';
import { fieldTemplates } from '../../data/mockData';

interface SmartScanModalProps {
    onClose: () => void;
}

/* ── Available form field options for the dropdown ─────────── */
const FIELD_OPTIONS = fieldTemplates
    .filter(f => f.type !== 'smart_scan')
    .map(f => ({ value: f.type, label: f.label, category: f.category }));

/* ── Extracted keys AI would produce ───────────────────────── */
const EXTRACTED_KEYS = [
    'Full Name',
    'Date of Birth',
    'Street Address',
    'Address Line 2',
    'City',
    'State/Region',
    'Phone Number',
    'Email Address',
];

interface MappingRow {
    id: string;
    key: string;    // extracted key (left column)
    field: string;  // chosen form field type (right column)
}

/* ── Searchable Field Dropdown ──────────────────────────────── */
function FieldDropdown({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const filtered = FIELD_OPTIONS.filter(o =>
        !q || o.label.toLowerCase().includes(q.toLowerCase()) || o.category.toLowerCase().includes(q.toLowerCase())
    );

    const selected = FIELD_OPTIONS.find(o => o.value === value);

    return (
        <div ref={ref} className="relative flex-1">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => { setOpen(o => !o); setQ(''); }}
                className={`
          w-full flex items-center justify-between px-3 py-2 text-[12.5px] rounded-lg border transition-all
          ${open
                        ? 'border-teal-400 bg-white ring-1 ring-teal-300'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
        `}
            >
                <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                    {selected ? selected.label : '-- Choose Field --'}
                </span>
                <ChevronDown
                    size={13}
                    className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {/* Search */}
                    <div className="px-2 pt-2 pb-1">
                        <div className="relative">
                            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                autoFocus
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                placeholder="Search fields…"
                                className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-300 transition-all"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="overflow-y-auto max-h-[200px] py-1">
                        {/* Reset option */}
                        <button
                            onClick={() => { onChange(''); setOpen(false); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                            <span>-- Choose Field --</span>
                            {!value && <CheckCircle2 size={13} className="text-teal-500" />}
                        </button>

                        {filtered.length === 0 ? (
                            <p className="px-3 py-3 text-[12px] text-gray-400 text-center">No results</p>
                        ) : (
                            filtered.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {/* Form field icon placeholder */}
                                        <span className="w-6 h-6 rounded border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[9px] text-gray-400 font-mono">ab</span>
                                        </span>
                                        <span className="text-gray-700 font-medium truncate">{opt.label}</span>
                                    </div>
                                    {value === opt.value && <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── SmartScanModal ─────────────────────────────────────────── */
export default function SmartScanModal({ onClose }: SmartScanModalProps) {
    const [dragging, setDragging] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [extracted, setExtracted] = useState(false);
    const [rows, setRows] = useState<MappingRow[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) return;
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setExtracted(false);
        setRows([]);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleExtract = () => {
        if (!imageFile) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setExtracted(true);
            // Simulate AI extraction — populate rows with keys
            setRows(EXTRACTED_KEYS.map((key, i) => ({
                id: `row-${i}`,
                key,
                field: '',
            })));
        }, 2000);
    };

    const addRow = () => {
        setRows(prev => [...prev, { id: `row-${Date.now()}`, key: '', field: '' }]);
    };

    const updateRow = (id: string, changes: Partial<MappingRow>) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r));
    };

    const deleteRow = (id: string) => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(15,23,42,0.55)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
                style={{ maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ───────────────────────────────────────────── */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                                    <Sparkles size={11} className="text-white" />
                                </div>
                                <h2 className="text-[15px] font-bold text-[#0F172A]">Configure Smart Scan</h2>
                            </div>
                            <p className="text-[11.5px] text-[#64748B] leading-relaxed max-w-xl">
                                Automatically extract data from the uploaded image using our{' '}
                                <span className="text-violet-600 font-medium">in-house AI model</span>,
                                map it to form fields, and let respondents auto-fill forms with ease.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <a href="#" className="text-[11.5px] font-semibold text-violet-600 hover:underline flex items-center gap-1" onClick={e => e.preventDefault()}>
                                How it Works? <ExternalLink size={10} />
                            </a>
                            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Two-column body ──────────────────────────────────── */}
                <div className="flex flex-1 overflow-hidden min-h-0">

                    {/* LEFT – Upload */}
                    <div
                        className="w-[42%] shrink-0 p-5 flex flex-col border-r border-gray-100"
                        style={{ background: 'linear-gradient(145deg, #fdf4ff 0%, #f5f0ff 40%, #fce7f3 100%)' }}
                    >
                        <p className="text-[11.5px] font-semibold text-gray-500 mb-3">Upload an Image</p>

                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={onDrop}
                            onClick={() => !imageUrl && inputRef.current?.click()}
                            className={`
                flex-1 min-h-[160px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5
                transition-all cursor-pointer
                ${dragging
                                    ? 'border-violet-400 bg-violet-50/60'
                                    : imageUrl
                                        ? 'border-violet-300 bg-white/60'
                                        : 'border-gray-300 bg-white/50 hover:border-violet-300 hover:bg-white/70'}
              `}
                        >
                            {imageUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center p-3">
                                    <img src={imageUrl} alt="Uploaded" className="max-h-[140px] max-w-full rounded-lg object-contain shadow-sm" />
                                    <button
                                        onClick={e => { e.stopPropagation(); setImageFile(null); setImageUrl(null); setExtracted(false); setRows([]); }}
                                        className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center text-gray-400 hover:text-red-500"
                                    >
                                        <X size={9} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center shadow-sm">
                                        {dragging ? <UploadCloud size={18} className="text-violet-500" /> : <ImagePlus size={18} className="text-gray-400" />}
                                    </div>
                                    <p className="text-[11.5px] text-gray-400 text-center px-4 leading-snug">
                                        {dragging ? 'Drop to upload' : 'Drag and drop your image here.'}
                                    </p>
                                    <button
                                        onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                                        className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[11.5px] font-medium text-gray-600 hover:border-violet-400 hover:text-violet-600 transition-colors shadow-sm"
                                    >
                                        Choose Image
                                    </button>
                                </>
                            )}
                        </div>
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                        {/* Extract button */}
                        <button
                            onClick={handleExtract}
                            disabled={!imageFile || loading || extracted}
                            className={`
                mt-4 w-full py-2 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
                ${extracted
                                    ? 'bg-emerald-500 text-white cursor-default'
                                    : imageFile && !loading
                                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
                        >
                            {loading ? (
                                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Extracting…</>
                            ) : extracted ? (
                                <><CheckCircle2 size={14} /> Data Extracted</>
                            ) : (
                                <><Sparkles size={13} /> Extract data</>
                            )}
                        </button>
                    </div>

                    {/* RIGHT – Field Mapping */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {!extracted ? (
                            /* — Placeholder before extraction — */
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                                <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center mb-3">
                                    <Info size={18} className="text-gray-400" />
                                </div>
                                <p className="text-[12.5px] text-gray-500 leading-relaxed max-w-[210px] mb-5">
                                    Map fields using extracted data from the uploaded image or configure them manually.
                                </p>
                                <button
                                    onClick={() => { setExtracted(true); setRows([{ id: 'manual-1', key: '', field: '' }]); }}
                                    className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[12.5px] font-semibold rounded-lg transition-colors shadow-sm"
                                >
                                    Configure
                                </button>
                            </div>
                        ) : (
                            /* — Field Mapping table — */
                            <div className="flex flex-col flex-1 min-h-0">
                                {/* Table header */}
                                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 grid grid-cols-2 gap-3 shrink-0">
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Key for Auto-fill</span>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Form Fields</span>
                                </div>

                                {/* Rows */}
                                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                                    {rows.map(row => (
                                        <div key={row.id} className="grid grid-cols-2 gap-2 items-center group">
                                            {/* Key input */}
                                            <input
                                                value={row.key}
                                                onChange={e => updateRow(row.id, { key: e.target.value })}
                                                placeholder="e.g. Full Name"
                                                className="px-3 py-2 text-[12.5px] bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-300 focus:border-teal-400 focus:bg-white transition-all"
                                            />

                                            {/* Field dropdown + delete */}
                                            <div className="flex items-center gap-1.5">
                                                <FieldDropdown
                                                    value={row.field}
                                                    onChange={v => updateRow(row.id, { field: v })}
                                                />
                                                <button
                                                    onClick={() => deleteRow(row.id)}
                                                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 flex-shrink-0 transition-all rounded-md hover:bg-red-50"
                                                >
                                                    <X size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add row */}
                                    <button
                                        onClick={addRow}
                                        className="flex items-center gap-2 text-[12px] text-teal-600 hover:text-teal-700 font-medium px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors mt-1"
                                    >
                                        <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center flex-shrink-0">
                                            <Plus size={10} />
                                        </span>
                                        Add mapping row
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Footer ───────────────────────────────────────────── */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[12.5px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!extracted}
                        className="px-5 py-2 text-[12.5px] font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
