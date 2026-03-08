import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FileText, LayoutGrid, AlertCircle } from 'lucide-react';
import { useFormStore } from '../../store/useFormStore';
import { Form } from '../../types';

interface CreateFormModalProps {
  onClose: () => void;
}

export default function CreateFormModal({ onClose }: CreateFormModalProps) {
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'standard' | 'card'>('standard');
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  const addForm = useFormStore((state) => state.addForm);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && formName.trim()) handleCreate();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formName]);

  const handleCreate = () => {
    setTouched(true);
    if (!formName.trim()) return;
    const newForm: Form = {
      id: `form-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      createdAt: new Date().toISOString().split('T')[0],
      fields: [],
      submissions: 0,
    };
    addForm(newForm);
    navigate(`/builder/${newForm.id}`);
  };

  const isCard = formType === 'card';
  const previewLabel = formName.trim() || 'Untitled Form';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Create New Form</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Design a form from scratch or choose a template</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Form */}
          <div className="px-7 py-6 space-y-6">
            {/* Form Name */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-1.5">
                Form Name <span className="text-destructive">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={formName}
                onChange={e => { setFormName(e.target.value); setTouched(false); }}
                onBlur={() => setTouched(true)}
                placeholder="Enter form name"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-all text-foreground bg-background placeholder:text-muted-foreground
                  ${touched && !formName.trim()
                    ? 'border-destructive ring-2 ring-destructive/20'
                    : 'border-border focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  }`}
              />
              {touched && !formName.trim() && (
                <div className="flex items-center gap-1.5 mt-1.5 text-destructive text-xs">
                  <AlertCircle size={12} />
                  Form name is required.
                </div>
              )}
            </div>

            {/* Form Type */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-3">Form Type</label>
              <div className="space-y-3">
                {/* Standard */}
                <button
                  onClick={() => setFormType('standard')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${formType === 'standard'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${formType === 'standard' ? 'bg-primary' : 'bg-muted'
                      }`}>
                      <FileText size={18} className={formType === 'standard' ? 'text-white' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-0.5 ${formType === 'standard' ? 'text-primary' : 'text-foreground'}`}>
                        Standard
                      </h3>
                      <p className="text-sm text-muted-foreground">Multiple fields per page</p>
                    </div>
                    {formType === 'standard' && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setFormType('card')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${formType === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${formType === 'card' ? 'bg-primary' : 'bg-muted'
                      }`}>
                      <LayoutGrid size={18} className={formType === 'card' ? 'text-white' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <h3 className={`font-semibold mb-0.5 ${formType === 'card' ? 'text-primary' : 'text-foreground'}`}>
                        Card
                      </h3>
                      <p className="text-sm text-muted-foreground">One field per page</p>
                    </div>
                    {formType === 'card' && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="hidden md:flex flex-col items-center justify-center bg-muted/40 p-8 border-l border-border">
            <div className="w-full max-w-[200px]">
              <div className="bg-card rounded-2xl shadow-lg p-5 border border-border transition-all duration-300">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${isCard ? 'from-violet-500 to-purple-600' : 'from-blue-500 to-indigo-600'
                  } flex items-center justify-center mx-auto mb-4 shadow-md transition-all duration-300`}>
                  {isCard
                    ? <LayoutGrid size={28} className="text-white" />
                    : <FileText size={28} className="text-white" />
                  }
                </div>

                <p className={`text-sm font-bold text-center truncate mb-1 transition-all ${formName.trim() ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                  {previewLabel}
                </p>

                <div className="flex items-center justify-center">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-widest transition-all border ${isCard
                    ? 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                    : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                    {isCard ? 'Card Form' : 'Standard'}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {[60, 80, 50].map((w, i) => (
                    <div key={i} className="h-2 bg-muted rounded-full" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-center mt-3 text-muted-foreground">Live preview</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-card border border-border rounded text-foreground font-mono text-[11px]">Enter</kbd> to create quickly
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className={`btn-primary px-6 py-2.5 text-sm rounded-lg font-semibold transition-all shadow-sm
                ${!formName.trim() ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-md'}`}
              disabled={!formName.trim()}
            >
              Create Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
