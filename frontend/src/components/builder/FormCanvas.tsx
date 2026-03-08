import { useState } from 'react';
import { FormField, GridRow, GridSlot, FieldType, WelcomePageConfig } from '../../types';
import { useDroppable } from '@dnd-kit/core';
import { Trash2, ChevronDown, ChevronUp, Star, GripVertical, FileText, LayoutTemplate, Minimize, Maximize, Plus, Image as ImageIcon, Video, UploadCloud } from 'lucide-react';
import * as Icons from 'lucide-react';
import { fieldTemplates } from '../../data/mockData';
import SubformCanvas from './SubformCanvas';

/* ── Field type → icon name + color lookup ───────────────────── */
const FIELD_ICON_MAP = Object.fromEntries(
  fieldTemplates.map(t => [t.type, { icon: t.icon, color: t.color }])
) as Record<string, { icon: string; color: string }>;

function FieldIcon({ type, size = 14 }: { type: FieldType; size?: number }) {
  const meta = FIELD_ICON_MAP[type];
  const Icon = meta
    ? (Icons as unknown as Record<string, Icons.LucideIcon>)[meta.icon] ?? FileText
    : FileText;
  return <Icon size={size} className={meta?.color ?? 'text-gray-400'} strokeWidth={1.9} />;
}

/* ────────────────────────────────────────────────────────────────
   Input with inline left icon
   ──────────────────────────────────────────────────────────────── */
