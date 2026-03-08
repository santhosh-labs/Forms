import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFormStore } from '../store/useFormStore';

export default function Submissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const form = useFormStore((state) => state.forms.find((f) => f.id === id));
  const allSubmissions = useFormStore((state) => state.submissions);
  const submissions = allSubmissions.filter((s) => s.formId === id);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-teal-600 hover:text-teal-700"
          >
            Go back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const fieldLabels = form.fields.map((f) => f.label);
  const allColumns = ['Submission ID', 'Submitted At', ...fieldLabels];

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-sm text-gray-500">
                  {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {allColumns.map((col, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allColumns.length}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      {fieldLabels.map((label, index) => (
                        <td
                          key={index}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                        >
                          {String(submission.data[label] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {submissions.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {submissions.length} of {submissions.length} results
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                </button>
                <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-medium">
                  1
                </button>
                <button className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
