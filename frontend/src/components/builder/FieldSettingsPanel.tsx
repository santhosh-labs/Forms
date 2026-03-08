import { useState, useEffect } from 'react';
import { X, Trash2, GripVertical, Eye, EyeOff, Info, Menu, PlusCircle, MinusCircle, Copy } from 'lucide-react';
import * as Icons from 'lucide-react';
import { FormField, FieldType } from '../../types';

interface FieldSettingsPanelProps {
  field: FormField | null;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onClose: () => void;
}

/* ─── Address element row ────────────────────────────────────── */
const DEFAULT_ADDRESS_ELEMENTS = [
  'Street Address', 'Address Line 2', 'City',
  'State/Region/Province', 'Postal / Zip Code', 'Country',
];

function AddressElement({ label, mandatory, visible, onToggleVisible, onToggleMandatory }:
  { label: string; mandatory: boolean; visible: boolean; onToggleVisible: () => void; onToggleMandatory: () => void }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border border-slate-200 rounded px-2.5 bg-white group hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
      <GripVertical size={13} className="text-slate-300 cursor-move shrink-0" />
      <span className="flex-1 text-[12px] font-medium text-slate-700">{label}</span>
      <button onClick={onToggleVisible} className="p-1 text-slate-400 hover:text-emerald-600 shrink-0">
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
      <input type="checkbox" checked={mandatory} onChange={onToggleMandatory}
        className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-600 cursor-pointer shrink-0" />
    </div>
  );
}

