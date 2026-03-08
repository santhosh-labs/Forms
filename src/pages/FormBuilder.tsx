import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Home, Eye, Share2, Palette, Settings, Workflow, Zap, ClipboardCheck, ChevronRight, Monitor, Smartphone } from 'lucide-react';

import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import FieldSidebar from '../components/builder/FieldSidebar';
import { fieldTemplates } from '../data/mockData';
import FormCanvas from '../components/builder/FormCanvas';
import FieldSettingsPanel from '../components/builder/FieldSettingsPanel';
import FormSettingsPanel from '../components/builder/FormSettingsPanel';
import FormThemePanel from '../components/builder/FormThemePanel';
import FormSharePanel from '../components/builder/FormSharePanel';
import FormRulesPanel from '../components/builder/FormRulesPanel';
import FormIntegrationsPanel from '../components/builder/FormIntegrationsPanel';
import FormApprovalsPanel from '../components/builder/FormApprovalsPanel';
import RichTextModal from '../components/builder/RichTextModal';

import { FormField, FieldType, GridRow, GridSlot } from '../types';
import { useFormStore } from '../store/useFormStore';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('builder');
  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [richTextFieldId, setRichTextFieldId] = useState<string | null>(null);
  const [formName, setFormName] = useState('Untitled Form');
  const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);

  const updateForm = useFormStore(state => state.updateForm);
  const form = useFormStore(state => state.forms.find(f => f.id === id));

  /* ── Load existing form ─────────────────────────── */
  useEffect(() => {
    if (id === 'new') {
      const state = location.state as { name?: string };
      if (state?.name) setFormName(state.name);
    } else if (form) {
      setFormName(form.name);
      if (form.gridRows && form.gridRows.length > 0) {
        setGridRows(form.gridRows);
      } else if (form.fields && form.fields.length > 0) {
        // Migrate flat fields → one 1-column row each
        setGridRows(form.fields.map(f => ({
          id: `row-${f.id}`,
          columns: 1,
          slots: [{ id: `slot-${f.id}-0`, field: f }],
        })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ── Flat fields list (for rules/settings panels & store sync) ── */
  const flatFields = useMemo<FormField[]>(() =>
    gridRows.flatMap(row => row.slots.filter(s => s.field).map(s => s.field!)),
    [gridRows]
  );

  /* ── Sync to store ─────────────────────────────── */
  useEffect(() => {
    if (id && id !== 'new') {
      updateForm(id, { gridRows, fields: flatFields });
    }
  }, [gridRows, flatFields, id, updateForm]);

  /* ── Selected field lookup ─────────────────────── */
  const selectedField = useMemo<FormField | null>(() => {
    if (!selectedFieldId) return null;
    for (const row of gridRows) {
      for (const slot of row.slots) {
        if (slot.field?.id === selectedFieldId) return slot.field;
        if (slot.field?.subFields) {
          const sub = slot.field.subFields.find(f => f.id === selectedFieldId);
          if (sub) return sub;
        }
      }
    }
    return null;
  }, [gridRows, selectedFieldId]);

  /* ── Add grid row from sidebar click ───────────── */
  const addGridRow = (columns: 1 | 2 | 3) => {
    const rowId = `row-${Date.now()}`;
    const newRow: GridRow = {
      id: rowId,
      columns,
      slots: Array.from({ length: columns }, (_, i): GridSlot => ({
        id: `slot-${rowId}-${i}`,
      })),
    };
    setGridRows(prev => [...prev, newRow]);
  };

  /* ── Delete a whole row ────────────────────────── */
  const deleteRow = (rowId: string) => {
    setGridRows(prev => prev.filter(r => r.id !== rowId));
    setSelectedFieldId(null);
  };

  /* ── Field property update ─────────────────────── */
  const handleSpecificFieldUpdate = (fieldId: string, updates: Partial<FormField>) => {
    setGridRows(prev => prev.map(row => ({
      ...row,
      slots: row.slots.map(slot => {
        if (slot.field?.id === fieldId) {
          return { ...slot, field: { ...slot.field, ...updates } };
        }
        if (slot.field?.subFields && slot.field.subFields.some(f => f.id === fieldId)) {
          return {
            ...slot,
            field: {
              ...slot.field,
              subFields: slot.field.subFields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
            }
          };
        }
        return slot;
      }),
    })));
  };

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    handleSpecificFieldUpdate(selectedFieldId, updates);
  };

  /* ── Field delete (clear from its slot) ────────── */
  const handleFieldDelete = () => {
    if (!selectedFieldId) return;
    setGridRows(prev => prev.map(row => ({
      ...row,
      slots: row.slots.map(slot => {
        if (slot.field?.id === selectedFieldId) {
          return { ...slot, field: undefined };
        }
        if (slot.field?.subFields && slot.field.subFields.some(f => f.id === selectedFieldId)) {
          return {
            ...slot,
            field: {
              ...slot.field,
              subFields: slot.field.subFields.filter(f => f.id !== selectedFieldId)
            }
          };
        }
        return slot;
      }),
    })));
    setSelectedFieldId(null);
  };

  /* ── Field duplicate ───────────────────────────── */
  const handleFieldDuplicate = () => {
    if (!selectedFieldId) return;
    const fieldToDuplicate = [...flatFields, ...flatFields.flatMap(f => f.subFields || [])].find(f => f.id === selectedFieldId);
    if (!fieldToDuplicate) return;

    const newFieldId = `field-${Date.now()}`;
    const newField = { ...fieldToDuplicate, id: newFieldId };

    const isTopLevel = flatFields.some(f => f.id === selectedFieldId);

    if (isTopLevel) {
      const rowId = `row-${Date.now()}`;
      const newRow: GridRow = {
        id: rowId,
        columns: 1,
        slots: [{ id: `slot-${rowId}-0`, field: newField }],
      };
      setGridRows(prev => [...prev, newRow]);
      setSelectedFieldId(newFieldId);
    } else {
      setGridRows(prev => prev.map(row => ({
        ...row,
        slots: row.slots.map(slot => {
          if (slot.field?.subFields && slot.field.subFields.some(f => f.id === selectedFieldId)) {
            return {
              ...slot,
              field: {
                ...slot.field,
                subFields: [...slot.field.subFields, newField]
              }
            };
          }
          return slot;
        })
      })));
      setSelectedFieldId(newFieldId);
    }
  };

  /* ── Form name update ──────────────────────────── */
  const handleNameChange = (name: string) => {
    setFormName(name);
    if (id && id !== 'new') updateForm(id, { name });
  };

  /* ── Add Field (Click from Sidebar) ──────────────── */
  const addField = (fieldType: FieldType) => {
    const template = fieldTemplates.find(t => t.type === fieldType);
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: template ? `New ${template.label}` : `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
      required: false,
      position: 0,
      options: ['dropdown', 'radio', 'checkbox'].includes(fieldType)
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
      subFields: fieldType === 'subform' ? [] : undefined,
    };

    const rowId = `row-${Date.now()}`;
    const newRow: GridRow = {
      id: rowId,
      columns: 1,
      slots: [{ id: `slot-${rowId}-0`, field: newField }],
    };

    setGridRows(prev => [...prev, newRow]);
    setSelectedFieldId(newField.id);
    if (fieldType === 'instructions') setRichTextFieldId(newField.id);
  };

  /* ── DnD ────────────────────────────────────────── */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { fieldLabel?: string } | undefined;
    setActiveDragLabel(data?.fieldLabel ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragLabel(null);
    if (!over) return;

    const activeData = active.data.current as { type?: string; fieldType?: string; fieldLabel?: string } | undefined;
    const overData = over.data.current as { type?: string; rowId?: string; slotIndex?: number } | undefined;

    if (activeData?.type !== 'sidebar-field') return;

    const fieldType = activeData.fieldType as FieldType;
    const template = fieldTemplates.find(t => t.type === fieldType);
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: template ? `New ${template.label}` : `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}`,
      required: false,
      position: 0,
      options: ['dropdown', 'radio', 'checkbox'].includes(fieldType)
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
      subFields: fieldType === 'subform' ? [] : undefined,
    };

    // Case 1: dropped on an EMPTY canvas slot in an existing multi-col row
    if (overData?.type === 'canvas-slot') {
      const { rowId, slotIndex } = overData;
      if (rowId && slotIndex !== undefined) {
        const targetRow = gridRows.find(r => r.id === rowId);
        const targetSlot = targetRow?.slots[slotIndex];

        if (targetSlot && !targetSlot.field) {
          // Slot is empty — fill it
          setGridRows(prev => prev.map(row =>
            row.id === rowId
              ? {
                ...row, slots: row.slots.map((slot, i) =>
                  i === slotIndex ? { ...slot, field: newField } : slot
                )
              }
              : row
          ));
          setSelectedFieldId(newField.id);
          if (fieldType === 'instructions') setRichTextFieldId(newField.id);
          return;
        }
        // Slot is filled → fall through to auto-create a new 1-col row below
      }
    }

    // Case 2: dropped on the general canvas (form-canvas) OR on a filled slot
    // → auto-create a 1-column row and append it
    const rowId = `row-${Date.now()}`;
    const newRow: GridRow = {
      id: rowId,
      columns: 1,
      slots: [{ id: `slot-${rowId}-0`, field: newField }],
    };
    setGridRows(prev => [...prev, newRow]);
    setSelectedFieldId(newField.id);
    if (fieldType === 'instructions') setRichTextFieldId(newField.id);
  };

  /* ── Tabs ───────────────────────────────────────── */
  const tabs = [
    { id: 'builder', label: 'Builder', icon: <Workflow size={14} /> },
    { id: 'rules', label: 'Rules', icon: <Zap size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    { id: 'themes', label: 'Themes', icon: <Palette size={14} /> },
    { id: 'share', label: 'Share', icon: <Share2 size={14} /> },
    { id: 'integrations', label: 'Integrations', icon: <Zap size={14} /> },
    { id: 'approvals', label: 'Approvals', icon: <ClipboardCheck size={14} /> },
  ];

  return (
    <div className="h-screen flex flex-col" style={{ background: '#f7f8fa' }}>

      {/* ── ROW 1: Thin breadcrumb bar (white) ───────────── */}
      <div
        className="shrink-0 flex items-center justify-between px-4"
        style={{
          height: 36,
          background: '#ffffff',
          borderBottom: '1px solid #e8ecf0',
        }}
      >
        {/* Left: breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors font-medium"
          >
            <Home size={12} />
            <span>Forms</span>
          </button>
          <ChevronRight size={11} className="text-gray-400" />
          <input
            type="text"
            value={formName}
            onChange={e => handleNameChange(e.target.value)}
            className="font-semibold text-gray-800 bg-transparent border-none outline-none hover:bg-gray-100 focus:bg-gray-100 px-1.5 py-0.5 rounded transition-all"
            style={{ fontSize: 12, width: 'auto', minWidth: 60, maxWidth: 200 }}
          />
        </div>

        {/* Right: status badges + icons */}
        <div className="flex items-center gap-3">
          <span
            className="text-[11.5px] font-semibold"
            style={{ color: '#f97316' }}
          >
            Subscription
          </span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Monitor size={14} />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Smartphone size={14} />
            </button>
          </div>
          {/* User avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
            style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}
          >
            H
          </div>
        </div>
      </div>

      {/* ── ROW 2: Dark tab bar ───────────────────────── */}
      <div
        className="shrink-0 flex items-stretch"
        style={{
          height: 44,
          background: '#1e2432',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Home icon */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center px-4 transition-colors"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <Home size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Tabs */}
        <nav className="flex items-stretch flex-1 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 text-[12.5px] font-medium transition-all duration-100 whitespace-nowrap"
                style={{
                  color: isActive ? '#fff' : 'rgba(148,163,184,0.8)',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderBottom: isActive ? '2px solid #10b981' : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.8)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: isActive ? '#10b981' : 'rgba(100,116,139,0.8)', flexShrink: 0 }}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 px-3 shrink-0" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => navigate(`/submissions/${id}`)}
            className="text-[12px] font-medium transition-colors whitespace-nowrap"
            style={{ color: '#f97316' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fb923c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#f97316'; }}
          >
            All Entries
          </button>
          <button
            onClick={() => navigate(`/form/${id}`)}
            className="flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => navigate(`/form/${id}`)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-[12px] font-semibold text-white transition-all whitespace-nowrap"
            style={{
              background: '#10b981',
              boxShadow: '0 1px 4px rgba(16,185,129,0.4)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#059669'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#10b981'; }}
          >
            Access Form
          </button>
        </div>
      </div>

      {/* ══ MAIN AREA ══════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Builder tab: FieldSidebar LEFT + canvas center ── */}
        {activeTab === 'builder' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={(args) => {
              const hits = pointerWithin(args);
              if (hits.length > 0) return hits;
              return rectIntersection(args);
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Field type picker sidebar */}
            <FieldSidebar onAddGridRow={addGridRow} onAddField={addField} />

            {/* Form canvas */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex overflow-hidden bg-white border-l border-gray-200">
                <FormCanvas
                  gridRows={gridRows}
                  selectedFieldId={selectedFieldId}
                  welcomePage={form?.welcomePage}
                  onWelcomePageUpdate={(updates) => {
                    if (id && id !== 'new') {
                      updateForm(id, { welcomePage: { ...form?.welcomePage, ...updates } as any });
                    }
                  }}
                  onFieldSelect={setSelectedFieldId}
                  onFieldUpdate={handleSpecificFieldUpdate}
                  onDeleteRow={deleteRow}
                />

                {selectedField && selectedField.type !== 'instructions' && (
                  <FieldSettingsPanel
                    field={selectedField}
                    onUpdate={handleFieldUpdate}
                    onDelete={handleFieldDelete}
                    onDuplicate={handleFieldDuplicate}
                    onClose={() => setSelectedFieldId(null)}
                  />
                )}

                {richTextFieldId && (() => {
                  const rtField = flatFields.find(f => f.id === richTextFieldId);
                  return rtField ? (
                    <RichTextModal
                      fieldLabel={rtField.label}
                      content={rtField.helpText ?? ''}
                      onSave={(content, label) => {
                        setGridRows(prev => prev.map(row => ({
                          ...row,
                          slots: row.slots.map(slot =>
                            slot.field?.id === richTextFieldId
                              ? { ...slot, field: { ...slot.field, label, helpText: content } }
                              : slot
                          ),
                        })));
                        setRichTextFieldId(null);
                      }}
                      onClose={() => setRichTextFieldId(null)}
                    />
                  ) : null;
                })()}
              </div>
            </div>

            <DragOverlay>
              {activeDragLabel ? (
                <div className="px-4 py-2.5 border-2 border-indigo-500 bg-white rounded-lg shadow-xl opacity-90 pointer-events-none">
                  <div className="text-xs font-semibold text-indigo-700">{activeDragLabel}</div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : activeTab === 'settings' && form ? (
          <FormSettingsPanel form={form} />
        ) : activeTab === 'themes' && form ? (
          <FormThemePanel form={form} />
        ) : activeTab === 'share' && form ? (
          <FormSharePanel form={form} />
        ) : activeTab === 'rules' && form ? (
          <FormRulesPanel form={{ ...form, fields: flatFields }} />
        ) : activeTab === 'integrations' && form ? (
          <FormIntegrationsPanel form={form} />
        ) : activeTab === 'approvals' && form ? (
          <FormApprovalsPanel form={form} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-300 mb-4">
                <Settings size={56} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-gray-400">This section is coming soon</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
