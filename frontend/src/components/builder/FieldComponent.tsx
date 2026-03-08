import { FormField } from '../../types';
import { GripVertical, Star, LayoutTemplate, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FieldComponentProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function FieldComponent({
  field,
  isSelected,
  onClick,
}: FieldComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'canvas-field',
      field
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderFieldPreview = () => {
    switch (field.type) {
      /* ── Text inputs ── */
      case 'textbox':
      case 'multiline':
      case 'email':
      case 'phone':
      case 'website':
      case 'number':
      case 'decimal':
      case 'currency':
      case 'formula':
        return (
          <input type="text" placeholder={field.placeholder || 'Enter value'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50/50" disabled />
        );

      /* ── Name ── */
      case 'name':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['First Name', 'Last Name'].map(p => (
              <div key={p}>
                <input type="text" placeholder={p} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50/50 text-sm" disabled />
                <p className="text-xs text-gray-400 mt-1">{p}</p>
              </div>
            ))}
          </div>
        );

      case 'address': {
        const elements = field.addressElements || [
          'Street Address', 'Address Line 2', 'City',
          'State/Region/Province', 'Postal / Zip Code', 'Country'
        ].map(l => ({ label: l, visible: true, mandatory: false }));

        const isVisible = (label: string) => elements.find(e => e.label === label)?.visible !== false;

        return (
          <div className="space-y-4 pt-1">
            {isVisible('Street Address') && (
              <div>
                <input type="text" className="w-full px-3 py-2 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
                <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Street Address</p>
              </div>
            )}
            {isVisible('Address Line 2') && (
              <div>
                <input type="text" className="w-full px-3 py-2 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
                <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Address Line 2</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isVisible('City') && (
                <div>
                  <input type="text" className="w-full px-3 py-2 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
                  <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">City</p>
                </div>
              )}
              {isVisible('State/Region/Province') && (
                <div>
                  <input type="text" className="w-full px-3 py-2 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
                  <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">State/Region/Province</p>
                </div>
              )}
              {isVisible('Postal / Zip Code') && (
                <div>
                  <input type="text" className="w-full px-3 py-2 border border-[#e2e8f0] rounded bg-white text-[13px]" disabled />
                  <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Postal / Zip Code</p>
                </div>
              )}
              {isVisible('Country') && (
                <div>
                  <div className="relative">
                    <select disabled className="w-full pl-3 pr-7 py-2 border border-[#e2e8f0] rounded bg-white text-[13px] font-bold text-[#1e293b] appearance-none cursor-not-allowed">
                      <option>-Select-</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Country</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      /* ── Dropdown ── */
      case 'dropdown':
        return (
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50/50" disabled>
            <option>Select an option</option>
            {field.options?.map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        );

      /* ── Matrix ── */
      case 'matrix_radio':
      case 'matrix_checkbox':
      case 'matrix_dropdown':
      case 'matrix_textbox':
      case 'matrix_number':
      case 'matrix_currency': {
        const rType = field.type;
        const cols = field.matrixColumns?.length ? field.matrixColumns : ['Answer A', 'Answer B', 'Answer C'];
        const rows = field.matrixRows?.length ? field.matrixRows : ['First Question', 'Second Question', 'Third Question'];

        return (
          <div className="overflow-x-auto w-full pt-2">
            <table className="w-full text-[13px] text-center table-fixed min-w-max">
              <thead>
                <tr>
                  <th className="p-2 text-left font-normal text-[#64748B] w-1/3 min-w-[150px]"></th>
                  {cols.map((col, j) => (
                    <th key={j} className="p-2 text-[#0F172A] font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-[#F1F5F9]">
                    <td className="p-3 text-left text-[#475569] font-medium truncate">{row}</td>
                    {cols.map((_, j) => (
                      <td key={j} className="p-3 text-center align-middle">
                        {rType === 'matrix_radio' && <input type="radio" className="w-4 h-4 text-teal-600 disabled:opacity-40 m-auto cursor-not-allowed" disabled />}
                        {rType === 'matrix_checkbox' && <input type="checkbox" className="w-4 h-4 text-teal-600 disabled:opacity-40 border-gray-300 rounded m-auto cursor-not-allowed" disabled />}
                        {rType === 'matrix_dropdown' && <select className="border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-500 bg-white w-full max-w-[120px] mx-auto cursor-not-allowed" disabled><option>-Select-</option></select>}
                        {rType === 'matrix_textbox' && <input type="text" className="border border-gray-200 w-full max-w-[120px] mx-auto rounded px-2 py-1.5 text-xs bg-white cursor-not-allowed" disabled />}
                        {rType === 'matrix_number' && <input type="number" className="border border-gray-200 w-full max-w-[120px] mx-auto rounded px-2 py-1.5 text-xs bg-white cursor-not-allowed" disabled />}
                        {rType === 'matrix_currency' && <input type="text" placeholder="$" className="border border-gray-200 w-full max-w-[120px] mx-auto rounded px-2 py-1.5 text-xs bg-white cursor-not-allowed" disabled />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      /* ── Radio ── */
      case 'radio':
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="radio" name={field.id} disabled />
                <span className="text-gray-700 text-sm">{opt}</span>
              </label>
            ))}
          </div>
        );

      /* ── Checkbox ── */
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="checkbox" disabled />
                <span className="text-gray-700 text-sm">{opt}</span>
              </label>
            ))}
          </div>
        );

      /* ── Yes/No ── */
      case 'yes_no':
        return (
          <div className="flex gap-3">
            <button disabled className="px-6 py-2 border-2 border-teal-500 text-teal-600 rounded-lg text-sm font-medium">Yes</button>
            <button disabled className="px-6 py-2 border-2 border-gray-200 text-gray-500 rounded-lg text-sm font-medium">No</button>
          </div>
        );

      /* ── Date & Time ── */
      case 'date':
        return (
          <div className="w-full">
            <div className="flex flex-col w-64 max-w-full">
              <div className="flex items-center gap-2 mb-1">
                <input type="text" className="full flex-1 px-3 py-2 border border-gray-200 rounded bg-white text-sm cursor-not-allowed" disabled />
                <Calendar size={18} className="text-gray-400 shrink-0" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-gray-400 ml-1">dd-MMM-yyyy</p>
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <select className="w-[60px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-500 cursor-not-allowed appearance-none" disabled>
                <option>10</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1 text-center">HH</p>
            </div>
            <span className="text-gray-500 font-medium mb-5">:</span>
            <div className="flex flex-col">
              <select className="w-[60px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-500 cursor-not-allowed appearance-none" disabled>
                <option>10</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1 text-center">MM</p>
            </div>
            <span className="text-gray-500 font-medium mb-5">:</span>
            <div className="mb-5">
              <select className="w-[60px] px-2 py-1.5 border border-gray-200 rounded text-[13px] bg-white text-gray-500 cursor-not-allowed appearance-none" disabled>
                <option>AM</option>
              </select>
            </div>
          </div>
        );
      case 'datetime':
        return (
          <div className="w-full relative pointer-events-none">
            <div className="flex flex-col w-64 max-w-full">
              <div className="flex items-center gap-2 mb-1">
                <input type="text" className="full flex-1 px-3 py-2 border border-gray-200 rounded bg-white text-sm cursor-not-allowed" disabled />
                <Calendar size={18} className="text-gray-400 shrink-0" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-gray-400 ml-1">dd-MMM-yyyy HH:MM AM/PM</p>
            </div>

            <div className="mt-3 w-[300px] border border-[#cbd5e1] rounded bg-[#f4f6f8] p-4 shadow-sm relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-[30px] h-[28px] flex items-center justify-center border border-[#94a3b8] bg-[#f4f6f8] rounded text-[#334155]">
                  <ChevronLeft size={16} strokeWidth={2} />
                </div>
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <select className="pl-2.5 pr-7 h-[28px] border border-[#94a3b8] bg-[#f4f6f8] rounded text-[13px] font-bold text-[#1e293b] appearance-none" disabled>
                      <option>Mar</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#334155] text-[10px]">▼</div>
                  </div>
                  <div className="relative">
                    <select className="pl-2.5 pr-7 h-[28px] border border-[#94a3b8] bg-[#f4f6f8] rounded text-[13px] font-bold text-[#1e293b] appearance-none" disabled>
                      <option>2026</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[#334155] text-[10px]">▼</div>
                  </div>
                </div>
                <div className="w-[30px] h-[28px] flex items-center justify-center border border-[#94a3b8] bg-[#f4f6f8] rounded text-[#334155]">
                  <ChevronRight size={16} strokeWidth={2} />
                </div>
              </div>
              <div className="grid grid-cols-7 text-center mb-5 gap-y-3">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-[12px] font-bold text-[#475569]">{d}</div>
                ))}

                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <div className={`text-[13px] flex items-center justify-center ${i + 1 === 7 ? 'text-teal-600 border border-teal-500 rounded-full w-[28px] h-[28px] -mx-1' : 'text-[#334155] w-[28px] h-[28px]'
                      }`}>
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-6 mb-1 ml-1">
                <input type="text" value="09" disabled className="w-[38px] h-[28px] text-left pl-2.5 border border-[#94a3b8] bg-[#f4f6f8] rounded text-[13px] text-[#1e293b]" />
                <span className="text-[#64748B] font-medium -mt-1">:</span>
                <input type="text" value="37" disabled className="w-[38px] h-[28px] text-left pl-2.5 border border-[#94a3b8] bg-[#f4f6f8] rounded text-[13px] text-[#1e293b]" />
                <div className="ml-2 relative">
                  <select disabled className="h-[28px] pl-2.5 pr-7 border border-[#94a3b8] bg-[#f4f6f8] rounded text-[13px] text-[#1e293b] appearance-none w-[66px]">
                    <option>AM</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#334155] text-[10px]">▼</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'month_year':
        return (
          <div className="w-full">
            <div className="flex flex-col w-64 max-w-full">
              <div className="flex items-center gap-2 mb-1">
                <input type="text" className="full flex-1 px-3 py-2 border border-gray-200 rounded bg-white text-sm cursor-not-allowed" disabled />
                <Calendar size={18} className="text-gray-400 shrink-0" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-gray-400 ml-1">MMM-yyyy</p>
            </div>
          </div>
        );

      /* ── Rating ── */
      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} className="text-gray-300" />)}
          </div>
        );

      /* ── Slider ── */
      case 'slider':
        return (
          <div className="px-1">
            <input type="range" className="w-full accent-teal-500" disabled />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>100</span></div>
          </div>
        );

      /* ── Uploads ── */
      case 'file':
      case 'image_upload':
      case 'audio_video_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50/50">
            <p className="text-gray-400 text-sm">Click to upload or drag and drop</p>
          </div>
        );

      /* ── Signature ── */
      case 'signature':
        return (
          <div className="h-20 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
            <span className="text-xs text-gray-400 italic">Sign here</span>
          </div>
        );

      /* ── Terms / Decision / Description ── */
      case 'terms':
      case 'decision_box':
        return (
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5" disabled />
            <span className="text-sm text-gray-600">{field.label || 'I agree to the terms and conditions'}</span>
          </label>
        );

      case 'instructions':
        return (
          <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-lg">
            <p className="text-gray-700 text-sm">{field.helpText || 'Instructions text'}</p>
          </div>
        );

      /* ── Image choices ── */
      case 'image_choices':
        return (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-2 border-gray-200 rounded-lg h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Image {i}
              </div>
            ))}
          </div>
        );

      /* ── Subform ── */
      case 'subform':
        return null; // handled by full-card override below

      /* ── Payment ── */
      case 'payment':
        return (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Details</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Card Number</p>
                <div className="h-8 border border-gray-200 rounded-lg bg-white flex items-center px-3">
                  <span className="text-gray-300 text-sm tracking-widest">•••• •••• •••• ••••</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Expiry</p>
                  <div className="h-8 border border-gray-200 rounded-lg bg-white flex items-center px-3">
                    <span className="text-gray-300 text-sm">MM / YY</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">CVV</p>
                  <div className="h-8 border border-gray-200 rounded-lg bg-white flex items-center px-3">
                    <span className="text-gray-300 text-sm">•••</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      /* ── Webhook / Prefill ── */
      case 'webhook':
        return (
          <div className="flex items-center gap-3 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-violet-600 text-xs font-bold">{'{ }'}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">Webhook Prefill</p>
              <p className="text-xs text-gray-400">Value populated via webhook</p>
            </div>
          </div>
        );

      default:
        return (
          <input type="text" placeholder="Enter value"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50/50" disabled />
        );
    }
  };

  /* ── Subform: Simple Preview (Matches Image) ───────────────── */
  if (field.type === 'subform') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        className={`relative border rounded-lg transition-all outline-none cursor-pointer group ${isDragging
          ? 'opacity-40 border-blue-300 bg-blue-50 shadow-lg scale-[1.01]'
          : isSelected
            ? 'border-blue-400 bg-blue-50/10 shadow-sm ring-1 ring-blue-400'
            : 'border-[#E2E8F0] bg-white hover:border-gray-300'
          }`}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />}

        <div className="flex flex-col gap-2.5 p-4">
          {/* Label Header with Icon */}
          <div className="flex items-center gap-2">
            <div
              {...listeners}
              {...attributes}
              className="cursor-move text-[#38bdf8] hover:text-blue-500 transition-colors touch-none"
            >
              <LayoutTemplate size={16} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold text-[#0F172A]">
              {field.label || 'New Subform'}
            </span>
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </div>

          {/* Input-like Area */}
          <div className="pointer-events-none flex items-center gap-2.5 w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50">
            <LayoutTemplate size={15} className="text-[#38bdf8] opacity-80" strokeWidth={2} />
            <span className="text-[13px] text-gray-400">Enter value</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`relative border rounded-lg transition-all outline-none cursor-pointer group ${isDragging
        ? 'opacity-40 border-blue-300 bg-blue-50 shadow-lg scale-[1.01]'
        : isSelected
          ? 'border-blue-300 bg-blue-50/20'
          : 'border-[#E2E8F0] bg-white hover:border-gray-300'
        }`}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-l-lg" />}


      <div className="flex items-start gap-3 p-4">
        <div
          {...listeners}
          {...attributes}
          className="cursor-move text-gray-200 group-hover:text-gray-400 mt-0.5 touch-none transition-colors flex-shrink-0"
        >
          <GripVertical size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-[13px] font-semibold text-[#0F172A] mb-0.5 cursor-pointer">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.helpText && <p className="text-[12px] text-[#64748B] mb-2">{field.helpText}</p>}
          <div className="mt-2 pointer-events-none">{renderFieldPreview()}</div>
        </div>
      </div>
    </div>
  );
}

