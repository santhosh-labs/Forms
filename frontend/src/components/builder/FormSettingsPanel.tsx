import { useState, useEffect } from 'react';
import { Form } from '../../types';
import { useFormStore } from '../../store/useFormStore';

interface FormSettingsPanelProps {
    form: Form;
}

export default function FormSettingsPanel({ form }: FormSettingsPanelProps) {
    const updateForm = useFormStore((state) => state.updateForm);
    const [settings, setSettings] = useState(form.settings || {
        description: '',
        submitText: 'Submit',
        successMessage: 'Thank You! Your response has been successfully recorded.',
        redirectUrl: '',
        isClosed: false,
    });

    useEffect(() => {
        updateForm(form.id, { settings });
    }, [settings, updateForm, form.id]);

    const handleChange = (key: keyof typeof settings, value: string | boolean) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Form Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure general settings for your form</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Form Description</label>
                        <textarea
                            value={settings.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Enter a brief description or instructions for your respondents"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none h-24 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Submit Button Text</label>
                        <input
                            type="text"
                            value={settings.submitText}
                            onChange={(e) => handleChange('submitText', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Success Message</label>
                        <textarea
                            value={settings.successMessage}
                            onChange={(e) => handleChange('successMessage', e.target.value)}
                            placeholder="Message shown after submission"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none h-24 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URL (Optional)</label>
                        <input
                            type="url"
                            value={settings.redirectUrl}
                            onChange={(e) => handleChange('redirectUrl', e.target.value)}
                            placeholder="https://example.com/thank-you"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">If set, respondents will be redirected here after submitting.</p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.isClosed}
                                onChange={(e) => handleChange('isClosed', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Close Form</span>
                            <span className="text-xs text-gray-500">Stop accepting new responses</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
