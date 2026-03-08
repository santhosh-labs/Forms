import { useState, useEffect } from 'react';
import { Form, FormRule } from '../../types';
import { useFormStore } from '../../store/useFormStore';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface FormRulesPanelProps {
    form: Form;
}

export default function FormRulesPanel({ form }: FormRulesPanelProps) {
    const updateForm = useFormStore((state) => state.updateForm);
    const [rules, setRules] = useState<FormRule[]>(form.rules || []);

    useEffect(() => {
        updateForm(form.id, { rules });
    }, [rules, updateForm, form.id]);

    const addRule = () => {
        const newRule: FormRule = {
            id: `rule-${Date.now()}`,
            condition: {
                fieldId: form.fields[0]?.id || '',
                operator: 'equals',
                value: '',
            },
            action: {
                type: 'show',
                targetFieldId: form.fields[1]?.id || '',
            }
        };
        setRules([...rules, newRule]);
    };

    const updateRule = (id: string, updates: Partial<FormRule>) => {
        setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    if (form.fields.length < 2) {
        return (
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-lg text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Not Enough Fields</h2>
                    <p className="text-gray-500">You need at least 2 fields in your form to create conditional logic rules.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Field Rules (Conditional Logic)</h2>
                        <p className="text-sm text-gray-500 mt-1">Show or hide fields based on user responses</p>
                    </div>
                    <button
                        onClick={addRule}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus size={18} />
                        Add New Rule
                    </button>
                </div>

                {rules.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center border-dashed border-2">
                        <p className="text-gray-500 mb-4">No rules created yet. Add a rule to make your form dynamic.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.map((rule, index) => (
                            <div key={rule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group">

                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Rule {index + 1}</h3>

                                <button
                                    onClick={() => removeRule(rule.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">

                                    {/* Condition (IF) */}
                                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <span className="text-sm font-semibold text-gray-700 block mb-2 px-1">IF</span>

                                        <select
                                            value={rule.condition.fieldId}
                                            onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, fieldId: e.target.value } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                                        >
                                            {form.fields.map(f => (
                                                <option key={f.id} value={f.id}>{f.label || 'Untitled Field'}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={rule.condition.operator}
                                            onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, operator: e.target.value as FormRule['condition']['operator'] } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white font-medium text-teal-700"
                                        >
                                            <option value="equals">Equals To</option>
                                            <option value="not_equals">Does Not Equal</option>
                                            <option value="contains">Contains</option>
                                            <option value="greater_than">Is Greater Than</option>
                                            <option value="less_than">Is Less Than</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={rule.condition.value}
                                            onChange={(e) => updateRule(rule.id, { condition: { ...rule.condition, value: e.target.value } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none text-sm bg-white"
                                        />
                                    </div>

                                    <div className="hidden md:flex flex-col items-center text-gray-300">
                                        <div className="h-4 w-px bg-gray-200"></div>
                                        <ArrowRight size={24} className="my-2" />
                                        <div className="h-4 w-px bg-gray-200"></div>
                                    </div>
                                    <div className="md:hidden flex justify-center text-gray-300">
                                        <ArrowRight size={24} className="rotate-90 my-2" />
                                    </div>

                                    {/* Action (THEN) */}
                                    <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                        <span className="text-sm font-semibold text-blue-800 block mb-2 px-1">THEN</span>

                                        <select
                                            value={rule.action.type}
                                            onChange={(e) => updateRule(rule.id, { action: { ...rule.action, type: e.target.value as FormRule['action']['type'] } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white font-medium text-blue-700"
                                        >
                                            <option value="show">Show</option>
                                            <option value="hide">Hide</option>
                                        </select>

                                        <span className="text-xs text-center block text-gray-500 font-medium">FIELD</span>

                                        <select
                                            value={rule.action.targetFieldId}
                                            onChange={(e) => updateRule(rule.id, { action: { ...rule.action, targetFieldId: e.target.value } })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                        >
                                            {form.fields.map(f => (
                                                <option key={f.id} value={f.id}>{f.label || 'Untitled Field'}</option>
                                            ))}
                                        </select>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
