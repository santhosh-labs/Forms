import React, { useState } from 'react';
import { FormField, FieldType } from '../../types';
import { fieldTemplates } from '../../data/mockData';
import * as Icons from 'lucide-react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

/* ─── Compact preview of a single sub-field ─────────────────── */
function SubFieldRow({
    field,
    isSelected,
    onSelect,
    onDelete,
    onLabelChange,
    onToggleRequired,
}: {
    field: FormField;
    isSelected?: boolean;
    onSelect?: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onLabelChange: (label: string) => void;
    onToggleRequired: () => void;
}) {
    const [editing, setEditing] = useState(false);

    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-2 group bg-white border rounded-lg px-3 py-2 cursor-pointer transition-colors ${isSelected ? 'border-teal-400 ring-1 ring-teal-400 bg-teal-50/20' : 'border-gray-200 hover:border-teal-300'
                }`}
        >
            {/* drag handle */}
            <GripVertical size={14} className="text-gray-300 cursor-move shrink-0" />

            {/* label / inline edit */}
            {editing ? (
                <input
                    autoFocus
                    type="text"
                    value={field.label}
                    onChange={e => onLabelChange(e.target.value)}
                    onBlur={() => setEditing(false)}
                    onKeyDown={e => e.key === 'Enter' && setEditing(false)}
                    className="flex-1 text-xs border-b border-teal-400 outline-none text-gray-800 bg-transparent py-0.5"
                />
            ) : (
                <span
                    className="flex-1 text-xs text-gray-700 truncate cursor-text"
                    onClick={() => setEditing(true)}
                >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
            )}

            {/* required toggle */}
            <button
                onClick={onToggleRequired}
                title={field.required ? 'Make optional' : 'Make required'}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 transition-colors
          ${field.required ? 'bg-red-50 text-red-500 border-red-200' : 'text-gray-300 border-gray-200 hover:text-gray-500'}`}
            >
                *
            </button>

            {/* type badge */}
            <span className="text-[10px] text-gray-400 hidden group-hover:block shrink-0">
                {field.type}
            </span>

            {/* delete */}
            <button
                onClick={onDelete}
                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
                <Trash2 size={12} />
            </button>
        </div>
    );
}

/* ─── SubformCanvas ──────────────────────────────────────────── */
interface SubformCanvasProps {
    subFields: FormField[];
    selectedFieldId?: string | null;
    onSelectField?: (id: string) => void;
    onChange: (subFields: FormField[]) => void;
}

export default function SubformCanvas({ subFields, onChange, selectedFieldId, onSelectField }: SubformCanvasProps) {
    const [showPicker, setShowPicker] = useState(false);

    const addField = (type: FieldType, label: string) => {
        const newField: FormField = {
            id: `sub-${Date.now()}`,
            type,
            label,
            required: false,
            position: subFields.length,
            options: ['dropdown', 'radio', 'checkbox', 'multiple_choice'].includes(type)
                ? ['Option 1', 'Option 2']
                : undefined,
        };
        onChange([...subFields, newField]);
        setShowPicker(false);
        onSelectField?.(newField.id);
    };

    const deleteField = (id: string) => {
        onChange(subFields.filter(f => f.id !== id).map((f, i) => ({ ...f, position: i })));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        onChange(subFields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return (
        <div className="p-4 bg-white">
            <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
                {subFields.length === 0 ? (
                    /* ── Empty state ── */
                    <div className="py-8 flex flex-col items-center gap-3 pointer-events-none">
                        <div className="relative w-12 h-12">
                            <div className="absolute top-0 left-3 w-8 h-6 border-2 border-dashed border-slate-300 rounded-md bg-white" />
                            <div className="absolute bottom-0 left-0 w-7 h-6 border-2 border-slate-400 rounded-md bg-white" />
                            <div className="absolute bottom-1 left-5 text-slate-400 font-bold text-base leading-none">+</div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-700">Start building!</p>
                            <p className="text-xs text-gray-400 mt-0.5">Add fields below to build the subform.</p>
                        </div>
                    </div>
                ) : (
                    /* ── Field list ── */
                    <div className="p-3 space-y-2">
                        {subFields.map(f => (
                            <SubFieldRow
                                key={f.id}
                                field={f}
                                isSelected={selectedFieldId === f.id}
                                onSelect={() => onSelectField?.(f.id)}
                                onDelete={(e) => { e.stopPropagation(); deleteField(f.id); }}
                                onLabelChange={label => updateField(f.id, { label })}
                                onToggleRequired={() => updateField(f.id, { required: !f.required })}
                            />
                        ))}
                    </div>
                )}

                {/* ── Field Picker (Inline) ── */}
                {showPicker && (
                    <div className="border-t border-dashed border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-3 gap-y-4 gap-x-3 max-h-[300px] overflow-y-auto px-1">
                            {fieldTemplates.filter(f => f.type !== 'subform').map(field => {
                                const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[field.icon] ?? Icons.FileText;
                                return (
                                    <button
                                        key={field.type}
                                        onClick={() => addField(field.type as FieldType, field.label)}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-gray-600 hover:bg-[#ecfdf5] hover:text-[#10b981] transition-all text-left group"
                                    >
                                        <span className="text-gray-400 group-hover:text-[#10b981] shrink-0 transition-colors">
                                            <Icon size={16} strokeWidth={2} />
                                        </span>
                                        {field.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Add Field Button ── */}
                <div className="border-t border-dashed border-gray-200 bg-teal-50/30 hover:bg-teal-50/60 transition-colors">
                    <button
                        onClick={() => setShowPicker(p => !p)}
                        className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-semibold text-teal-600"
                    >
                        <Plus size={15} /> Add Field
                    </button>
                </div>
            </div>
        </div>
    );
}
