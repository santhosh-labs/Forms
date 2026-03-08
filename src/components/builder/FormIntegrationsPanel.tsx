import { Form } from '../../types';
import { Database, Mail, Webhook, FileJson, Layers, Search, Slack, Trello, Calendar } from 'lucide-react';

interface FormIntegrationsPanelProps {
    form: Form;
}

const integrations = [
    { id: 'gsheets', name: 'Google Sheets', icon: <Database className="text-emerald-600" size={24} />, description: 'Send form responses to a Google Spreadsheet instantly.', connected: false },
    { id: 'slack', name: 'Slack', icon: <Slack className="text-pink-600" size={24} />, description: 'Get notified in a Slack channel for every new submission.', connected: false },
    { id: 'mailchimp', name: 'Mailchimp', icon: <Mail className="text-yellow-500" size={24} />, description: 'Automatically add respondents to your email lists.', connected: false },
    { id: 'webhooks', name: 'Webhooks', icon: <Webhook className="text-blue-600" size={24} />, description: 'Send a POST request with form data to a custom URL.', connected: false },
    { id: 'salesforce', name: 'Salesforce', icon: <Layers className="text-indigo-600" size={24} />, description: 'Create leads or contacts in Salesforce CRM.', connected: false },
    { id: 'trello', name: 'Trello', icon: <Trello className="text-blue-500" size={24} />, description: 'Create Trello cards for tasks from submissions.', connected: false },
    { id: 'calendar', name: 'Google Calendar', icon: <Calendar className="text-blue-400" size={24} />, description: 'Create events in Google Calendar from date fields.', connected: false },
];

export default function FormIntegrationsPanel({ form }: FormIntegrationsPanelProps) {
    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Integrations (Mock)</h2>
                        <p className="text-sm text-gray-500 mt-1">Connect your form [{form.name}] with third-party applications</p>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                    {integration.icon}
                                </div>
                                {integration.connected ? (
                                    <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200">
                                        Connected
                                    </span>
                                ) : null}
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                            <p className="text-sm text-gray-500 mb-6 flex-1 hover:text-gray-700">{integration.description}</p>

                            <button className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${integration.connected
                                    ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                                }`}>
                                {integration.connected ? 'Configure' : 'Integrate'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100 flex items-start gap-4">
                    <FileJson className="text-blue-600 shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-medium text-blue-900 mb-1">Looking for API access?</h3>
                        <p className="text-sm text-blue-800">You can also use our REST API to pull responses programmatically or send data directly into your own systems.</p>
                        <button className="mt-3 text-sm font-medium text-blue-700 hover:underline">View API Documentation</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
