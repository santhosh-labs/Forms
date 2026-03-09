import { create } from 'zustand';
import { Form, Submission, FolderItem, FormField, GridRow } from '../types';
import { api } from '../lib/api';

interface FormState {
    forms: Form[];
    submissions: Submission[];
    folders: FolderItem[];
    loading: boolean;
    // Loaders
    loadForms: () => Promise<void>;
    loadFolders: () => Promise<void>;
    loadSubmissions: (formId: string) => Promise<void>;
    loadAllSubmissions: () => Promise<void>;
    // Form actions
    addForm: (form: Omit<Form, 'id'>) => Promise<Form>;
    updateForm: (id: string, updates: Partial<Form>) => Promise<void>;
    updateFormFields: (id: string, fields: FormField[], gridRows?: GridRow[]) => Promise<void>;
    deleteForm: (id: string) => Promise<void>;
    restoreForm: (id: string) => Promise<void>;
    permanentDeleteForm: (id: string) => Promise<void>;
    addSubmission: (submission: Omit<Submission, 'id'>) => Promise<void>;
    // Folder actions
    addFolder: (name: string) => Promise<void>;
    renameFolder: (id: string, name: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    shareFolder: (id: string, emails: string[]) => Promise<void>;
    moveFolderForms: (fromFolder: string, toFolder: string | undefined) => void; // Keeps optimistic UI simple
    clearAll: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
    forms: [],
    submissions: [],
    folders: [],
    loading: false,

    loadForms: async () => {
        set({ loading: true });
        try {
            const forms = await api.getForms();
            const trash = await api.getTrash();
            set({ forms: [...forms, ...trash], loading: false });
        } catch (e) {
            console.error(e);
            set({ loading: false });
        }
    },

    loadFolders: async () => {
        try {
            const folders = await api.getFolders();
            set({ folders });
        } catch (e) {
            console.error(e);
        }
    },

    loadSubmissions: async (formId) => {
        try {
            const fresh = await api.getSubmissions(formId);
            // Merge: replace all submissions for this formId, keep others
            set(s => ({
                submissions: [
                    ...s.submissions.filter(sub => sub.formId !== formId),
                    ...fresh,
                ],
            }));
        } catch (e) {
            console.error(e);
        }
    },

    loadAllSubmissions: async () => {
        const { forms, loadSubmissions } = get();
        // Load in parallel for all non-deleted forms
        const activeForms = forms.filter(f => !f.isDeleted && !f.id.startsWith('local-'));
        await Promise.allSettled(activeForms.map(f => loadSubmissions(f.id)));
    },

    addForm: async (form) => {
        const created = await api.createForm(form);
        set(s => ({ forms: [created, ...s.forms] }));
        return created;
    },

    updateForm: async (id, updates) => {
        // optimistic
        set(s => ({
            forms: s.forms.map(f => f.id === id ? { ...f, ...updates } : f),
        }));
        // Catch both local placeholders and old LocalStorage schema forms
        if (id.startsWith('local-') || id.startsWith('form-')) return;
        try {
            await api.updateForm(id, updates);
        } catch (err) {
            console.error('Failed to update form', err);
            // Ideally rollback here
        }
    },

    updateFormFields: async (id, fields, gridRows = []) => {
        // optimistic
        set(s => ({
            forms: s.forms.map(f => f.id === id ? { ...f, fields, gridRows } : f),
        }));
        if (id.startsWith('local-') || id.startsWith('form-')) return;
        try {
            await api.updateFormFields(id, { fields, gridRows });
        } catch (e) {
            console.error('Failed to update form fields', e);
        }
    },

    deleteForm: async (id) => {
        // optimistic
        set(s => ({
            forms: s.forms.map(f => f.id === id ? { ...f, isDeleted: true } : f),
        }));
        try {
            await api.deleteForm(id);
        } catch (e) {
            console.error('Failed to delete form', e);
        }
    },

    restoreForm: async (id) => {
        // optimistic
        set(s => ({
            forms: s.forms.map(f => f.id === id ? { ...f, isDeleted: false } : f),
        }));
        try {
            await api.restoreForm(id);
        } catch (e) {
            console.error('Failed to restore form', e);
        }
    },

    permanentDeleteForm: async (id) => {
        // optimistic
        set(s => ({
            forms: s.forms.filter(f => f.id !== id),
            submissions: s.submissions.filter(sub => sub.formId !== id),
        }));
        try {
            await api.permanentDelete(id);
        } catch (e) {
            console.error('Failed to permanent delete form', e);
        }
    },

    addSubmission: async (submission) => {
        // optimistic counter increment (won't show submission row immediately unless re-loaded, but that's fine for public facing)
        set(s => ({
            forms: s.forms.map(f =>
                f.id === submission.formId ? { ...f, submissions: f.submissions + 1 } : f
            ),
        }));
        try {
            const created = await api.addSubmission(submission);
            set(s => ({ submissions: [created, ...s.submissions] }));
        } catch (e) {
            console.error('Failed to add submission', e);
        }
    },

    addFolder: async (name) => {
        try {
            const folder = await api.createFolder({ name });
            set(s => ({ folders: [...s.folders, folder] }));
        } catch (e) {
            console.error('Failed to add folder', e);
        }
    },

    renameFolder: async (id, name) => {
        // optimistic
        const old = get().folders.find(f => f.id === id);
        set(s => ({
            folders: s.folders.map(f => f.id === id ? { ...f, name } : f),
            forms: s.forms.map(f => f.folder === old?.name ? { ...f, folder: name } : f),
        }));
        try {
            await api.updateFolder(id, { name });
        } catch (e) {
            console.error('Failed to rename folder', e);
        }
    },

    deleteFolder: async (id) => {
        // optimistic
        const folder = get().folders.find(f => f.id === id);
        set(s => ({
            folders: s.folders.filter(f => f.id !== id),
            forms: s.forms.map(f => f.folder === folder?.name ? { ...f, folder: undefined } : f),
        }));
        try {
            await api.deleteFolder(id);
        } catch (e) {
            console.error('Failed to delete folder', e);
        }
    },

    shareFolder: async (id, emails) => {
        // optimistic
        set(s => ({
            folders: s.folders.map(f =>
                f.id === id ? { ...f, isShared: true, sharedWith: emails } : f
            ),
        }));
        try {
            await api.updateFolder(id, { isShared: true, sharedWith: emails });
        } catch (e) {
            console.error('Failed to share folder', e);
        }
    },

    moveFolderForms: (fromFolder, toFolder) => {
        set((state) => ({
            forms: state.forms.map((form) =>
                form.folder === fromFolder ? { ...form, folder: toFolder } : form
            ),
        }));
        // Note: Actual API persistence of each form's folder ID would be needed here,
        // but simplified for now based on previous implementation.
    },

    clearAll: () => set({ forms: [], submissions: [], folders: [] }),
}));
