import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, MoreHorizontal, Info, Copy, FolderInput,
  LayoutGrid, Trash2, X, Calendar, Hash, Layers,
  CheckCircle, AlertCircle, Folder, Check, Plus,
  Pencil, Mail, Share2, Clipboard, Eye, UserPlus, List
} from 'lucide-react';
import { Form } from '../../types';
import { useFormStore } from '../../store/useFormStore';

interface FormCardProps {
  form: Form;
  viewMode?: 'grid' | 'list';
}

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-sky-500 to-cyan-600',
  'from-fuchsia-500 to-pink-600',
];
const getGradient = (id: string) => GRADIENTS[id.charCodeAt(id.length - 1) % GRADIENTS.length];

/* ─── Shared Modal ─────────────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Info Modal ─────────────────────────────────────────────── */
function InfoModal({ form, onClose }: { form: Form; onClose: () => void }) {
  const rows = [
    { icon: <Hash size={13} />, label: 'Form ID', value: form.id },
    { icon: <Layers size={13} />, label: 'Type', value: form.type === 'card' ? 'Card Form' : 'Standard Form' },
    { icon: <Calendar size={13} />, label: 'Created', value: form.createdAt },
    { icon: <FileText size={13} />, label: 'Fields', value: String(form.fields.length) },
    { icon: <CheckCircle size={13} />, label: 'Submissions', value: String(form.submissions) },
    { icon: <AlertCircle size={13} />, label: 'Status', value: form.isDisabled ? 'Disabled' : 'Active' },
    ...(form.folder ? [{ icon: <Folder size={13} />, label: 'Folder', value: form.folder }] : []),
    ...(form.owner ? [{ icon: <FileText size={13} />, label: 'Owner', value: form.owner }] : []),
  ];
  return (
    <Modal title="Form Details" onClose={onClose}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(form.id)} flex items-center justify-center shrink-0`}>
          <FileText size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-foreground">{form.name}</p>
          <p className="text-[12px] text-muted-foreground">Form metadata</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {rows.map(({ icon, label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <span className="text-muted-foreground">{icon}</span> {label}
            </div>
            <span className="text-[12px] font-medium text-foreground max-w-[180px] truncate">{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─── Move to Folder Modal ──────────────────────────────────── */
function MoveToFolderModal({ form, onClose, onMove }: {
  form: Form; onClose: () => void; onMove: (f: string | undefined) => void
}) {
  const storeFolders = useFormStore(s => s.folders);
  const addFolder = useFormStore(s => s.addFolder);
  const [selected, setSelected] = useState(form.folder || '');
  const [newName, setNewName] = useState('');
  const [showNew, setShowNew] = useState(false);
  const myFolders = storeFolders.filter(f => !f.sharedBy);

  const handleSave = () => {
    if (showNew && newName.trim()) { addFolder(newName.trim()); onMove(newName.trim()); }
    else if (selected === '__none__') onMove(undefined);
    else if (selected) onMove(selected);
    onClose();
  };

  const canSave =
    (showNew && newName.trim().length > 0) ||
    (!showNew && selected !== '' && selected !== (form.folder ?? '')) ||
    selected === '__none__';

  return (
    <Modal title="Move to Folder" onClose={onClose}>
      <p className="text-[13px] text-muted-foreground mb-4">
        Select a destination for <strong className="text-foreground">{form.name}</strong>
      </p>
      <div className="space-y-2 mb-3 max-h-52 overflow-y-auto pr-1">
        {form.folder && (
          <button
            onClick={() => { setSelected('__none__'); setShowNew(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-[13px] transition-all text-left
              ${selected === '__none__'
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : 'border-dashed border-border text-muted-foreground hover:bg-muted'
              }`}
          >
            <X size={13} /> Remove from folder
          </button>
        )}
        {myFolders.length === 0 && !showNew && (
          <p className="text-[12px] text-muted-foreground text-center py-4">No folders yet — create one below.</p>
        )}
        {myFolders.map(f => {
          const isActive = selected === f.name && !showNew;
          const isCurrent = form.folder === f.name;
          return (
            <button key={f.id} onClick={() => { setSelected(f.name); setShowNew(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-[13px] transition-all text-left
                ${isActive ? 'border-primary/50 bg-primary/10' : 'border-border hover:bg-muted'}`}
            >
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.color }} />
              <span className={`font-medium flex-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>{f.name}</span>
              {isCurrent && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">current</span>}
              {isActive && !isCurrent && <Check size={13} className="text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
      {showNew ? (
        <div className="mb-4 flex gap-2">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="Folder name…"
            className="flex-1 px-3 py-2 border border-border rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground" />
          <button onClick={() => { setShowNew(false); setNewName(''); }} className="p-2 text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
      ) : (
        <button onClick={() => { setShowNew(true); setSelected(''); }} className="flex items-center gap-1.5 text-[13px] text-primary font-medium mb-4 hover:text-primary/80">
          <Plus size={14} /> Create new folder
        </button>
      )}
      <div className="flex gap-2 justify-end pt-2 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 text-[13px] border border-border rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={!canSave}
          className="btn-primary px-4 py-2 text-[13px] rounded-lg font-semibold disabled:opacity-40 shadow-sm">
          {selected === '__none__' ? 'Remove' : 'Move'}
        </button>
      </div>
    </Modal>
  );
}

/* ─── Change Ownership Modal ─────────────────────────────────── */
function ChangeOwnershipModal({ form, onClose, onTransfer }: {
  form: Form; onClose: () => void; onTransfer: (o: string) => void
}) {
  const [email, setEmail] = useState('');
  return (
    <Modal title="Transfer Ownership" onClose={onClose}>
      <p className="text-[13px] text-muted-foreground mb-4">
        Transfer <strong className="text-foreground">{form.name}</strong> to another user.
      </p>
      {form.owner && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg border border-border">
          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-primary">{form.owner[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Current owner</p>
            <p className="text-[13px] font-medium text-foreground">{form.owner}</p>
          </div>
        </div>
      )}
      <label className="block text-[12px] font-semibold text-primary mb-1.5">New Owner Email</label>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="newowner@company.com" type="email"
        className="w-full px-3 py-2.5 border border-border rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-4 bg-background text-foreground" />
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-[13px] border border-border rounded-lg text-muted-foreground hover:bg-muted font-medium transition-colors">Cancel</button>
        <button onClick={() => { if (email.trim()) { onTransfer(email.trim()); onClose(); } }} disabled={!email.trim()}
          className="btn-primary px-4 py-2 text-[13px] rounded-lg font-semibold disabled:opacity-40">Transfer</button>
      </div>
    </Modal>
  );
}

/* ─── MENU ITEM ─────────────────────────────────────────────── */
function MenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] transition-colors text-left
        ${danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <span className={danger ? 'text-red-400' : 'text-gray-400'}>{icon}</span> {label}
    </button>
  );
}

/* ─── FORM CARD ──────────────────────────────────────────────── */
export default function FormCard({ form, viewMode = 'grid' }: FormCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [modal, setModal] = useState<'info' | 'folder' | 'owner' | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteForm = useFormStore(s => s.deleteForm);
  const addForm = useFormStore(s => s.addForm);
  const updateForm = useFormStore(s => s.updateForm);

  const close = () => { setShowMenu(false); setModal(null); };

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleDuplicate = () => {
    addForm({ ...form, id: `form-${Date.now()}`, name: `${form.name} (Copy)`, createdAt: new Date().toISOString().split('T')[0], submissions: 0, isDisabled: false });
    close();
  };
  const handleToggleDisable = () => { updateForm(form.id, { isDisabled: !form.isDisabled }); close(); };
  const handleSwitchType = () => { updateForm(form.id, { type: form.type === 'card' ? 'standard' : 'card' }); close(); };

  const gradient = getGradient(form.id);
  const statusClass = form.isDisabled ? 'badge-disabled' : 'badge-published';
  const statusLabel = form.isDisabled ? 'Disabled' : 'Published';

  const DropdownMenu = () => (
    <div
      className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-100 py-1.5 w-52 z-50"
      style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.14)' }}
    >
      <MenuItem icon={<Info size={14} />} label="Info" onClick={() => { setModal('info'); setShowMenu(false); }} />
      <MenuItem icon={<Copy size={14} />} label="Duplicate" onClick={handleDuplicate} />
      <MenuItem icon={<Eye size={14} />} label="Enable / Disable" onClick={handleToggleDisable} />
      <MenuItem icon={<FolderInput size={14} />} label="Move to Folder" onClick={() => { setModal('folder'); setShowMenu(false); }} />
      <MenuItem icon={<UserPlus size={14} />} label="Change Ownership" onClick={() => { setModal('owner'); setShowMenu(false); }} />
      <MenuItem icon={<List size={14} />} label={form.type === 'card' ? 'Switch to Standard' : 'Switch to Card'} onClick={handleSwitchType} />
      <div className="border-t border-gray-100 my-1" />
      <MenuItem icon={<Trash2 size={14} />} label="Trash" onClick={() => { deleteForm(form.id); close(); }} danger />
    </div>
  );

  /* ── List view ── */
  if (viewMode === 'list') {
    return (
      <>
        <div
          className={`bg-white border border-gray-200 rounded-xl transition-all duration-200 relative
            ${form.isDisabled ? 'opacity-60' : ''}
            ${hovered ? 'shadow-md border-gray-300' : ''}
          `}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); }}
        >
          {/* Main row */}
          <div
            className="flex items-center gap-4 px-5 py-3.5 cursor-pointer"
            onClick={() => navigate(`/builder/${form.id}`)}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
              {form.type === 'card' ? <LayoutGrid size={14} className="text-white" /> : <FileText size={14} className="text-white" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 truncate">{form.name}</p>
              {!hovered && (
                <p className="text-[12px] text-gray-400">{form.createdAt} · {form.fields.length} fields</p>
              )}
              {hovered && (
                <div className="flex items-center gap-3 mt-0.5">
                  {['Reports', 'Settings', 'Analytics', 'Audit'].map((link, i) => (
                    <span key={link} className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); }}
                        className="text-[11.5px] font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
                      >
                        {link}
                      </button>
                      {i < 3 && <span className="text-gray-300">•</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0" onClick={e => e.stopPropagation()}>
              {!hovered && (
                <div className="hidden md:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[15px] font-bold text-gray-900">{form.submissions}</p>
                    <p className="text-[11px] text-gray-400">Responses</p>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              )}

              {hovered && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/builder/${form.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={12} className="text-gray-500" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/submissions/${form.id}`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Clipboard size={12} className="text-gray-500" /> All Entries
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Email">
                    <Mail size={14} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Share" onClick={() => navigate(`/builder/${form.id}`, { state: { tab: 'share' } })}>
                    <Share2 size={14} />
                  </button>
                </div>
              )}

              <div className="relative" ref={menuRef}>
                <button
                  onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
                  className={`flex items-center justify-center rounded-lg transition-colors
                    ${hovered
                      ? 'w-8 h-8 border border-gray-200 text-gray-500 hover:bg-gray-50'
                      : 'p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <MoreHorizontal size={15} />
                </button>
                {showMenu && <DropdownMenu />}
              </div>
            </div>
          </div>
        </div>

        {modal === 'info' && <InfoModal form={form} onClose={close} />}
        {modal === 'folder' && <MoveToFolderModal form={form} onClose={close} onMove={f => updateForm(form.id, { folder: f })} />}
        {modal === 'owner' && <ChangeOwnershipModal form={form} onClose={close} onTransfer={o => updateForm(form.id, { owner: o })} />}
      </>
    );
  }

  /* ── Grid view ── */
  return (
    <>
      {/* overflow-visible so the dropdown menu is NOT clipped */}
      <div
        className={`bg-white border border-gray-200 rounded-xl transition-all duration-200 relative cursor-pointer group
          hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300
          ${form.isDisabled ? 'opacity-60' : ''}
        `}
      >
        {/* Cover — overflow-hidden here only, to clip gradient to rounded top corners */}
        <div
          className={`h-[110px] bg-gradient-to-br ${gradient} relative rounded-t-xl overflow-hidden`}
          onClick={() => navigate(`/builder/${form.id}`)}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/25" />

          {/* Status badge */}
          <span className={`absolute top-3 left-3 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border ${statusClass}`}>
            {statusLabel}
          </span>

          {/* Type icon */}
          <div className="absolute bottom-3 left-3.5 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            {form.type === 'card' ? <LayoutGrid size={14} className="text-white" /> : <FileText size={14} className="text-white" />}
          </div>

          {/* Edit shortcut on hover */}
          <button
            onClick={() => navigate(`/builder/${form.id}`)}
            className="absolute bottom-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10.5px] font-semibold text-white/90 bg-black/20 hover:bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md"
          >
            Edit →
          </button>
        </div>

        {/* Three-dot button — placed OUTSIDE cover to avoid overflow-hidden clip */}
        <div
          className="absolute top-2.5 right-2.5 z-30"
          ref={menuRef}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(s => !s); }}
            className="w-7 h-7 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-md flex items-center justify-center text-white transition-colors"
          >
            <MoreHorizontal size={13} />
          </button>
          {showMenu && <DropdownMenu />}
        </div>

        {/* Body */}
        <div className="px-4 pt-3.5 pb-4 rounded-b-xl" onClick={() => navigate(`/builder/${form.id}`)}>
          <h3 className="text-[13.5px] font-semibold text-gray-900 truncate mb-0.5">{form.name}</h3>
          <p className="text-[11px] text-gray-400">{form.createdAt}</p>

          {/* Stats */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={11} className="text-emerald-500" />
              <span className="text-[12px] font-bold text-gray-800">{form.submissions}</span>
              <span className="text-[11px] text-gray-400">responses</span>
            </div>
            <span className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-600">{form.fields.length}</span> fields
            </span>
          </div>
        </div>
      </div>

      {modal === 'info' && <InfoModal form={form} onClose={close} />}
      {modal === 'folder' && <MoveToFolderModal form={form} onClose={close} onMove={f => updateForm(form.id, { folder: f })} />}
      {modal === 'owner' && <ChangeOwnershipModal form={form} onClose={close} onTransfer={o => updateForm(form.id, { owner: o })} />}
    </>
  );
}
