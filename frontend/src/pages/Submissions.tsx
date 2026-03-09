import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useFormStore } from '../store/useFormStore';

/* ─── Smart Value Formatter ──────────────────────────────────── */
function formatValue(value: unknown, fieldType?: string): string {
  if (value === undefined || value === null || value === '') return '—';

  // Arrays (checkboxes, multiple choice, etc.)
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map(v => formatValue(v)).join(', ');
  }

  // Plain objects — handle known field shapes
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    // Name field: { prefix, first, last, middle, suffix }
    if ('first' in obj || 'last' in obj) {
      return [obj.prefix, obj.first, obj.middle, obj.last, obj.suffix]
        .filter(Boolean).join(' ').trim() || '—';
    }

    // Address field: { street, city, state, zip, country }
    if ('street' in obj || 'city' in obj) {
      return [obj.street, obj.apt, obj.city, obj.state, obj.zip, obj.country]
        .filter(Boolean).join(', ').trim() || '—';
    }

    // Phone field: { countryCode, number }
    if ('number' in obj && ('countryCode' in obj || 'code' in obj)) {
      const code = obj.countryCode || obj.code || '';
      return `${code} ${obj.number}`.trim() || '—';
    }

    // Geolocation: { lat, lng }
    if ('lat' in obj && 'lng' in obj) {
      return `${Number(obj.lat).toFixed(6)}, ${Number(obj.lng).toFixed(6)}`;
    }

    // Date range: { start, end }
    if ('start' in obj && 'end' in obj) {
      return `${obj.start} → ${obj.end}`;
    }

    // Matrix field: rows with responses
    if (fieldType?.startsWith('matrix')) {
      return Object.entries(obj)
        .map(([row, val]) => `${row}: ${val}`)
        .join(' | ');
    }

    // Fallback: try JSON, trim if long
    try {
      const json = JSON.stringify(obj);
      return json.length > 80 ? json.slice(0, 77) + '…' : json;
    } catch {
      return '[complex value]';
    }
  }

  // Boolean
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  return String(value);
}

/* ─── Cell renderer — shows badges for booleans, etc. ────────── */
function CellValue({ value, fieldType }: { value: unknown; fieldType?: string }) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-gray-300">—</span>;
  }

  // Boolean / yes-no / terms
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    const isYes = value === true || value === 'true';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${isYes ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
        {isYes ? <Check size={10} /> : <X size={10} />}
        {isYes ? 'Yes' : 'No'}
      </span>
    );
  }

  // Rating — show stars
  if (fieldType === 'rating') {
    const stars = Number(value);
    return (
      <span className="text-amber-400 text-[13px]">
        {'★'.repeat(Math.min(stars, 10))}
        <span className="text-gray-200">{'★'.repeat(Math.max(0, 5 - stars))}</span>
      </span>
    );
  }

  const formatted = formatValue(value, fieldType);
  return <span className="text-gray-700">{formatted}</span>;
}

/* ─── Submissions Page ───────────────────────────────────────── */
const PAGE_SIZE = 25;

export default function Submissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const form = useFormStore((state) => state.forms.find((f) => f.id === id));
  const allSubmissions = useFormStore((state) => state.submissions);
  const loadSubmissions = useFormStore((state) => state.loadSubmissions);
  const rawSubmissions = allSubmissions.filter((s) => s.formId === id);

  // Always re-fetch from DB when viewing this page
  useEffect(() => {
    if (id) loadSubmissions(id);
  }, [id]);

  if (!form || form.isDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h2>
          <button onClick={() => navigate('/')} className="text-teal-600 hover:text-teal-700">
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const fields = form.fields.map(f => ({ label: f.label, type: f.type }));

  // Search across all field values
  const filtered = useMemo(() => {
    if (!search.trim()) return rawSubmissions;
    const q = search.toLowerCase();
    return rawSubmissions.filter(sub => {
      if (sub.id.toLowerCase().includes(q)) return true;
      return fields.some(f => {
        const v = formatValue(sub.data[f.label], f.type).toLowerCase();
        return v.includes(q);
      });
    });
  }, [rawSubmissions, search, fields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // CSV Export
  const handleExport = () => {
    const headers = ['Submission ID', 'Submitted At', ...fields.map(f => f.label)];
    const rows = rawSubmissions.map(sub => [
      sub.id,
      new Date(sub.submittedAt).toLocaleString(),
      ...fields.map(f => `"${formatValue(sub.data[f.label], f.type).replace(/"/g, '""')}"`)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.name}-submissions.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/builder/${id}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{form.name}</h1>
                <p className="text-sm text-teal-600 font-medium">
                  {rawSubmissions.length} submission{rawSubmissions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search submissions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm text-gray-600">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Submission ID
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Submitted At
                  </th>
                  {fields.map((f, i) => (
                    <th
                      key={i}
                      className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {f.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + fields.length}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      {search ? 'No submissions match your search.' : 'No submissions yet.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 max-w-[120px] block truncate">
                          {submission.id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-500 text-[12.5px]">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      {fields.map((f, i) => (
                        <td
                          key={i}
                          className="px-5 py-3.5 text-[12.5px] max-w-[200px]"
                        >
                          <CellValue value={submission.data[f.label]} fieldType={f.type} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="text-sm text-gray-500">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-200 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...'
                      ? <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                      : <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-white'}`}
                      >
                        {p}
                      </button>
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-200 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
