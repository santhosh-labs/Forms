import { Form } from '../../types';
import { Clock, FileCheck, HelpCircle, UserPlus, GitMerge, FileSignature, CheckCircle, Layers } from 'lucide-react';

interface FormApprovalsPanelProps {
    form: Form;
}

const approvalWorkflows = [
    { id: '1', name: 'Manager Approval', description: 'Route submissions to direct manager for review before processing', status: 'Active', steps: 1 },
    { id: '2', name: 'Multi-level HR Review', description: 'Requires HR Associate then HR Director signatures', status: 'Inactive', steps: 2 },
    { id: '3', name: 'IT Security Audit', description: 'Triggers manual security compliance checks on uploaded files', status: 'Draft', steps: 1 },
];

export default function FormApprovalsPanel({ form }: FormApprovalsPanelProps) {
    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Approval Workflows (Mock)</h2>
                        <p className="text-sm text-gray-500 mt-1">Design multi-step approval processes for form submissions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm">
                        <GitMerge size={18} />
                        Create Workflow
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">

                    <div className="space-y-4">
                        {approvalWorkflows.map((workflow) => (
                            <div key={workflow.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:shadow-md transition-all">

                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-lg ${workflow.status === 'Active' ? 'bg-teal-100 text-teal-600' :
                                        workflow.status === 'Inactive' ? 'bg-orange-100 text-orange-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {workflow.status === 'Active' ? <CheckCircle size={24} /> : <FileSignature size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${workflow.status === 'Active' ? 'bg-teal-100 text-teal-700' :
                                                workflow.status === 'Inactive' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-200 text-gray-700'
                                                }`}>
                                                {workflow.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Layers size={14} /> {workflow.steps} Step(s)</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> Auto-reminder: OFF</span>
                                        </div>
                                    </div>
                                </div>

                                <button className="p-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-center">
                                    Edit
                                </button>
                            </div>
                        ))}

                        <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50/50 transition-colors flex justify-center items-center gap-2">
                            <UserPlus size={20} /> Add Another Workflow
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-3">
                                <HelpCircle size={20} /> What are Approvals?
                            </div>
                            <p className="text-sm text-indigo-900/80 leading-relaxed">
                                Approval workflows let you route data to specific team members when a form is submitted.
                                Instead of processing data instantly, the submission is put "on hold" until an authorized user approves, denies, or requests changes.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <FileCheck size={18} className="text-teal-600" /> Pending Approvals
                            </h3>
                            <p className="text-sm text-gray-500">You currently have <strong className="text-gray-900">{form.submissions}</strong> pending submissions awaiting approval for this form.</p>
                            <button className="w-full py-2 bg-gray-50 text-gray-600 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                Go to Approvals Dashboard
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
