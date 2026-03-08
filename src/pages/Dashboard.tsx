import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, FileText, Sparkles } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import FormCard from '../components/dashboard/FormCard';
import CreateFormModal from '../components/modals/CreateFormModal';
import { useFormStore } from '../store/useFormStore';

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const allForms = useFormStore((state) => state.forms);
  const forms = allForms.filter(f => !f.isDeleted);

  return (
    <MainLayout onNewFormClick={() => setShowCreateModal(true)}>
      <div className="max-w-7xl mx-auto animate-in">

        {/* Page header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">My Forms</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {forms.length} form{forms.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground shadow-sm transition-colors">
              <SlidersHorizontal size={13} />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown size={12} />
            </button>

            {/* New Form (mobile fallback) */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg"
            >
              <Sparkles size={14} />
              New
            </button>
          </div>
        </div>

        {/* Content — always list view */}
        {forms.length === 0 ? (
          /* Empty State */
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col items-center justify-center py-28 text-center animate-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 shadow-sm">
              <FileText size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 font-display">No forms yet</h2>
            <p className="text-sm text-muted-foreground max-w-xs mb-7 leading-relaxed">
              Create your first form to start collecting responses and building workflows.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
            >
              <Sparkles size={15} /> Create your first form
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {forms.map(form => (
              <FormCard key={form.id} form={form} viewMode="list" />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && <CreateFormModal onClose={() => setShowCreateModal(false)} />}
    </MainLayout>
  );
}
