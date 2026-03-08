import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { fieldTemplates } from '../../data/mockData';
import { FieldTemplate, FieldType } from '../../types';
import { useDraggable } from '@dnd-kit/core';
import SmartScanModal from './SmartScanModal';

/* ── Category color map ─────────────────────────────────────── */
const CAT_COLOR: Record<string, { dot: string; icon: string; bg: string; border: string }> = {
    'Basic Info': { dot: 'bg-emerald-400', icon: 'text-emerald-600', bg: 'bg-emerald-50 hover:bg-emerald-100', border: 'border-emerald-200 hover:border-emerald-400' },
    'Textbox': { dot: 'bg-indigo-400', icon: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100', border: 'border-indigo-200 hover:border-indigo-400' },
    'Number': { dot: 'bg-violet-400', icon: 'text-violet-600', bg: 'bg-violet-50 hover:bg-violet-100', border: 'border-violet-200 hover:border-violet-400' },
    'Choice': { dot: 'bg-sky-400', icon: 'text-sky-600', bg: 'bg-sky-50 hover:bg-sky-100', border: 'border-sky-200 hover:border-sky-400' },
    'Matrix Choices': { dot: 'bg-cyan-400', icon: 'text-cyan-600', bg: 'bg-cyan-50 hover:bg-cyan-100', border: 'border-cyan-200 hover:border-cyan-400' },
    'Date & Time': { dot: 'bg-amber-400', icon: 'text-amber-600', bg: 'bg-amber-50 hover:bg-amber-100', border: 'border-amber-200 hover:border-amber-400' },
    'Uploads': { dot: 'bg-teal-400', icon: 'text-teal-600', bg: 'bg-teal-50 hover:bg-teal-100', border: 'border-teal-200 hover:border-teal-400' },
    'Rating Scales': { dot: 'bg-orange-400', icon: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100', border: 'border-orange-200 hover:border-orange-400' },
    'Instructions': { dot: 'bg-rose-400', icon: 'text-rose-600', bg: 'bg-rose-50 hover:bg-rose-100', border: 'border-rose-200 hover:border-rose-400' },
    'Identifier': { dot: 'bg-pink-400', icon: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100', border: 'border-pink-200 hover:border-pink-400' },
    'Legal & Consent': { dot: 'bg-fuchsia-400', icon: 'text-fuchsia-600', bg: 'bg-fuchsia-50 hover:bg-fuchsia-100', border: 'border-fuchsia-200 hover:border-fuchsia-400' },
    'Prefill': { dot: 'bg-blue-400', icon: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200 hover:border-blue-400' },
    'Advanced': { dot: 'bg-slate-400', icon: 'text-slate-600', bg: 'bg-slate-50 hover:bg-slate-100', border: 'border-slate-200 hover:border-slate-400' },
    'AI': { dot: 'bg-purple-400', icon: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100', border: 'border-purple-200 hover:border-purple-400' },
};

/* ── Column Layout SVG Icons ──────────────────────────────── */
function Col1Icon({ active }: { active: boolean }) {
    const c = active ? '#f97316' : '#94a3b8';
    return (
        <svg width="22" height="18" viewBox="0 0 32 26" fill="none" aria-hidden>
            <rect x="2" y="2" width="28" height="22" rx="3" stroke={c} strokeWidth="1.8" />
        </svg>
    );
}
function Col2Icon({ active }: { active: boolean }) {
    const c = active ? '#f97316' : '#94a3b8';
    return (
        <svg width="22" height="18" viewBox="0 0 32 26" fill="none" aria-hidden>
            <rect x="2" y="2" width="12" height="22" rx="3" stroke={c} strokeWidth="1.8" />
            <rect x="18" y="2" width="12" height="22" rx="3" stroke={c} strokeWidth="1.8" />
        </svg>
    );
}
function Col3Icon({ active }: { active: boolean }) {
    const c = active ? '#f97316' : '#94a3b8';
    return (
        <svg width="22" height="18" viewBox="0 0 32 26" fill="none" aria-hidden>
            <rect x="1" y="2" width="8.5" height="22" rx="2.5" stroke={c} strokeWidth="1.8" />
            <rect x="11.75" y="2" width="8.5" height="22" rx="2.5" stroke={c} strokeWidth="1.8" />
            <rect x="22.5" y="2" width="8.5" height="22" rx="2.5" stroke={c} strokeWidth="1.8" />
        </svg>
    );
}

const GRID_TILES: { n: 1 | 2 | 3; Icon: (p: { active: boolean }) => JSX.Element }[] = [
    { n: 1, Icon: Col1Icon },
    { n: 2, Icon: Col2Icon },
    { n: 3, Icon: Col3Icon },
];

/* ── Chip field item (compact, for grid layout) ───────────── */
function FieldChip({ field, onClick }: { field: FieldTemplate; onClick: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `topbar-${field.type}`,
        data: { type: 'sidebar-field', fieldType: field.type, fieldLabel: field.label },
    });

    const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[field.icon] ?? Icons.FileText;
    const colors = CAT_COLOR[field.category] ?? {
        icon: 'text-gray-500',
        bg: 'bg-gray-50 hover:bg-gray-100',
        border: 'border-gray-200 hover:border-gray-400',
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            title={field.label}
            className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md border bg-white
        cursor-grab active:cursor-grabbing select-none transition-all duration-100
        ${isDragging ? 'opacity-30 scale-95 shadow-md' : `${colors.bg} ${colors.border} hover:shadow-sm`}
      `}
            style={{ minWidth: 0 }}
        >
            <Icon size={12} className={`flex-shrink-0 ${colors.icon}`} strokeWidth={2} />
            <span className="text-[11px] font-medium text-gray-700 truncate leading-none">{field.label}</span>
            {field.isNew && (
                <span className="flex-shrink-0 text-[8px] font-bold text-blue-600 bg-blue-50 px-1 rounded uppercase leading-tight">
                    New
                </span>
            )}
        </div>
    );
}

interface FieldTopbarProps {
    onAddGridRow: (columns: 1 | 2 | 3) => void;
    onAddField: (type: FieldType) => void;
}

export default function FieldTopbar({ onAddGridRow, onAddField }: FieldTopbarProps) {
    const [search, setSearch] = useState('');
    const [showSmartScan, setShowSmartScan] = useState(false);

    const filteredFields = useMemo(() => {
        const q = search.toLowerCase().trim();
        return q
            ? fieldTemplates.filter(f =>
                f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
            )
            : fieldTemplates;
    }, [search]);

    const visibleFields = filteredFields.filter(f => f.type !== 'smart_scan');

    return (
        <>
            {/*
        Two-row grid topbar.
        Row 1 (top): Layout pickers  |  Search  |  Smart Scan
        Row 2 (bottom): All field chips in a wrapping flex/grid
      */}
            <div
                className="shrink-0 bg-white border-b border-gray-200 shadow-sm z-10"
                style={{ width: '100%' }}
            >
                {/* ── Row 1: Controls ───────────────────────────── */}
                <div className="flex items-center gap-3 px-3 py-1.5 border-b border-gray-100">
                    {/* Grid layout pickers */}
                    <div className="flex items-center gap-0.5 border-r border-gray-200 pr-3">
                        {GRID_TILES.map(({ n, Icon }) => (
                            <button
                                key={n}
                                onClick={() => onAddGridRow(n)}
                                title={`Add ${n}-column row`}
                                className="p-1.5 rounded-md hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
                            >
                                <Icon active={false} />
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-44 flex-shrink-0">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search fields..."
                            className="w-full pl-7 pr-6 py-1 bg-gray-50 border border-gray-200 rounded-md text-[12px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>

                    {/* Smart Scan — right-aligned */}
                    <div className="ml-auto">
                        <div
                            onClick={() => setShowSmartScan(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 border-dashed border-purple-300 bg-purple-50 cursor-pointer hover:border-purple-400 hover:bg-purple-100 transition-colors"
                        >
                            <Icons.Sparkles size={12} className="text-purple-600 flex-shrink-0" />
                            <span className="text-[11px] font-semibold text-purple-700 whitespace-nowrap">Smart Scan</span>
                        </div>
                    </div>
                </div>

                {/* ── Row 2: Field chips grid ────────────────────── */}
                <div
                    className="px-3 py-1.5"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                        gap: '4px',
                        maxHeight: '72px',
                        overflowY: 'auto',
                    }}
                >
                    {visibleFields.map(field => (
                        <FieldChip
                            key={field.id}
                            field={field}
                            onClick={() => onAddField(field.type)}
                        />
                    ))}
                </div>
            </div>

            {showSmartScan && <SmartScanModal onClose={() => setShowSmartScan(false)} />}
        </>
    );
}
