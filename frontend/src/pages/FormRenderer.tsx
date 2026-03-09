import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormField, GridRow } from '../types';
import { useFormStore } from '../store/useFormStore';
import * as Icons from 'lucide-react';
import { ArrowLeft, Image as ImageIcon, MapPin, Info, UploadCloud } from 'lucide-react';

export default function FormRenderer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const form = useFormStore((state) => state.forms.find((f) => f.id === id));
    const addSubmission = useFormStore((state) => state.addSubmission);

    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [submitted, setSubmitted] = useState(false);
    const [showWelcome, setShowWelcome] = useState(!!form?.welcomePage?.enabled);
    const loading = useFormStore((state) => state.loading);

    if (!form || form.isDeleted) {
        if (loading && !form) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found or in trash</h2>
                </div>
            </div>
        );
    }

    if (form.settings?.isClosed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow p-8 max-w-lg w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">This form is closed</h2>
                    <p className="text-gray-600">The owner of this form has stopped accepting new responses.</p>
                </div>
            </div>
        );
    }

    const handleChange = (label: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [label]: value }));
    };

    const checkCondition = (rule: { fieldId: string; operator: string; value: string }) => {
        const fieldName = form.fields.find((f: FormField) => f.id === rule.fieldId)?.label || '';
        const fieldValue = formData[fieldName];
        if (fieldValue === undefined || fieldValue === '') return false;

        const val = String(fieldValue).toLowerCase();
        const target = rule.value.toLowerCase();

        switch (rule.operator) {
            case 'equals': return val === target;
            case 'not_equals': return val !== target;
            case 'contains': return val.includes(target);
            case 'greater_than': return Number(val) > Number(target);
            case 'less_than': return Number(val) < Number(target);
            default: return false;
        }
    };

    const isFieldVisible = (fieldId: string) => {
        const targetingRules = (form.rules || []).filter((r: { action: { targetFieldId: string }, condition: unknown }) => r.action.targetFieldId === fieldId);
        if (targetingRules.length === 0) return true;

        let isVisible = true;
        for (const rule of targetingRules) {
            const conditionMet = checkCondition(rule.condition);
            if (rule.action.type === 'show') {
                isVisible = conditionMet;
            } else if (rule.action.type === 'hide') {
                if (conditionMet) return false;
            }
        }
        return isVisible;
    };

    const renderRows = (form.gridRows && form.gridRows.length > 0) ? form.gridRows : form.fields.map((f: FormField) => ({
        id: `fallback-${f.id}`,
        columns: 1 as const,
        slots: [{ id: `slot-${f.id}`, field: f }]
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSubmission({
            formId: form.id,
            submittedAt: new Date().toISOString(),
            data: formData,
        });

        if (form.settings?.redirectUrl) {
            window.location.href = form.settings.redirectUrl;
        } else {
            setSubmitted(true);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                    <p className="text-gray-600 mb-6">
                        {form.settings?.successMessage || 'Your response has been successfully recorded.'}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const theme = form.theme || { primaryColor: '#0d9488', backgroundColor: '#f9fafb', fontFamily: 'Inter', textColor: '#111827' };

    if (showWelcome && form.welcomePage?.enabled) {
        return (
            <div className={`min-h-screen py-8 px-4 flex flex-col items-center justify-center`} style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily, color: theme.textColor }}>
                <div className={`max-w-4xl w-full bg-white text-gray-900 rounded-2xl shadow-xl overflow-hidden flex flex-col ${form.welcomePage.layout === 'left' ? 'md:flex-row' : ''}`}>

                    {/* Media Section */}
                    {form.welcomePage.mediaUrl && (
                        <div className={`${form.welcomePage.layout === 'left' ? 'w-full md:w-1/2' : 'w-full max-h-96 text-center bg-gray-50 flex items-center justify-center p-4'}`}>
                            {form.welcomePage.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                <img src={form.welcomePage.mediaUrl} className="max-w-full max-h-96 object-contain" alt="Welcome Page Media" />
                            ) : (
                                <video src={form.welcomePage.mediaUrl} controls className="max-w-full max-h-96 bg-black" />
                            )}
                        </div>
                    )}

                    {/* Content Section */}
                    <div className={`${form.welcomePage.layout === 'left' ? 'w-full md:w-1/2' : 'w-full'} p-10 flex flex-col justify-center`}>
                        <h1 className="text-4xl font-extrabold mb-6 tracking-tight">{form.name}</h1>

                        {form.welcomePage.content && (
                            <div
                                className="prose prose-lg max-w-none text-gray-600 mb-10 leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: form.welcomePage.content }}
                            />
                        )}

                        <div className="mt-auto pt-4">
                            <button
                                onClick={() => setShowWelcome(false)}
                                style={{ backgroundColor: theme.primaryColor }}
                                className="w-full sm:w-auto px-10 py-3.5 text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md transform hover:-translate-y-0.5"
                            >
                                Start Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily, color: theme.textColor }}>
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 hover:opacity-80 mb-6 transition-opacity"
                >
                    <ArrowLeft size={20} />
                    Go Back
                </button>
                <div
                    className="bg-white rounded-xl shadow-lg p-8 text-gray-900"
                    style={{ borderTop: `6px solid ${theme.primaryColor}` }}
                >
                    <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
                    {form.settings?.description && (
                        <p className="opacity-80 mb-6 pb-4 border-b border-gray-100 whitespace-pre-wrap">
                            {form.settings.description}
                        </p>
                    )}
                    {!form.settings?.description && <div className="mb-6 pb-4 border-b border-gray-100" />}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {renderRows.map((row: GridRow) => (
                            <div
                                key={row.id}
                                className={`grid gap-6 ${row.columns === 1 ? 'grid-cols-1' : row.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}
                            >
                                {row.slots.map((slot: { id: string; field?: FormField }) => {
                                    const field = slot.field;
                                    if (!field || !isFieldVisible(field.id)) {
                                        return <div key={slot.id} className="hidden sm:block" />;
                                    }

                                    return (
                                        <div key={slot.id} className="space-y-2">
                                            {field.type !== 'instructions' && (
                                                <label className="block text-sm font-semibold text-gray-900">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1.5">*</span>}
                                                </label>
                                            )}
                                            {field.helpText && field.type !== 'instructions' && <p className="text-sm text-gray-500">{field.helpText}</p>}

                                            {(() => {
                                                switch (field.type) {
                                                    case 'name':
                                                        return (
                                                            <div className="grid grid-cols-2 gap-4 pt-1 w-full">
                                                                <div>
                                                                    <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                        onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), first: e.target.value })}
                                                                        required={field.required} />
                                                                    <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">First Name</p>
                                                                </div>
                                                                <div>
                                                                    <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                        onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), last: e.target.value })} />
                                                                    <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Last Name</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'address': {
                                                        const elements = field.addressElements || [
                                                            'Street Address', 'Address Line 2', 'City',
                                                            'State/Region/Province', 'Postal / Zip Code', 'Country'
                                                        ].map(l => ({ label: l, visible: true, mandatory: false }));

                                                        const isVisible = (label: string) => elements.find(e => e.label === label)?.visible !== false;
                                                        const isMandatory = (label: string) => field.required || elements.find(e => e.label === label)?.mandatory;
                                                        const countries = field.allowedCountries?.length ? field.allowedCountries : ['United States', 'United Kingdom', 'Canada', 'Australia', 'India'];

                                                        return (
                                                            <div className="space-y-4 pt-1 w-full">
                                                                {isVisible('Street Address') && (
                                                                    <div>
                                                                        <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                            onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), street: e.target.value })}
                                                                            required={isMandatory('Street Address')} />
                                                                        <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Street Address</p>
                                                                    </div>
                                                                )}
                                                                {isVisible('Address Line 2') && (
                                                                    <div>
                                                                        <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                            onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), line2: e.target.value })}
                                                                            required={isMandatory('Address Line 2')} />
                                                                        <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Address Line 2</p>
                                                                    </div>
                                                                )}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    {isVisible('City') && (
                                                                        <div>
                                                                            <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                                onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), city: e.target.value })}
                                                                                required={isMandatory('City')} />
                                                                            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">City</p>
                                                                        </div>
                                                                    )}
                                                                    {isVisible('State/Region/Province') && (
                                                                        <div>
                                                                            <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                                onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), state: e.target.value })}
                                                                                required={isMandatory('State/Region/Province')} />
                                                                            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">State/Region/Province</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    {isVisible('Postal / Zip Code') && (
                                                                        <div>
                                                                            <input type="text" className="w-full px-3 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                                onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), zip: e.target.value })}
                                                                                required={isMandatory('Postal / Zip Code')} />
                                                                            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Postal / Zip Code</p>
                                                                        </div>
                                                                    )}
                                                                    {isVisible('Country') && (
                                                                        <div>
                                                                            <div className="relative">
                                                                                <select className="w-full pl-3 pr-7 py-2.5 border border-[#e2e8f0] rounded bg-white text-[13px] font-bold text-[#1e293b] appearance-none outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                                                    defaultValue={field.defaultCountry || ''}
                                                                                    onChange={(e) => handleChange(field.label, { ...(formData[field.label] as Record<string, unknown> || {}), country: e.target.value })}
                                                                                    required={isMandatory('Country')}>
                                                                                    <option value="">-Select-</option>
                                                                                    {countries.map((country: string) => (
                                                                                        <option key={country} value={country}>{country}</option>
                                                                                    ))}
                                                                                </select>
                                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none">
                                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                                                </div>
                                                                            </div>
                                                                            <p className="text-[12px] text-[#64748b] mt-1.5 font-medium">Country</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    case 'textbox':
                                                    case 'email':
                                                    case 'phone':
                                                    case 'number':
                                                    case 'decimal':
                                                    case 'currency':
                                                    case 'website':
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="relative group">
                                                                    {field.prefix && (
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                                                                            {field.prefix}
                                                                        </span>
                                                                    )}
                                                                    <input
                                                                        type={field.type === 'number' || field.type === 'decimal' || field.type === 'currency' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                                                                        placeholder={field.placeholder || ''}
                                                                        required={field.required}
                                                                        defaultValue={String(field.defaultValue || '')}
                                                                        onChange={(e) => handleChange(field.label, e.target.value)}
                                                                        className={`w-full ${field.prefix ? 'pl-8' : 'px-4'} ${field.suffix ? 'pr-12' : 'px-4'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all`}
                                                                    />
                                                                    {field.suffix && (
                                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold pointer-events-none">
                                                                            {field.suffix}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'multiline':
                                                        return (
                                                            <textarea
                                                                placeholder={field.placeholder || ''}
                                                                required={field.required}
                                                                rows={4}
                                                                onChange={(e) => handleChange(field.label, e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all resize-y"
                                                            />
                                                        );
                                                    case 'dropdown':
                                                    case 'matrix_dropdown':
                                                        return (
                                                            <select
                                                                required={field.required}
                                                                multiple={field.allowMultipleChoices}
                                                                value={(formData[field.label] as string | string[]) || (field.allowMultipleChoices ? [] : '')}
                                                                onChange={(e) => {
                                                                    if (field.allowMultipleChoices) {
                                                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                                                        handleChange(field.label, values);
                                                                    } else {
                                                                        handleChange(field.label, e.target.value);
                                                                    }
                                                                }}
                                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all"
                                                            >
                                                                {!field.allowMultipleChoices && <option value="">Select an option...</option>}
                                                                {field.options?.map((opt: string, i: number) => (
                                                                    <option key={i} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        );
                                                    case 'radio':
                                                    case 'multiple_choice':
                                                        return (
                                                            <div className="space-y-2">
                                                                {(field.options || ['Option 1', 'Option 2']).map((opt: string, i: number) => (
                                                                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={field.id}
                                                                            value={opt}
                                                                            required={field.required}
                                                                            checked={formData[field.label] === opt}
                                                                            onChange={(e) => handleChange(field.label, e.target.value)}
                                                                            className="text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                                                                        />
                                                                        <span className="text-gray-700">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        );
                                                    case 'yes_no':
                                                        return (
                                                            <div className="flex gap-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleChange(field.label, 'Yes')}
                                                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${formData[field.label] === 'Yes' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-200'}`}
                                                                >
                                                                    {field.yesLabel || 'Yes'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleChange(field.label, 'No')}
                                                                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium ${formData[field.label] === 'No' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-teal-200'}`}
                                                                >
                                                                    {field.noLabel || 'No'}
                                                                </button>
                                                            </div>
                                                        );
                                                    case 'terms':
                                                    case 'decision_box':
                                                        return (
                                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    required={field.required}
                                                                    checked={!!formData[field.label]}
                                                                    onChange={(e) => handleChange(field.label, e.target.checked)}
                                                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                                                />
                                                                <span className="text-sm text-gray-600 leading-relaxed">
                                                                    {field.termsText || (field.type === 'terms' ? 'I agree to the terms and conditions' : 'I agree')}
                                                                    {field.termsLink && (
                                                                        <a href={field.termsLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-teal-600 hover:underline font-medium">
                                                                            Read more
                                                                        </a>
                                                                    )}
                                                                </span>
                                                            </label>
                                                        );
                                                    case 'checkbox':
                                                        return (
                                                            <div className="space-y-2">
                                                                {(field.options || ['Option 1']).map((opt: string, i: number) => (
                                                                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            value={opt}
                                                                            onChange={(e) => {
                                                                                const current = (formData[field.label] as string[]) || [];
                                                                                const newArr = e.target.checked
                                                                                    ? [...current, opt]
                                                                                    : current.filter((x: string) => x !== opt);
                                                                                handleChange(field.label, newArr.length > 0 ? newArr : undefined);
                                                                            }}
                                                                            className="text-teal-600 focus:ring-teal-500 rounded w-4 h-4 cursor-pointer"
                                                                        />
                                                                        <span className="text-gray-700">{opt}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        );
                                                    case 'date':
                                                        return (
                                                            <input
                                                                type="date"
                                                                required={field.required}
                                                                onChange={(e) => handleChange(field.label, e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all"
                                                            />
                                                        );
                                                    case 'time':
                                                        return (
                                                            <input
                                                                type="time"
                                                                required={field.required}
                                                                onChange={(e) => handleChange(field.label, e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all"
                                                            />
                                                        );
                                                    case 'rating': {
                                                        const Icon = field.ratingShape === 'heart' ? Icons.Heart : field.ratingShape === 'smile' ? Icons.Smile : Icons.Star;
                                                        const scale = field.ratingScale || 5;
                                                        const currentVal = Number(formData[field.label]) || 0;
                                                        return (
                                                            <div className="flex gap-2">
                                                                {[...Array(scale)].map((_, i) => {
                                                                    const val = i + 1;
                                                                    return (
                                                                        <button
                                                                            key={val}
                                                                            type="button"
                                                                            onClick={() => handleChange(field.label, val)}
                                                                            className="focus:outline-none"
                                                                        >
                                                                            <Icon
                                                                                size={32}
                                                                                className={
                                                                                    (currentVal >= val)
                                                                                        ? "text-yellow-400 fill-yellow-400"
                                                                                        : "text-gray-300 hover:text-yellow-200 transition-colors"
                                                                                }
                                                                            />
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    case 'slider':
                                                        return (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="range"
                                                                    min={field.minLimit || 0}
                                                                    max={field.maxLimit || 100}
                                                                    step={field.step || 1}
                                                                    value={Number(formData[field.label]) || field.minLimit || 0}
                                                                    onChange={(e) => handleChange(field.label, Number(e.target.value))}
                                                                    className="w-full accent-teal-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                                />
                                                                <div className="flex justify-between text-xs text-gray-400 font-medium">
                                                                    <span>{field.minLimit || 0}</span>
                                                                    <span className="text-teal-600 font-bold">{String(formData[field.label] || field.minLimit || 0)}</span>
                                                                    <span>{field.maxLimit || 100}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'instructions':
                                                        return (
                                                            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 shadow-sm">
                                                                <div className="shrink-0 mt-0.5">
                                                                    <Info size={18} className="text-blue-500" />
                                                                </div>
                                                                <div
                                                                    className="prose prose-sm max-w-none text-blue-800/80 leading-relaxed font-medium"
                                                                    dangerouslySetInnerHTML={{ __html: field.helpText || field.label || 'Instruction text goes here...' }}
                                                                />
                                                            </div>
                                                        );
                                                    case 'image_choices': {
                                                        const isMulti = field.imageChoiceType === 'multiple';
                                                        const choices = field.imageChoices || [
                                                            { id: '1', label: 'Option 1', value: '1' },
                                                            { id: '2', label: 'Option 2', value: '2' }
                                                        ];
                                                        const current = (formData[field.label] as string[]) || [];

                                                        return (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {choices.map((choice) => {
                                                                    const isSelected = isMulti ? current.includes(String(choice.value)) : formData[field.label] === String(choice.value);
                                                                    return (
                                                                        <label key={choice.id} className={`group relative flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-teal-500 hover:bg-teal-50/30'}`}>
                                                                            <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                                                                                {choice.url ? (
                                                                                    <img src={choice.url} alt={choice.label} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <ImageIcon size={32} className="text-gray-300 group-hover:text-teal-400 transition-colors" />
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 w-full px-1">
                                                                                <input
                                                                                    type={isMulti ? 'checkbox' : 'radio'}
                                                                                    name={field.id}
                                                                                    value={choice.value}
                                                                                    checked={isSelected}
                                                                                    onChange={(e) => {
                                                                                        if (isMulti) {
                                                                                            const next = e.target.checked
                                                                                                ? [...current, String(choice.value)]
                                                                                                : current.filter(val => val !== String(choice.value));
                                                                                            handleChange(field.label, next);
                                                                                        } else {
                                                                                            handleChange(field.label, String(choice.value));
                                                                                        }
                                                                                    }}
                                                                                    className="text-teal-600 focus:ring-teal-500 w-4 h-4"
                                                                                />
                                                                                <span className="text-sm font-medium text-gray-700 truncate">{choice.label}</span>
                                                                            </div>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }
                                                    case 'geo_complete':
                                                    case 'map_location':
                                                        return (
                                                            <div className="relative group">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter a location..."
                                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all shadow-sm group-hover:border-gray-400"
                                                                />
                                                                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                                                <div className="mt-2 h-32 bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400 font-medium">
                                                                    Map preview will be shown here
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'signature':
                                                        return (
                                                            <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-inner">
                                                                <div className="h-32 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center">
                                                                    <p className="text-xs text-gray-400 font-medium select-none">Sign here</p>
                                                                </div>
                                                                <div className="mt-2 flex justify-end">
                                                                    <button type="button" className="text-[10px] uppercase tracking-wider font-bold text-gray-400 hover:text-gray-600">Clear Signature</button>
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'file':
                                                    case 'image_upload':
                                                    case 'audio_video_upload':
                                                        return (
                                                            <div className="flex items-center justify-center w-full">
                                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all border-teal-500/20 hover:border-teal-500">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <UploadCloud size={24} className="text-gray-400 mb-2 group-hover:text-teal-500" />
                                                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                                        <p className="text-xs text-gray-400">PDF, PNG, JPG (MAX. 10MB)</p>
                                                                    </div>
                                                                    <input type="file" className="hidden" />
                                                                </label>
                                                            </div>
                                                        );
                                                    default:
                                                        return (
                                                            <input
                                                                type="text"
                                                                placeholder={field.placeholder || ''}
                                                                required={field.required}
                                                                onChange={(e) => handleChange(field.label, e.target.value)}
                                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white transition-all"
                                                            />
                                                        );
                                                }
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                style={{ backgroundColor: theme.primaryColor }}
                                className="w-full sm:w-auto px-8 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                            >
                                {form.settings?.submitText || 'Submit Response'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