/* ─── Address-specific properties ────────────────────────────── */
function AddressProperties({ field, onUpdate }: { field: FormField; onUpdate: (updates: Partial<FormField>) => void }) {
  const elements = field.addressElements || DEFAULT_ADDRESS_ELEMENTS.map(l => ({ label: l, visible: true, mandatory: false }));
  const showLabels = field.showAddressLabels ?? true;
  const mapService = field.mapService || 'none';
  const stateInputMethod = field.mapInputMethod || 'text';

  return (
    <>
      {/* Countries Configuration */}
      <div className="border-t border-slate-100 pt-4 space-y-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Allowed Countries</label>
          <input
            type="text"
            value={field.allowedCountries?.join(', ') || 'All countries'}
            onChange={e => onUpdate({ allowedCountries: e.target.value.split(',').map(s => s.trim()) })}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-[12.5px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Default Country</label>
          <select
            value={field.defaultCountry || ''}
            onChange={e => onUpdate({ defaultCountry: e.target.value })}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-[12.5px] bg-white outline-none focus:ring-1 focus:ring-emerald-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
          >
            <option value="">-Select-</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>

      {/* Address Elements */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Address Elements</h4>
          <span className="text-[10px] font-bold uppercase text-slate-400">Mandatory</span>
        </div>
        <div className="space-y-1.5">
          {elements.map((el, i) => (
            <AddressElement
              key={el.label}
              label={el.label}
              visible={el.visible}
              mandatory={el.mandatory}
              onToggleVisible={() => onUpdate({ addressElements: elements.map((e, j) => j === i ? { ...e, visible: !e.visible } : e) })}
              onToggleMandatory={() => onUpdate({ addressElements: elements.map((e, j) => j === i ? { ...e, mandatory: !e.mandatory } : e) })}
            />
          ))}
        </div>

        {/* Show Elements Label + Set Character Limit */}
        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showLabels} onChange={() => onUpdate({ showAddressLabels: !showLabels })}
              className="w-3.5 h-3.5 rounded border-slate-300 accent-emerald-600" />
            <span className="text-[12px] text-slate-600 font-medium">Show Elements Label</span>
          </label>
        </div>
      </div>

      {/* Address Auto-fill */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5 mb-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Auto-fill & Validation</h4>
          <Info size={12} className="text-slate-400" />
        </div>
        <p className="text-[11.5px] text-slate-500 mb-2">Select Map Service</p>
        <div className="flex gap-2">
          {([['none', 'None', '🚫'], ['google', 'Google Maps', '📍']] as const).map(([val, label, icon]) => (
            <button key={val} onClick={() => onUpdate({ mapService: val })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-[11px] font-semibold transition-all
                ${mapService === val ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input method */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">State/Region Input Method</p>
        <div className="flex flex-col gap-2">
          {([['text', 'Text Input'], ['auto', 'Auto-generated State List']] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center
                ${stateInputMethod === val ? 'border-emerald-500' : 'border-slate-300'}`}
                onClick={() => onUpdate({ mapInputMethod: val })}>
                {stateInputMethod === val && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </div>
              <span className="text-[12px] font-medium text-slate-600">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Main panel ─────────────────────────────────────────────── */
export default function FieldSettingsPanel({ field, onUpdate, onDelete, onDuplicate, onClose }: FieldSettingsPanelProps) {
  const [pendingLabel, setPendingLabel] = useState(field?.label ?? '');
  const [instructions, setInstructions] = useState(field?.helpText ?? '');

  // Reset local state if the selected field changes
  useEffect(() => {
    setPendingLabel(field?.label ?? '');
    setInstructions(field?.helpText ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field?.id]);

  if (!field) return null;

  const hasOptions = ['dropdown', 'radio', 'checkbox', 'multiple_choice', 'image_choices'].includes(field.type);
  const isAddress = field.type === 'address';
  const isMatrix = field.type.startsWith('matrix_');

  const addOption = () => onUpdate({ options: [...(field.options || []), `Option ${(field.options?.length ?? 0) + 1}`] });
  const updateOption = (i: number, v: string) => { const o = [...(field.options || [])]; o[i] = v; onUpdate({ options: o }); };
  const removeOption = (i: number) => { const o = [...(field.options || [])]; o.splice(i, 1); onUpdate({ options: o }); };

  const addImageChoice = () => onUpdate({ imageChoices: [...(field.imageChoices || []), { id: crypto.randomUUID(), label: 'Label', value: '' }] });
  const updateImageChoice = (id: string, updates: any) => onUpdate({ imageChoices: field.imageChoices?.map(c => c.id === id ? { ...c, ...updates } : c) });
  const removeImageChoice = (id: string) => onUpdate({ imageChoices: field.imageChoices?.filter(c => c.id !== id) });

  const defaultMatrixRows = ['First Question', 'Second Question', 'Third Question'];
  const defaultMatrixCols = ['Answer A', 'Answer B', 'Answer C'];
  const mRows = field.matrixRows?.length ? field.matrixRows : defaultMatrixRows;
  const mCols = field.matrixColumns?.length ? field.matrixColumns : defaultMatrixCols;

  const addMatrixRow = () => onUpdate({ matrixRows: [...mRows, `Question ${mRows.length + 1}`] });
  const updateMatrixRow = (i: number, v: string) => { const r = [...mRows]; r[i] = v; onUpdate({ matrixRows: r }); };
  const removeMatrixRow = (i: number) => { const r = [...mRows]; r.splice(i, 1); onUpdate({ matrixRows: r }); };

  const StringFromCharCode = (code: number) => String.fromCharCode(code);
  const addMatrixCol = () => onUpdate({ matrixColumns: [...mCols, `Answer ${StringFromCharCode(65 + mCols.length)}`] });
  const updateMatrixCol = (i: number, v: string) => { const c = [...mCols]; c[i] = v; onUpdate({ matrixColumns: c }); };
  const removeMatrixCol = (i: number) => { const c = [...mCols]; c.splice(i, 1); onUpdate({ matrixColumns: c }); };

  const handleSave = () => {
    onUpdate({ label: pendingLabel, helpText: instructions });
    onClose();
  };

  const syncLabelAndHelpText = (newLabel?: string, newHelpText?: string) => {
    if (newLabel !== undefined) setPendingLabel(newLabel);
    if (newHelpText !== undefined) setInstructions(newHelpText);
    onUpdate({
      label: newLabel !== undefined ? newLabel : pendingLabel,
      helpText: newHelpText !== undefined ? newHelpText : instructions
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.04)] z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
        <h3 className="text-sm font-bold text-gray-900 tracking-wide">Properties</h3>
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <button onClick={onDuplicate} title="Duplicate field" className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-500">
              <Copy size={15} />
            </button>
          )}
          <button onClick={onDelete} title="Delete field" className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500">
            <Trash2 size={15} />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors ml-1">
            <X size={15} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Field Label */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-red-500">Field Label</label>
          </div>
          <input type="text" value={pendingLabel} onChange={e => syncLabelAndHelpText(e.target.value, undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input type="checkbox" checked={field.hideLabel || false} onChange={e => onUpdate({ hideLabel: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 accent-emerald-600" />
            <span className="text-xs text-gray-600">Hide Field Label</span>
          </label>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instructions</label>
          <textarea value={instructions} onChange={e => syncLabelAndHelpText(undefined, e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        </div>

        {/* Hover Text */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hover Text</label>
          <input type="text" value={field.hoverText || ''} onChange={e => onUpdate({ hoverText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>

        {/* Matrix Choice Sub-Type configuration */}
        {isMatrix && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Choice Type</label>
            <select
              value={field.type}
              onChange={e => onUpdate({ type: e.target.value as FieldType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="matrix_radio">Radio</option>
              <option value="matrix_checkbox">Checkbox</option>
              <option value="matrix_dropdown">Dropdown</option>
              <option value="matrix_textbox">Textbox</option>
              <option value="matrix_number">Number</option>
              <option value="matrix_currency">Currency</option>
            </select>
          </div>
        )}

        {/* Required toggle */}
        <div className="space-y-4 py-3 border-y border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Required Field</span>
            <button onClick={() => onUpdate({ required: !field.required })}
              className={`relative w-10 h-5 rounded-full transition-colors ${field.required ? 'bg-emerald-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          {field.required && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Custom Error Message</label>
              <input type="text" value={field.customErrorMessage || ''} onChange={e => onUpdate({ customErrorMessage: e.target.value })}
                placeholder="This field is required"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          )}
        </div>

        {/* ── Default Value ── */}
        {!['instructions', 'subform', 'payment', 'file', 'image_upload', 'matrix_radio', 'matrix_checkbox', 'matrix_dropdown', 'matrix_textbox', 'matrix_number', 'matrix_currency'].includes(field.type) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Value</label>
            {field.type === 'yes_no' ? (
              <select value={String(field.defaultValue || '')} onChange={e => onUpdate({ defaultValue: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">None</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input type={field.type === 'number' || field.type === 'decimal' ? 'number' : 'text'}
                value={String(field.defaultValue || '')} onChange={e => onUpdate({ defaultValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            )}
          </div>
        )}


        {/* Address-specific elements */}
        {isAddress && <AddressProperties field={field} onUpdate={onUpdate} />}

        {/* Matrix Questions and Answers Configuration */}
        {isMatrix && (
          <div className="space-y-6">
            {/* Matrix Questions (Rows) */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">Questions</label>
              </div>
              <label className="flex items-center gap-2 mb-4 cursor-pointer px-1">
                <input type="checkbox" checked={field.matrixRowsRequired || false} onChange={e => onUpdate({ matrixRowsRequired: e.target.checked })} className="w-4 h-4 border border-gray-300 rounded bg-white accent-emerald-600" />
                <span className="text-[13px] font-medium text-gray-600">Mark All as Mandatory</span>
              </label>

              <div className="space-y-3">
                {mRows.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 border border-gray-300 rounded bg-white shrink-0"></div>
                    <span className="text-[13px] font-medium text-blue-600 w-5">R{i + 1}</span>
                    <input type="text" value={opt} onChange={e => updateMatrixRow(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-[13px] outline-none focus:ring-1 focus:ring-emerald-500" />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => addMatrixRow()} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                        <PlusCircle size={18} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => removeMatrixRow(i)} className="text-red-500 hover:text-red-600 transition-colors" disabled={mRows.length <= 1}>
                        <MinusCircle size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Answers (Cols) */}
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">Answers</label>
              </div>
              <label className="flex items-center gap-2 mb-4 cursor-pointer px-1">
                <input type="checkbox" checked={field.matrixColsRequired || false} onChange={e => onUpdate({ matrixColsRequired: e.target.checked })} className="w-4 h-4 rounded border-gray-300 accent-emerald-600" />
                <span className="text-[13px] font-medium text-gray-500">Mark All as Mandatory</span>
              </label>

              <div className="space-y-3">
                {mCols.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-gray-200 shrink-0"></div>
                    <span className="text-[13px] font-medium text-blue-600 w-5">C{i + 1}</span>
                    <div className="flex-1 relative">
                      <input type="text" value={opt} onChange={e => updateMatrixCol(i, e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 border border-gray-200 rounded text-[13px] outline-none focus:ring-1 focus:ring-emerald-500" />
                      <Menu size={15} strokeWidth={1.5} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => addMatrixCol()} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                        <PlusCircle size={18} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => removeMatrixCol(i)} className="text-red-500 hover:text-red-600 transition-colors" disabled={mCols.length <= 1}>
                        <MinusCircle size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 text-[13px] font-medium">
                <button
                  onClick={() => {
                    const items = window.prompt("Enter comma-separated predefined answers:", "Yes, No, Maybe");
                    if (items) onUpdate({ matrixColumns: items.split(',').map(s => s.trim()) });
                  }}
                  className="text-emerald-600 hover:underline"
                >
                  Import predefined answers
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Image Choices specific ── */}
        {field.type === 'image_choices' && (
          <div className="border-t border-gray-100 pt-5 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Choice Type</label>
                <select
                  value={field.imageChoiceType || 'single'}
                  onChange={e => onUpdate({ imageChoiceType: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-[13px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="single">Single-Select</option>
                  <option value="multiple">Multi-Select</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Value type</label>
                <select
                  value={field.imageValueType || 'numeric'}
                  onChange={e => onUpdate({ imageValueType: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded text-[13px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="text">Textual</option>
                  <option value="numeric">Numeric</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {field.imageValueType === 'numeric' && (
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Allowed Decimal Places</label>
                <select
                  value={field.imageDecimalPlaces || 2}
                  onChange={e => onUpdate({ imageDecimalPlaces: parseInt(e.target.value) })}
                  className="w-20 px-3 py-1.5 border border-gray-200 rounded text-[13px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="0">0</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="grid grid-cols-[30px_1fr_1fr_1fr_50px] gap-2 mb-2 px-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <div></div>
                <div>Image</div>
                <div>Label</div>
                <div>{field.imageValueType === 'numeric' ? 'Numeric' : 'Value'}</div>
                <div></div>
              </div>
              <div className="space-y-2">
                {(field.imageChoices || [{ id: '1', label: 'Label', value: '' }]).map((choice, i) => (
                  <div key={choice.id} className="grid grid-cols-[30px_1fr_1fr_1fr_50px] gap-2 items-center">
                    <div className="flex justify-center">
                      <div className={`w-4 h-4 rounded-full border border-gray-300 bg-white ${i === 0 ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}></div>
                    </div>
                    <button className="flex items-center justify-center gap-1.5 px-2 py-1.5 border border-gray-200 rounded bg-white text-[11px] font-medium text-gray-500 hover:border-gray-300">
                      <Icons.ImagePlus size={14} /> Upload
                    </button>
                    <input
                      type="text"
                      value={choice.label}
                      onChange={e => updateImageChoice(choice.id, { label: e.target.value })}
                      placeholder="Label"
                      className="px-2 py-1.5 border border-gray-200 rounded text-[12px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={choice.value}
                      onChange={e => updateImageChoice(choice.id, { value: e.target.value })}
                      placeholder="Value"
                      className="px-2 py-1.5 border border-gray-200 rounded text-[12px] bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={addImageChoice} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                        <PlusCircle size={18} strokeWidth={1.5} />
                      </button>
                      <button onClick={() => removeImageChoice(choice.id)} className="text-red-500 hover:text-red-600 transition-colors" disabled={(field.imageChoices?.length || 1) <= 1}>
                        <MinusCircle size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Options (dropdown / radio / checkbox) */}
        {hasOptions && !isMatrix && field.type !== 'image_choices' && (
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-900">Choices</label>
            </div>
            <div className="space-y-3">
              {(field.options || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Menu size={15} strokeWidth={1.5} className="text-gray-400 shrink-0 cursor-move" />
                  <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-[13px] outline-none focus:ring-1 focus:ring-emerald-500" />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => addOption()} className="text-emerald-500 hover:text-emerald-600 transition-colors">
                      <PlusCircle size={18} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => removeOption(i)} disabled={(field.options || []).length <= 1} className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-50">
                      <MinusCircle size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start flex-col gap-2">
              <button
                onClick={() => {
                  const items = window.prompt("Enter comma-separated choices:", "Option 1, Option 2, Option 3");
                  if (items) onUpdate({ options: items.split(',').map(s => s.trim()) });
                }}
                className="text-[13px] font-medium text-emerald-600 hover:underline"
              >
                Import Predefined Choices
              </button>
              <button
                onClick={() => onUpdate({ options: [] })}
                className="text-[13px] font-medium text-emerald-600 hover:underline"
              >
                Clear All
              </button>

              {field.type === 'dropdown' && (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={field.allowMultipleChoices || false} onChange={e => onUpdate({ allowMultipleChoices: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 accent-emerald-600" />
                  <span className="text-[13px] font-medium text-gray-600">Allow Multiple Selections</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Placeholder - for simple text fields */}
        {!isAddress && !hasOptions && !['instructions', 'rating', 'file', 'image_upload', 'audio_video_upload', 'signature', 'terms', 'decision_box', 'yes_no', 'slider'].includes(field.type) && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Placeholder <span className="normal-case font-normal text-gray-400">(Optional)</span>
            </label>
            <input type="text" value={field.placeholder || ''} onChange={e => onUpdate({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        )}

        {/* ── Textbox specific ── */}
        {['textbox', 'multiline', 'email', 'phone', 'website'].includes(field.type) && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Length</label>
                <input type="number" value={field.minLength || ''} onChange={e => onUpdate({ minLength: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Length</label>
                <input type="number" value={field.maxLength || ''} onChange={e => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>
        )}

        {/* ── Phone specific ── */}
        {field.type === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Format</label>
              <select value={field.phoneFormat || 'international'} onChange={e => onUpdate({ phoneFormat: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="international">International</option>
                <option value="us">US (XXX-XXX-XXXX)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country Code</label>
              <select value={field.defaultCountryCode || 'US'} onChange={e => onUpdate({ defaultCountryCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="US">United States (+1)</option>
                <option value="GB">United Kingdom (+44)</option>
                <option value="IN">India (+91)</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Limits (Number / Decimal / Slider) ── */}
        {['number', 'decimal', 'slider'].includes(field.type) && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum</label>
              <input type="number"
                value={field.minLimit || ''}
                onChange={e => onUpdate({ minLimit: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Maximum</label>
              <input type="number"
                value={field.maxLimit || ''}
                onChange={e => onUpdate({ maxLimit: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        )}

        {/* ── Slider Step ── */}
        {field.type === 'slider' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Step Size</label>
            <input type="number"
              value={field.step || 1}
              onChange={e => onUpdate({ step: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        )}

        {/* ── Number Prefix/Suffix ── */}
        {['number', 'decimal', 'currency'].includes(field.type) && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prefix</label>
              <input type="text"
                value={field.prefix || ''}
                onChange={e => onUpdate({ prefix: e.target.value || undefined })}
                placeholder="$"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Suffix</label>
              <input type="text"
                value={field.suffix || ''}
                onChange={e => onUpdate({ suffix: e.target.value || undefined })}
                placeholder="e.g. USD"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        )}

        {/* ── Currency Type ── */}
        {field.type === 'currency' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency Type</label>
            <select
              value={field.currencyType || 'USD'}
              onChange={e => onUpdate({ currencyType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        )}

        {/* ── Date Format ── */}
        {['date', 'datetime'].includes(field.type) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Format</label>
            <select
              value={field.dateFormat || 'MM/DD/YYYY'}
              onChange={e => onUpdate({ dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        )}

        {/* ── Time Format ── */}
        {['time', 'datetime'].includes(field.type) && (
          <div className="space-y-6">
            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">Time Format</label>
              <div className="flex border border-emerald-500 rounded-md overflow-hidden bg-white">
                <button
                  onClick={() => onUpdate({ timeFormat: '12h' })}
                  className={`flex-1 py-1.5 text-[13px] font-medium transition-colors ${field.timeFormat !== '24h' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  12 Hours
                </button>
                <div className="w-[1px] bg-gray-200" />
                <button
                  onClick={() => onUpdate({ timeFormat: '24h' })}
                  className={`flex-1 py-1.5 text-[13px] font-medium transition-colors ${field.timeFormat === '24h' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  24 Hours
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">Minute Interval</label>
              <div className="flex gap-2">
                {[1, 5, 10, 15, 30].map(interval => (
                  <button
                    key={interval}
                    onClick={() => onUpdate({ minuteInterval: interval })}
                    className={`flex items-center justify-center w-[34px] h-[34px] rounded-full border text-[13px] font-medium transition-colors ${field.minuteInterval === interval || (!field.minuteInterval && interval === 1)
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">Initial Value</label>
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col">
                  <select
                    className="w-[65px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    value={field.initialTime?.split(':')[0] || ''}
                    onChange={e => {
                      const hrs = e.target.value;
                      const mins = field.initialTime?.split(':')[1] || '00';
                      const ampm = field.initialTime?.split(':')[2] || 'AM';
                      onUpdate({ initialTime: `${hrs}:${mins}:${ampm}` });
                    }}
                  >
                    <option value="" disabled hidden></option>
                    {[...Array(field.timeFormat === '24h' ? 24 : 12)].map((_, i) => {
                      const v = String(field.timeFormat === '24h' ? i : i + 1).padStart(2, '0');
                      return <option key={v} value={v}>{v}</option>
                    })}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1 text-center">HH</p>
                </div>
                <span className="text-gray-500 font-medium mb-5">:</span>
                <div className="flex flex-col">
                  <select
                    className="w-[65px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                    value={field.initialTime?.split(':')[1] || ''}
                    onChange={e => {
                      const hrs = field.initialTime?.split(':')[0] || '12';
                      const mins = e.target.value;
                      const ampm = field.initialTime?.split(':')[2] || 'AM';
                      onUpdate({ initialTime: `${hrs}:${mins}:${ampm}` });
                    }}
                  >
                    <option value="" disabled hidden></option>
                    {[...Array(60)].map((_, i) => {
                      const v = String(i).padStart(2, '0');
                      return <option key={v} value={v}>{v}</option>
                    })}
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1 text-center">MM</p>
                </div>
                {field.timeFormat !== '24h' && (
                  <>
                    <span className="text-gray-500 font-medium mb-5"> </span>
                    <div className="mb-5">
                      <select
                        className="w-[65px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-700 outline-none focus:ring-1 focus:ring-emerald-500"
                        value={field.initialTime?.split(':')[2] || ''}
                        onChange={e => {
                          const hrs = field.initialTime?.split(':')[0] || '12';
                          const mins = field.initialTime?.split(':')[1] || '00';
                          const ampm = e.target.value;
                          onUpdate({ initialTime: `${hrs}:${mins}:${ampm}` });
                        }}
                      >
                        <option value="" disabled hidden></option>
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </>
                )}
                <button
                  onClick={() => onUpdate({ initialTime: undefined })}
                  className="text-[13px] text-emerald-600 font-medium hover:underline ml-2 mb-5"
                >
                  Reset
                </button>
              </div>

              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={field.autofillTime || false} onChange={e => onUpdate({ autofillTime: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 accent-emerald-600" />
                <span className="text-[13px] font-medium text-gray-600">Autofill Time of Response</span>
              </label>
            </div>

          </div>
        )}

        {/* ── Rating Scale ── */}
        {field.type === 'rating' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Scale Items</label>
              <input type="number"
                value={field.ratingScale || 5}
                onChange={e => onUpdate({ ratingScale: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shape</label>
              <select
                value={field.ratingShape || 'star'}
                onChange={e => onUpdate({ ratingShape: e.target.value as 'star' | 'heart' | 'smile' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="star">★ Star</option>
                <option value="heart">♥ Heart</option>
                <option value="smile">☺ Smile</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Yes/No Labels ── */}
        {field.type === 'yes_no' && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Yes Label</label>
              <input type="text"
                value={field.yesLabel || 'Yes'}
                onChange={e => onUpdate({ yesLabel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">No Label</label>
              <input type="text"
                value={field.noLabel || 'No'}
                onChange={e => onUpdate({ noLabel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        )}

        {/* ── Terms & Conditions / Decision Box ── */}
        {['terms', 'decision_box'].includes(field.type) && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Agreement Text</label>
              <textarea
                value={field.termsText || 'I agree to the terms and conditions'}
                onChange={e => onUpdate({ termsText: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            {field.type === 'terms' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Terms Link (URL)</label>
                <input type="text"
                  value={field.termsLink || ''}
                  onChange={e => onUpdate({ termsLink: e.target.value })}
                  placeholder="https://example.com/terms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            )}
          </div>
        )}

        {/* ── File Upload properties ── */}
        {['file', 'image_upload', 'audio_video_upload'].includes(field.type) && (
          <div className="space-y-6">
            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Allowed File Format(s)</label>
              <input type="text"
                value={field.allowedFileTypes || ''}
                onChange={e => onUpdate({ allowedFileTypes: e.target.value })}
                placeholder="eg. : pdf,txt,doc"
                className="w-full px-3 py-2 border border-gray-200 rounded text-[13px] outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-400" />
              <p className="text-[11px] text-gray-400 mt-1.5">By default, all file types are accepted.</p>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">Upload Limit</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <select
                    value={field.uploadLimitMin || 'N/A'}
                    onChange={e => onUpdate({ uploadLimitMin: e.target.value === 'N/A' ? 'N/A' : parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-600 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="N/A">N/A</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Min</p>
                </div>
                <div className="flex-1">
                  <select
                    value={field.uploadLimitMax || 1}
                    onChange={e => onUpdate({ uploadLimitMax: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-600 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">Max</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">File Size</label>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col">
                  <div className="flex border border-gray-200 rounded overflow-hidden">
                    <input type="number"
                      value={field.fileSizeMin || 0}
                      onChange={e => onUpdate({ fileSizeMin: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 text-[13px] min-w-0 outline-none" />
                    <div className="w-[1px] bg-gray-200" />
                    <select
                      value={field.fileSizeMinUnit || 'KB'}
                      onChange={e => onUpdate({ fileSizeMinUnit: e.target.value as 'KB' | 'MB' | 'GB' })}
                      className="px-2 py-1.5 text-[13px] bg-white text-gray-500 outline-none shrink-0"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Min</p>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex border border-gray-200 rounded overflow-hidden">
                    <input type="number"
                      value={field.fileSizeMax || 20}
                      onChange={e => onUpdate({ fileSizeMax: parseInt(e.target.value) || 20 })}
                      className="w-full px-2 py-1.5 text-[13px] min-w-0 outline-none" />
                    <div className="w-[1px] bg-gray-200" />
                    <select
                      value={field.fileSizeMaxUnit || 'MB'}
                      onChange={e => onUpdate({ fileSizeMaxUnit: e.target.value as 'KB' | 'MB' | 'GB' })}
                      className="px-2 py-1.5 text-[13px] bg-white text-gray-500 outline-none shrink-0"
                    >
                      <option value="KB">KB</option>
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Max</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <label className="block text-[13px] font-semibold text-gray-800 mb-2">File Name Prefix</label>
              <div className="border border-gray-200 rounded min-h-[40px] bg-white flex items-center p-2 relative focus-within:ring-1 focus-within:ring-emerald-500">
                <input
                  type="text"
                  value={field.fileNamePrefix || ''}
                  onChange={e => onUpdate({ fileNamePrefix: e.target.value })}
                  placeholder="e.g. receipt_"
                  className="w-full outline-none text-[13px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex gap-2 border-t border-gray-100">
          {onDuplicate && (
            <button onClick={onDuplicate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all font-medium">
              <Copy size={15} /> Duplicate
            </button>
          )}
          <button onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 rounded-lg transition-all font-medium">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Footer: Cancel / Save */}
      <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
        <button onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors font-medium">
          Cancel
        </button>
        <button onClick={handleSave}
          className="px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold">
          Save
        </button>
      </div>
    </div>
  );
}
