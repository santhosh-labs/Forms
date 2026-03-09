import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

// ──────────────────────────────────────────────────────────
// FORMS
// ──────────────────────────────────────────────────────────

// Helper: serialize a full field object into DB columns
function fieldToDb(f: any) {
    const { id: _id, type, label, placeholder, helpText, required, position, subFields, options, ...rest } = f;
    return {
        type,
        label,
        placeholder: placeholder ?? null,
        helpText: helpText ?? null,
        required: required ?? false,
        position: position ?? 0,
        subFields: subFields ?? null,
        // Store the FULL field object so all custom properties survive refresh
        options: { choices: options, ...rest, _full: f },
    };
}

// Helper: restore full field from DB row
function fieldFromDb(f: any) {
    const stored = f.options as Record<string, any> | null;
    if (stored?._full) {
        // Merge DB‐authoritative columns on top of stored full object
        return {
            ...stored._full,
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            required: f.required,
            position: f.position,
            subFields: f.subFields,
            options: stored.choices,
        };
    }
    // Legacy row - return as-is
    return { ...f, options: stored?.choices ?? stored };
}

// GET /api/forms - All non-deleted forms
app.get('/api/forms', async (_req, res) => {
    const forms = await prisma.form.findMany({
        where: { isDeleted: false },
        include: { fields: { orderBy: { position: 'asc' } }, gridRows: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json(forms.map(f => ({ ...f, fields: f.fields.map(fieldFromDb) })));
});

// GET /api/forms/trash - Deleted forms
app.get('/api/forms/trash', async (_req, res) => {
    const forms = await prisma.form.findMany({
        where: { isDeleted: true },
        include: { fields: true },
    });
    res.json(forms.map(f => ({ ...f, fields: f.fields.map(fieldFromDb) })));
});

// GET /api/forms/:id - Single form
app.get('/api/forms/:id', async (req, res) => {
    const form = await prisma.form.findUnique({
        where: { id: req.params.id },
        include: { fields: { orderBy: { position: 'asc' } }, gridRows: true },
    });
    if (!form) return res.status(404).json({ error: 'Not found' });
    res.json({ ...form, fields: form.fields.map(fieldFromDb) });
});

// POST /api/forms - Create form
app.post('/api/forms', async (req, res) => {
    const { name, type, fields, gridRows, settings, theme, rules, folderId } = req.body;
    const form = await prisma.form.create({
        data: {
            name,
            type: type || 'standard',
            settings,
            theme,
            rules,
            folderId,
            fields: { create: (fields || []).map(fieldToDb) },
            gridRows: {
                create: (gridRows || []).map((r: any) => ({
                    columns: r.columns,
                    slots: r.slots,
                })),
            },
        },
        include: { fields: true, gridRows: true },
    });
    res.status(201).json({ ...form, fields: form.fields.map(fieldFromDb) });
});

// PATCH /api/forms/:id - Update form metadata
app.patch('/api/forms/:id', async (req, res) => {
    if (req.params.id.startsWith('local-')) return res.status(400).json({ error: 'Cannot update local form placeholder' });
    const { fields, gridRows, ...data } = req.body;
    const form = await prisma.form.update({
        where: { id: req.params.id },
        data,
    });
    res.json(form);
});

// PATCH /api/forms/:id/fields - Replace all fields and grid rows
app.patch('/api/forms/:id/fields', async (req, res) => {
    if (req.params.id.startsWith('local-')) return res.status(400).json({ error: 'Cannot update local form placeholder' });
    const { fields, gridRows } = req.body;

    // Delete existing fields and gridRows
    await prisma.formField.deleteMany({ where: { formId: req.params.id } });
    await prisma.gridRow.deleteMany({ where: { formId: req.params.id } });

    const form = await prisma.form.update({
        where: { id: req.params.id },
        data: {
            fields: { create: (fields || []).map(fieldToDb) },
            gridRows: {
                create: (gridRows || []).map((r: any) => ({
                    columns: r.columns, slots: r.slots,
                })),
            },
        },
        include: { fields: { orderBy: { position: 'asc' } }, gridRows: true },
    });
    res.json({ ...form, fields: form.fields.map(fieldFromDb) });
});

// DELETE /api/forms/:id - Soft delete
app.delete('/api/forms/:id', async (req, res) => {
    await prisma.form.update({ where: { id: req.params.id }, data: { isDeleted: true } });
    res.json({ success: true });
});

// POST /api/forms/:id/restore - Restore from trash
app.post('/api/forms/:id/restore', async (req, res) => {
    await prisma.form.update({ where: { id: req.params.id }, data: { isDeleted: false } });
    res.json({ success: true });
});

// DELETE /api/forms/:id/permanent - Permanent delete
app.delete('/api/forms/:id/permanent', async (req, res) => {
    await prisma.form.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ──────────────────────────────────────────────────────────
// SUBMISSIONS
// ──────────────────────────────────────────────────────────

// GET /api/submissions/:formId
app.get('/api/submissions/:formId', async (req, res) => {
    const submissions = await prisma.submission.findMany({
        where: { formId: req.params.formId },
        orderBy: { submittedAt: 'desc' },
    });
    res.json(submissions);
});

// POST /api/submissions
app.post('/api/submissions', async (req, res) => {
    const { formId, data } = req.body;
    const submission = await prisma.submission.create({ data: { formId, data } });

    // Increment form submission counter
    await prisma.form.update({
        where: { id: formId },
        data: { submissions: { increment: 1 } },
    });

    res.status(201).json(submission);
});

// DELETE /api/submissions/:id
app.delete('/api/submissions/:id', async (req, res) => {
    await prisma.submission.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ──────────────────────────────────────────────────────────
// FOLDERS
// ──────────────────────────────────────────────────────────

// GET /api/folders
app.get('/api/folders', async (_req, res) => {
    const folders = await prisma.folder.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(folders);
});

// POST /api/folders
app.post('/api/folders', async (req, res) => {
    const { name, color } = req.body;
    const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#f97316', '#6366f1'];
    const count = await prisma.folder.count();
    const folder = await prisma.folder.create({
        data: { name, color: color || COLORS[count % COLORS.length] },
    });
    res.status(201).json(folder);
});

// PATCH /api/folders/:id
app.patch('/api/folders/:id', async (req, res) => {
    const folder = await prisma.folder.update({
        where: { id: req.params.id },
        data: req.body,
    });
    res.json(folder);
});

// DELETE /api/folders/:id
app.delete('/api/folders/:id', async (req, res) => {
    // Move forms out of folder first
    await prisma.form.updateMany({ where: { folderId: req.params.id }, data: { folderId: null } });
    await prisma.folder.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ──────────────────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────────────────

// GET /api/reports
app.get('/api/reports', async (_req, res) => {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(reports);
});

// POST /api/reports
app.post('/api/reports', async (req, res) => {
    const { name, formId, formName, type } = req.body;
    const report = await prisma.report.create({
        data: { name, formId, formName, type: type || 'Summary' },
    });
    res.status(201).json(report);
});

// DELETE /api/reports/:id
app.delete('/api/reports/:id', async (req, res) => {
    await prisma.report.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});

// ──────────────────────────────────────────────────────────
// HEALTH CHECK
// ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error', details: err });
});
app.listen(PORT, () => console.log(`✅ FormFlow API running on http://localhost:${PORT}`));
