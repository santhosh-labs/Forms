import { Form } from '../../types';
import { Copy, Link, Mail, Code, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface FormSharePanelProps {
    form: Form;
}

export default function FormSharePanel({ form }: FormSharePanelProps) {
    const [copied, setCopied] = useState(false);
    const formUrl = `${window.location.origin}/form/${form.id}`;
    const iframeCode = `<iframe src="${formUrl}" width="100%" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Direct Link */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Link className="text-teal-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Direct Link</h2>
                            <p className="text-sm text-gray-500">Share this link directly with respondents</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            readOnly
                            value={formUrl}
                            className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                            onClick={() => copyToClipboard(formUrl)}
                            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap"
                        >
                            <Copy size={18} />
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                    <a
                        href={formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium mt-2"
                    >
                        <ExternalLink size={16} /> Open in new tab
                    </a>
                </div>

                {/* Embed Code */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Code className="text-blue-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Embed Form</h2>
                            <p className="text-sm text-gray-500">Add the form directly to your website</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">Paste this iframe code into your website's HTML:</p>
                        <textarea
                            readOnly
                            value={iframeCode}
                            className="w-full h-24 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => copyToClipboard(iframeCode)}
                            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                        >
                            <Copy size={16} />
                            Copy Embed Code
                        </button>
                    </div>
                </div>

                {/* Email Sharing */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <Mail className="text-orange-600" size={24} />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Email Distribution</h2>
                            <p className="text-sm text-gray-500">Send the form link via email</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <a
                            href={`mailto:?subject=Please fill out: ${form.name}&body=Here is the link to the form: ${formUrl}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                        >
                            <Mail size={18} />
                            Open Email Client
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
}