function InputWithIcon({
  type,
  placeholder = 'Enter value',
  inputType = 'text',
}: {
  type: FieldType;
  placeholder?: string;
  inputType?: string;
}) {
  const meta = FIELD_ICON_MAP[type];
  const Icon = meta
    ? (Icons as unknown as Record<string, Icons.LucideIcon>)[meta.icon] ?? null
    : null;

  return (
    <div className="relative">
      {Icon && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon size={13} className={meta?.color ?? 'text-gray-400'} strokeWidth={1.8} />
        </span>
      )}
      <input
        type={inputType}
        placeholder={placeholder}
        disabled
        className={`w-full border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400 py-2 pr-3 ${Icon ? 'pl-8' : 'px-3'
          }`}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Tiny inline field-preview (read-only, no DnD)
   ──────────────────────────────────────────────────────────────── */
function FieldPreview({ field }: { field: FormField }) {
  switch (field.type) {
    case 'textbox': case 'multiline':
      return <InputWithIcon type={field.type} placeholder={field.placeholder || 'Enter value'} />;

    case 'email':
      return <InputWithIcon type="email" placeholder={field.placeholder || 'Your email address'} />;

    case 'phone':
      return <InputWithIcon type="phone" placeholder={field.placeholder || 'Phone number'} />;

    case 'website':
      return <InputWithIcon type="website" placeholder={field.placeholder || 'https://'} />;

    case 'geo_complete':
      return <InputWithIcon type="geo_complete" placeholder={field.placeholder || 'Search location…'} />;

    case 'number': case 'decimal': case 'currency': case 'formula':
      return <InputWithIcon type={field.type} placeholder={field.placeholder || '0'} />;

    case 'name':
      return <InputWithIcon type="name" placeholder={field.placeholder || 'Full name'} />;

    case 'unique_id': case 'random_id': case 'webhook':
      return <InputWithIcon type={field.type} placeholder={field.placeholder || 'Enter value'} />;

    case 'address':
      return (
        <div className="space-y-4 pt-1">
          <div>
            <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Street Address</p>
          </div>
          <div>
            <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Address Line 2</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
              <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">City</p>
            </div>
            <div>
              <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
              <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">State/Region/Province</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
              <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Postal / Zip Code</p>
            </div>
            <div>
              <div className="relative">
                <select disabled className="w-full pl-3 pr-7 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] font-bold text-[#1e293b] appearance-none cursor-not-allowed">
                  <option>-Select-</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                  <Icons.ChevronDown size={14} />
                </div>
              </div>
              <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Country</p>
            </div>
          </div>
        </div>
      );

    case 'dropdown': case 'matrix_dropdown':
      return (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icons.ChevronDown size={13} className="text-sky-500" strokeWidth={1.8} />
          </span>
          <select disabled className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-400 appearance-none">
            <option>Select an option</option>
          </select>
        </div>
      );

    case 'radio': case 'multiple_choice':
      return (
        <div className="space-y-1.5">
          {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <input type="radio" disabled /> {opt}
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-1.5">
          {(field.options || ['Option 1', 'Option 2']).slice(0, 3).map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" disabled /> {opt}
            </label>
          ))}
        </div>
      );

    case 'yes_no':
      return (
        <div className="flex gap-2">
          <button disabled className="px-4 py-1.5 border-2 border-emerald-400 text-emerald-600 rounded-lg text-sm font-semibold">Yes</button>
          <button disabled className="px-4 py-1.5 border-2 border-gray-200 text-gray-400 rounded-lg text-sm font-semibold">No</button>
        </div>
      );

    case 'date':
      return <InputWithIcon type="date" placeholder="DD/MM/YYYY" />;
    case 'time':
      return <InputWithIcon type="time" placeholder="HH:MM AM/PM" />;
    case 'datetime':
      return <InputWithIcon type="datetime" placeholder="MM/DD/YYYY HH:MM AM/PM" />;
    case 'month_year':
      return <InputWithIcon type="month_year" placeholder="Month, Year" />;

    case 'rating':
      return <div className="flex gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-gray-200" />)}</div>;

    case 'slider':
      return (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icons.SlidersHorizontal size={13} className="text-pink-500" strokeWidth={1.8} />
            <span className="text-xs text-gray-400">0 – 100</span>
          </div>
          <input type="range" className="w-full accent-teal-500" disabled />
        </div>
      );

    case 'file': case 'image_upload': case 'audio_video_upload': {
      const UpIcon = field.type === 'image_upload' ? Icons.ImageUp : field.type === 'audio_video_upload' ? Icons.VideoIcon : Icons.FileUp;
      return (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center bg-gray-50 flex flex-col items-center gap-1.5">
          <UpIcon size={18} className="text-emerald-400" strokeWidth={1.5} />
          <p className="text-xs font-medium text-gray-400">Click to upload or drag and drop</p>
        </div>
      );
    }

    case 'signature':
      return (
        <div className="h-16 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center gap-2">
          <Icons.PenLine size={15} className="text-pink-400" strokeWidth={1.5} />
          <span className="text-xs text-gray-400 italic">Sign here</span>
        </div>
      );

    case 'terms': case 'decision_box':
      return (
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5" disabled />
          <span className="text-sm text-gray-500">I agree to the terms and conditions</span>
        </label>
      );

    case 'instructions':
      return <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">{field.helpText || 'Instructions text'}</div>;

    default:
      return <InputWithIcon type={field.type as FieldType} placeholder="Enter value" />;
  }
}

/* ────────────────────────────────────────────────────────────────
   Filled field card inside a slot
   ──────────────────────────────────────────────────────────────── */
