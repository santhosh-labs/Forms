import { Form, Submission, FolderItem } from '../types';

const BASE = 'http://localhost:4000/api';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}

// ── Forms ──
export const api = {
    // Forms
    getForms: () => req<Form[]>('/forms'),
    getTrash: () => req<Form[]>('/forms/trash'),
    getForm: (id: string) => req<Form>(`/forms/${id}`),
    createForm: (data: Omit<Form, 'id'>) => req<Form>('/forms', { method: 'POST', body: JSON.stringify(data) }),
    updateForm: (id: string, data: Partial<Form>) =>
        req<Form>(`/forms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateFormFields: (id: string, data: { fields: Form['fields'], gridRows?: Form['gridRows'] }) =>
        req<Form>(`/forms/${id}/fields`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteForm: (id: string) => req<void>(`/forms/${id}`, { method: 'DELETE' }),
    restoreForm: (id: string) => req<void>(`/forms/${id}/restore`, { method: 'POST' }),
    permanentDelete: (id: string) =>
        req<void>(`/forms/${id}/permanent`, { method: 'DELETE' }),

    // Submissions
    getSubmissions: (formId: string) => req<Submission[]>(`/submissions/${formId}`),
    addSubmission: (data: Omit<Submission, 'id'>) => req<Submission>('/submissions', { method: 'POST', body: JSON.stringify(data) }),
    deleteSubmission: (id: string) => req<void>(`/submissions/${id}`, { method: 'DELETE' }),

    // Folders
    getFolders: () => req<FolderItem[]>('/folders'),
    createFolder: (data: { name: string }) => req<FolderItem>('/folders', { method: 'POST', body: JSON.stringify(data) }),
    updateFolder: (id: string, data: Partial<FolderItem>) =>
        req<FolderItem>(`/folders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteFolder: (id: string) => req<void>(`/folders/${id}`, { method: 'DELETE' }),
};
