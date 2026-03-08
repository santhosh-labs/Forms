import MainLayout from '../components/layout/MainLayout';
import { useFormStore } from '../store/useFormStore';
import { RefreshCcw, Trash2, Calendar, FileText } from 'lucide-react';

export default function Trash() {
    const allForms = useFormStore((state) => state.forms);
    const deletedForms = allForms.filter(f => f.isDeleted);
    const restoreForm = useFormStore((state) => state.restoreForm);
    const permanentDeleteForm = useFormStore((state) => state.permanentDeleteForm);

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-7xl mx-auto animate-in">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground tracking-tight">Trash</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Deleted forms are stored here. You can restore or permanently delete them.
                    </p>
                </div>

                {deletedForms.length === 0 ? (
                    <div className="bg-card rounded-xl shadow-sm border border-border flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
                            <Trash2 size={28} className="text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-bold text-foreground mb-1">Your trash is empty</h2>
                        <p className="text-sm text-muted-foreground">Deleted forms will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {deletedForms.map((form) => (
                            <div
                                key={form.id}
                                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-48 relative overflow-hidden opacity-70 hover:opacity-100"
                            >
                                {/* Trashed ribbon */}
                                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                                    <div className="absolute top-2.5 -right-6 w-24 bg-destructive text-destructive-foreground text-[9px] font-black text-center py-0.5 rotate-45 uppercase tracking-widest">
                                        Trashed
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground shrink-0">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-foreground text-base mb-1 truncate">
                                        {form.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground line-through">
                                        <Calendar size={13} />
                                        {form.createdAt}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                                    <button
                                        onClick={() => restoreForm(form.id)}
                                        className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors border border-emerald-500/20"
                                    >
                                        <RefreshCcw size={14} />
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => permanentDeleteForm(form.id)}
                                        className="flex items-center gap-2 text-sm font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
