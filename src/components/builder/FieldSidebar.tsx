import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Search, X } from 'lucide-react';
import { fieldTemplates } from '../../data/mockData';
import { FieldTemplate, FieldType } from '../../types';
import { useDraggable } from '@dnd-kit/core';
import SmartScanModal from './SmartScanModal';

/* ─── Category meta ─────────────────────────────────────────── */
const CAT_META: Record<string, { color: string; bg: string }> = {
  'Basic Info': { color: '#10b981', bg: '#ecfdf5' },
  'Textbox': { color: '#6366f1', bg: '#eef2ff' },
  'Number': { color: '#8b5cf6', bg: '#f5f3ff' },
  'Choice': { color: '#0ea5e9', bg: '#f0f9ff' },
  'Matrix Choices': { color: '#06b6d4', bg: '#ecfeff' },
  'Date & Time': { color: '#f59e0b', bg: '#fffbeb' },
  'Uploads': { color: '#14b8a6', bg: '#f0fdfa' },
  'Rating Scales': { color: '#f97316', bg: '#fff7ed' },
  'Instructions': { color: '#ef4444', bg: '#fef2f2' },
  'Identifier': { color: '#ec4899', bg: '#fdf2f8' },
  'Legal & Consent': { color: '#a855f7', bg: '#faf5ff' },
  'Prefill': { color: '#3b82f6', bg: '#eff6ff' },
  'Advanced': { color: '#64748b', bg: '#f8fafc' },
  'AI': { color: '#7c3aed', bg: '#f5f3ff' },
};

/* ─── Grid layout picker card ───────────────────────────────── */
function GridCard({ cols, onClick }: { cols: 1 | 2 | 3; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2.5 p-3 rounded-2xl border border-gray-100 bg-white hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all duration-200 group h-[100px]"
    >
      <div className="flex gap-1 items-center justify-center h-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-4.5 rounded-[1px] border-[1.5px] border-amber-400/80 bg-white shadow-[1px_1px_0px_rgba(251,191,36,0.1)]"
            style={{ width: '10px', height: '18px' }}
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-gray-500 group-hover:text-indigo-600">
        {cols}-Column
      </span>
    </button>
  );
}

/* ─── Draggable field card ───────────────────────────────────── */
function FieldCard({ field, onClick }: { field: FieldTemplate; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${field.type}`,
    data: { type: 'sidebar-field', fieldType: field.type, fieldLabel: field.label },
  });

  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[field.icon] ?? Icons.FileText;
  const meta = CAT_META[field.category] ?? { color: '#64748b', bg: '#f8fafc' };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-2.5 p-3 rounded-2xl border border-gray-100 bg-white
        cursor-grab active:cursor-grabbing select-none transition-all duration-200 group shadow-sm hover:shadow-md hover:border-indigo-300
        h-[105px]
        ${isDragging ? 'opacity-30' : ''}
      `}
    >
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ background: meta.bg }}
      >
        <Icon size={20} style={{ color: meta.color }} strokeWidth={2} />
      </div>

      <span className="text-[13px] font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight">
        {field.label}
      </span>

      {field.isNew && (
        <span
          className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase bg-blue-100 text-blue-600 tracking-tighter"
        >
          New
        </span>
      )}
    </div>
  );
}

/* ─── Category section ──────────────────────────────────────── */
function CategorySection({
  category,
  fields,
  onAddField,
}: {
  category: string;
  fields: FieldTemplate[];
  onAddField: (type: FieldType) => void;
}) {

  return (
    <div className="mb-8">
      <div className="px-1 mb-4">
        <span className="text-[15px] font-bold text-slate-800">
          {category}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {fields.map(f => (
          <FieldCard key={f.id} field={f} onClick={() => onAddField(f.type)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main sidebar ──────────────────────────────────────────── */
interface FieldSidebarProps {
  onAddGridRow: (columns: 1 | 2 | 3) => void;
  onAddField: (type: FieldType) => void;
}

export default function FieldSidebar({ onAddGridRow, onAddField }: FieldSidebarProps) {
  const [search, setSearch] = useState('');
  const [showSmartScan, setShowSmartScan] = useState(false);

  const fields = useMemo(
    () => fieldTemplates.filter(f => f.type !== 'smart_scan'),
    [],
  );

  const filteredFields = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q ? fields.filter(f => f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)) : fields;
  }, [search, fields]);

  const grouped = useMemo(() => {
    const map: Record<string, FieldTemplate[]> = {};
    filteredFields.forEach(f => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [filteredFields]);

  return (
    <>
      <div
        className="flex flex-col h-full bg-slate-50/50"
        style={{
          width: 280,
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
        }}
      >
        {/* Search */}
        <div className="px-4 py-4 shrink-0 bg-white border-b border-gray-100">
          <div className="relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-11 pr-9 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 field-sidebar-scroll">

          {/* Grid layout pickers */}
          {!search && (
            <div className="mb-8">
              <p className="px-1 mb-3 text-[14px] font-semibold text-gray-800">Grid</p>
              <div className="grid grid-cols-3 gap-2.5">
                {([1, 2, 3] as const).map(n => (
                  <GridCard key={n} cols={n} onClick={() => onAddGridRow(n)} />
                ))}
              </div>
            </div>
          )}

          {/* Smart Scan */}
          {(!search || 'smart scan'.includes(search.toLowerCase())) && (
            <div className="mb-8 px-1">
              <button
                onClick={() => setShowSmartScan(true)}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 group shadow-sm"
              >
                <Icons.Sparkles size={18} className="text-purple-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-[14px] font-bold text-purple-700">Smart Scan</span>
              </button>
            </div>
          )}

          {/* Field categories */}
          <div className="px-1">
            {Object.entries(grouped).map(([cat, catFields]) => (
              <CategorySection
                key={cat}
                category={cat}
                fields={catFields}
                onAddField={onAddField}
              />
            ))}
          </div>
        </div>
      </div>

      {showSmartScan && <SmartScanModal onClose={() => setShowSmartScan(false)} />}

      <style>{`
        .field-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .field-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .field-sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .field-sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </>
  );
}