function SlotFieldCard({
  field,
  isSelected,
  selectedFieldId,
  onClick,
  onFieldSelect,
  onFieldUpdate,
}: {
  field: FormField;
  isSelected: boolean;
  selectedFieldId: string | null;
  onClick: () => void;
  onFieldSelect: (id: string) => void;
  onFieldUpdate: (id: string, updates: Partial<FormField>) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (field.type === 'subform') {
    return (
      <div
        onClick={onClick}
        className={`rounded-xl border cursor-pointer transition-all bg-white relative overflow-hidden ${isSelected ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <LayoutTemplate size={14} className="text-slate-500" strokeWidth={2} />
            <p className="text-[12.5px] font-bold text-slate-800 leading-none">
              {field.label || 'Subform'}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </p>
            {(field.subFields?.length ?? 0) > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-[1px] rounded-full shrink-0">
                {field.subFields!.length} field{field.subFields!.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setCollapsed(c => !c); }}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            title={collapsed ? 'Expand subform' : 'Collapse subform'}
          >
            {collapsed ? <Maximize size={13} /> : <Minimize size={13} />}
          </button>
        </div>

        {/* Builder body */}
        {!collapsed && (
          <div className="cursor-default" onClick={e => e.stopPropagation()}>
            <SubformCanvas
              subFields={field.subFields ?? []}
              onChange={subFields => onFieldUpdate(field.id, { subFields })}
              selectedFieldId={selectedFieldId}
              onSelectField={onFieldSelect}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border cursor-pointer transition-all p-3.5 bg-white ${isSelected ? 'border-emerald-400 ring-4 ring-emerald-50' : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      {/* Label row with icon */}
      <div className="flex items-center gap-1.5 mb-2">
        <FieldIcon type={field.type} size={13} />
        <p className="text-[12.5px] font-semibold text-gray-800 leading-none">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
      </div>
      <div className="pointer-events-none">
        <FieldPreview field={field} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Droppable column slot
   ──────────────────────────────────────────────────────────────── */
function ColumnSlot({
  rowId,
  slotIndex,
  slot,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
}: {
  rowId: string;
  slotIndex: number;
  slot: GridSlot;
  selectedFieldId: string | null;
  onFieldSelect: (id: string) => void;
  onFieldUpdate: (id: string, updates: Partial<FormField>) => void;
}) {
  const droppableId = `canvas-slot-${rowId}-${slotIndex}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: 'canvas-slot', rowId, slotIndex },
  });

  if (slot.field) {
    return (
      <div ref={setNodeRef} className="flex-1 min-w-0">
        <SlotFieldCard
          field={slot.field}
          isSelected={slot.field.id === selectedFieldId}
          selectedFieldId={selectedFieldId}
          onClick={() => onFieldSelect(slot.field!.id)}
          onFieldSelect={onFieldSelect}
          onFieldUpdate={onFieldUpdate}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-[90px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center
        transition-all duration-150 cursor-default select-none
        ${isOver
          ? 'border-emerald-400 bg-emerald-50/60 text-emerald-600'
          : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/30'
        }
      `}
    >
      <p className="text-[12px] text-center px-4 leading-relaxed font-medium">
        <span className={isOver ? 'text-emerald-600' : 'text-slate-400'}>
          Drag and drop fields here
        </span>
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Grid Row card
   ──────────────────────────────────────────────────────────────── */
function GridRowCard({
  row,
  selectedFieldId,
  onFieldSelect,
  onFieldUpdate,
  onDeleteRow,
}: {
  row: GridRow;
  selectedFieldId: string | null;
  onFieldSelect: (id: string) => void;
  onFieldUpdate: (id: string, updates: Partial<FormField>) => void;
  onDeleteRow: (rowId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);


  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
      {/* Emerald accent left border */}
      <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-emerald-400 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Row header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 pl-4">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-300" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
          <button
            onClick={() => onDeleteRow(row.id)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete row"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Column slots */}
      {!collapsed && (
        <div className="flex gap-3 p-4 ml-1 bg-white">
          {row.slots.map((slot, i) => (
            <ColumnSlot
              key={slot.id}
              rowId={row.id}
              slotIndex={i}
              slot={slot}
              selectedFieldId={selectedFieldId}
              onFieldSelect={onFieldSelect}
              onFieldUpdate={onFieldUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   FormCanvas
   ──────────────────────────────────────────────────────────────── */
interface FormCanvasProps {
  gridRows: GridRow[];
  selectedFieldId: string | null;
  welcomePage?: WelcomePageConfig;
  onWelcomePageUpdate?: (updates: Partial<WelcomePageConfig>) => void;
  onFieldSelect: (fieldId: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<FormField>) => void;
  onDeleteRow: (rowId: string) => void;
}

export default function FormCanvas({
  gridRows,
  selectedFieldId,
  welcomePage,
  onWelcomePageUpdate,
  onFieldSelect,
  onFieldUpdate,
  onDeleteRow,
}: FormCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'form-canvas', data: { type: 'canvas' } });

  const isEmpty = gridRows.length === 0;

  return (
    <div
      className="flex-1 overflow-y-auto p-8"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Canvas card */}
      <div
        ref={setNodeRef}
        className={`
          max-w-4xl mx-auto bg-white rounded-2xl min-h-[560px] transition-all duration-200 mb-12
          ${isOver && isEmpty
            ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-[#F8FAFC] shadow-2xl'
            : 'shadow-[0_8px_32px_rgba(15,23,42,0.06)] border border-slate-100'
          }
        `}
      >
        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="w-3 h-3 rounded-full bg-slate-200" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Form Preview</span>
          </div>
          <span className="text-[12px] text-slate-400 font-bold bg-white px-2.5 py-1 rounded-md border border-slate-100 shadow-sm">
            {gridRows.length} {gridRows.length === 1 ? 'row' : 'rows'}
          </span>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Welcome Page Toggle & Editor */}
          {onWelcomePageUpdate && (
            <div className={`mb-6 ${isEmpty ? 'mt-2' : ''}`}>
              {!welcomePage?.enabled ? (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-dashed border-gray-300" />
                  </div>
                  <div className="relative flex justify-center">
                    <button
                      onClick={() => onWelcomePageUpdate({ enabled: true })}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-emerald-500 bg-white text-[13px] font-bold text-emerald-600 hover:bg-emerald-50 hover:shadow-md transition-all shadow-sm"
                    >
                      <Plus size={15} strokeWidth={2.5} /> Welcome Page
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Layout Toggles */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => onWelcomePageUpdate({ layout: 'center' })}
                        className={`p-2 rounded-l-lg transition-colors ${welcomePage.layout !== 'left' ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'text-gray-400 hover:bg-gray-50 border border-transparent'}`}
                      >
                        <div className="w-6 h-4 border-2 border-current rounded-sm flex flex-col items-center justify-center gap-[2px]">
                          <div className="w-3 h-1 bg-current rounded-sm" />
                          <div className="w-4 h-0.5 bg-current rounded-sm" />
                        </div>
                      </button>
                      <button
                        onClick={() => onWelcomePageUpdate({ layout: 'left' })}
                        className={`p-2 rounded-r-lg transition-colors ${welcomePage.layout === 'left' ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'text-gray-400 hover:bg-gray-50 border border-transparent'}`}
                      >
                        <div className="w-6 h-4 border-2 border-current rounded-sm flex items-center justify-start gap-[2px] pl-[2px]">
                          <div className="w-2 h-2 bg-current rounded-sm" />
                          <div className="w-2 h-0.5 bg-current rounded-sm" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Expand / Collapse Header Arrow */}
                  <div className="relative w-full z-10 flex justify-center -mb-3">
                    <button
                      onClick={() => onWelcomePageUpdate({ enabled: false })}
                      className="w-10 h-6 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                      title="Remove Welcome Page"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>

                  {/* Welcome Page Editor Card */}
                  <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5 relative pt-8">
                    {/* Media Placeholder */}
                    <div className="border border-dashed border-gray-300 bg-[#FAFBFC] rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="relative flex justify-center items-center h-16 w-32">
                        <div className="absolute left-4 top-2 bg-green-100 p-2 rounded-lg text-green-500 transform -rotate-6 shadow-sm">
                          <ImageIcon size={20} />
                        </div>
                        <div className="absolute right-4 top-4 bg-pink-100 p-2 rounded-lg text-pink-500 transform rotate-6 shadow-sm">
                          <Video size={20} />
                        </div>
                        <div className="relative z-10 bg-blue-50 p-3 rounded-full text-blue-500 shadow-sm border border-blue-100">
                          <UploadCloud size={20} />
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-gray-500 mt-2">Upload Image / Embed Video</p>
                    </div>

                    {/* Rich Text Placeholder */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-white border-b border-gray-200">
                        {[
                          <Icons.Bold size={14} />, <Icons.Italic size={14} />, <Icons.Underline size={14} />, <Icons.Strikethrough size={14} />,
                          'MS Sans Serif', '16px', <Icons.AlignLeft size={14} />, <Icons.AlignCenter size={14} />,
                          <Icons.List size={14} />, <Icons.ListOrdered size={14} />, <Icons.Type size={14} />,
                          <Icons.Subscript size={14} />, <Icons.Superscript size={14} />, <Icons.Quote size={14} />,
                          <Icons.Eraser size={14} />, <Icons.Link size={14} />, <Icons.ListMinus size={14} />, <Icons.LayoutList size={14} />
                        ].map((item, i) => (
                          <button key={i} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 text-[12px] font-medium flex items-center justify-center">
                            {item}
                          </button>
                        ))}
                      </div>
                      <div
                        contentEditable
                        className="w-full min-h-[120px] p-4 text-[13px] text-gray-700 outline-none empty:before:content-['Add_content...'] empty:before:text-gray-400 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isEmpty ? (
            /* ── Empty state ── */
            <div className={`
              flex flex-col items-center justify-center min-h-[430px]
              rounded-xl border-2 border-dashed transition-all duration-200
              ${isOver ? 'border-teal-300 bg-teal-50/40' : 'border-gray-200 bg-gray-50/50'}
            `}>
              {/* Illustration */}
              <div className={`mb-5 transition-transform duration-200 ${isOver ? 'scale-110' : ''}`}>
                <svg width="80" height="72" viewBox="0 0 80 72" fill="none">
                  <rect x="4" y="4" width="72" height="18" rx="5" fill={isOver ? '#CCFBF1' : '#F1F5F9'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                  <rect x="4" y="28" width="34" height="18" rx="5" fill={isOver ? '#CCFBF1' : '#F1F5F9'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                  <rect x="42" y="28" width="34" height="18" rx="5" fill={isOver ? '#CCFBF1' : '#F1F5F9'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                  <rect x="4" y="52" width="22" height="16" rx="4" fill={isOver ? '#CCFBF1' : '#E2E8F0'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                  <rect x="30" y="52" width="22" height="16" rx="4" fill={isOver ? '#CCFBF1' : '#E2E8F0'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                  <rect x="56" y="52" width="20" height="16" rx="4" fill={isOver ? '#CCFBF1' : '#E2E8F0'} stroke={isOver ? '#5EEAD4' : '#CBD5E1'} strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className={`text-[15px] font-semibold mb-1.5 transition-colors ${isOver ? 'text-teal-600' : 'text-gray-600'}`}>
                {isOver ? 'Release to add' : 'Start building your form'}
              </h3>
              <p className="text-[12.5px] text-gray-400 text-center max-w-[280px] leading-relaxed">
                Drag any <strong>field</strong> here to add it as a single-column row, or click a
                <strong> 2/3-Column</strong> layout first for side-by-side fields
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gridRows.map(row => (
                <GridRowCard
                  key={row.id}
                  row={row}
                  selectedFieldId={selectedFieldId}
                  onFieldSelect={onFieldSelect}
                  onFieldUpdate={onFieldUpdate}
                  onDeleteRow={onDeleteRow}
                />
              ))}

              {/* Add-another hint */}
              <div className={`
                h-12 rounded-xl border-2 border-dashed flex items-center justify-center
                transition-all duration-200
                ${isOver ? 'border-teal-300 bg-teal-50/30 text-teal-500' : 'border-gray-100 text-gray-300'}
                `}>
                <span className="text-[12px] font-bold uppercase tracking-wider">
                  {isOver ? '↓ Drop here to add a row' : 'Drag a field here, or click 2/3-Column'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
