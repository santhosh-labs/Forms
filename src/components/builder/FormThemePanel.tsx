import { useState } from 'react';
import {
    Palette, Check, Eye, X, Monitor, Tablet, Smartphone,
    ChevronRight, Plus, Settings2, RotateCcw,
    ImagePlus,
} from 'lucide-react';
import { Form } from '../../types';
import { useFormStore } from '../../store/useFormStore';

/* ─── Types ──────────────────────────────────────────────────── */
interface ThemePreset {
    id: string; name: string;
    primaryColor: string; backgroundColor: string;
    textColor: string; fontFamily: string;
    cardBg: string; headerBg: string; accent: string;
    dark?: boolean;
}

interface CustomTheme {
    fontFamily: string; fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    primaryColor: string; backgroundColor: string; textColor: string;
    headerBg: string; opacity: number;
}

type View = 'gallery' | 'preview' | 'customize';
type Device = 'desktop' | 'tablet' | 'mobile';

/* ─── Preset catalogue ───────────────────────────────────────── */
const THEMES: ThemePreset[] = [
    { id: 'classic', name: 'Classic', primaryColor: '#1f2937', backgroundColor: '#f9fafb', textColor: '#111827', fontFamily: 'Inter', cardBg: 'linear-gradient(135deg,#e0e7ff,#fff)', headerBg: '#1f2937', accent: '#1f2937' },
    { id: 'sandyland', name: 'Sandyland', primaryColor: '#15803d', backgroundColor: '#fef9c3', textColor: '#1a1a1a', fontFamily: 'Lato', cardBg: 'linear-gradient(160deg,#d9f99d,#fef08a,#86efac)', headerBg: '#15803d', accent: '#15803d' },
    { id: 'on-schedule', name: 'On Schedule', primaryColor: '#7c3aed', backgroundColor: '#f0e0ff', textColor: '#1e1b4b', fontFamily: 'Poppins', cardBg: 'linear-gradient(135deg,#ede9fe,#c4b5fd)', headerBg: '#6d28d9', accent: '#7c3aed' },
    { id: 'custom-couture', name: 'Custom Couture', primaryColor: '#be185d', backgroundColor: '#1a1a2e', textColor: '#f9fafb', fontFamily: 'Roboto', cardBg: 'linear-gradient(135deg,#3d0030,#1a0030)', headerBg: '#be185d', accent: '#be185d', dark: true },
    { id: 'auto-repair', name: 'Auto Repair', primaryColor: '#dc2626', backgroundColor: '#fafafa', textColor: '#1f2937', fontFamily: 'Inter', cardBg: 'linear-gradient(135deg,#f5f5f5,#fce7e7)', headerBg: '#1f2937', accent: '#dc2626' },
    { id: 'rock-roll', name: 'Rock & Roll', primaryColor: '#10b981', backgroundColor: '#111827', textColor: '#f9fafb', fontFamily: 'Inter', cardBg: 'linear-gradient(135deg,#0f172a,#1e293b)', headerBg: '#10b981', accent: '#10b981', dark: true },
    { id: 'morning-sky', name: 'Morning Sky', primaryColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0c4a6e', fontFamily: 'Open Sans', cardBg: 'linear-gradient(160deg,#bae6fd,#e0f2fe)', headerBg: '#0ea5e9', accent: '#0ea5e9' },
    { id: 'giving-hands', name: 'Giving Hands', primaryColor: '#0d9488', backgroundColor: '#f0fdfa', textColor: '#134e4a', fontFamily: 'Lato', cardBg: 'linear-gradient(135deg,#ccfbf1,#99f6e4)', headerBg: '#0d9488', accent: '#0d9488' },
    { id: 'highs-lows', name: 'Highs & Lows', primaryColor: '#34d399', backgroundColor: '#064e3b', textColor: '#ecfdf5', fontFamily: 'Inter', cardBg: 'linear-gradient(135deg,#065f46,#064e3b)', headerBg: '#34d399', accent: '#34d399', dark: true },
    { id: 'vacay-chill', name: 'Vacay & Chill', primaryColor: '#f59e0b', backgroundColor: '#fffbeb', textColor: '#1a1a1a', fontFamily: 'Poppins', cardBg: 'linear-gradient(160deg,#fde68a,#fef3c7,#d1fae5)', headerBg: '#f59e0b', accent: '#f59e0b' },
    { id: 'golden-plum', name: 'Golden Plum', primaryColor: '#a855f7', backgroundColor: '#581c87', textColor: '#faf5ff', fontFamily: 'Roboto', cardBg: 'linear-gradient(135deg,#7e22ce,#c026d3)', headerBg: '#a855f7', accent: '#a855f7', dark: true },
    { id: 'bucket-list', name: 'Bucket List', primaryColor: '#3b82f6', backgroundColor: '#eff6ff', textColor: '#1e3a8a', fontFamily: 'Open Sans', cardBg: 'linear-gradient(160deg,#bfdbfe,#dbeafe)', headerBg: '#3b82f6', accent: '#3b82f6' },
];

const FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Nunito', 'Montserrat'];
const FONT_SIZES: CustomTheme['fontSize'][] = ['xs', 'sm', 'md', 'lg', 'xl'];

/* ─── Mini card thumbnail ────────────────────────────────────── */
function ThumbPreview({ t }: { t: ThemePreset }) {
    return (
        <div className="w-full h-full rounded-lg overflow-hidden" style={{ background: t.cardBg }}>
            <div className="h-5 w-full flex items-center px-2 gap-1" style={{ backgroundColor: t.headerBg }}>
                <div className="text-[7px] font-medium text-white/80 truncate">Registration Form</div>
            </div>
            <div className="p-2 space-y-1.5">
                <div className="h-1 w-3/4 rounded-full bg-black/10" />
                <div className="h-4 w-full rounded bg-white/50 border border-black/10" />
                <div className="h-4 w-full rounded bg-white/50 border border-black/10" />
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: t.accent + 'bb' }} />
            </div>
        </div>
    );
}

/* ─── Large form preview (center pane) ──────────────────────── */
function FormPreview({ form, t, device }: { form: Form; t: ThemePreset; device: Device }) {
    const widths: Record<Device, string> = { desktop: '100%', tablet: '600px', mobile: '360px' };
    return (
        <div
            className="transition-all duration-300 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            style={{ width: widths[device], maxWidth: '100%', background: t.backgroundColor, fontFamily: t.fontFamily, color: t.textColor }}
        >
            {/* Header */}
            <div className="px-8 py-5" style={{ backgroundColor: t.headerBg }}>
                <h2 className="text-xl font-bold text-white">{form.name || 'Registration Form'}</h2>
            </div>
            {/* Body */}
            <div className="px-8 py-6 space-y-5">
                {(['Address', 'Email', 'Phone'].map((label, i) => (
                    <div key={i}>
                        <label className="block text-sm font-medium mb-1" style={{ color: t.textColor }}>{label}</label>
                        <div className="h-9 w-full rounded-lg border" style={{ backgroundColor: t.backgroundColor === '#111827' ? '#1f2937' : '#fff', borderColor: '#d1d5db' }} />
                        <p className="text-xs mt-1 opacity-50">{label}</p>
                    </div>
                )))}
                <button className="px-8 py-2.5 rounded-lg text-white text-sm font-semibold shadow" style={{ backgroundColor: t.accent }}>
                    Submit
                </button>
            </div>
        </div>
    );
}

/* ─── Collapsible customization section ──────────────────────── */
function CustSection({ label, children, defaultOpen = false }: { label: string; children?: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/10">
            <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/5"
                onClick={() => setOpen(p => !p)}>
                <span>{label}</span>
                <Plus size={15} className={`transition-transform ${open ? 'rotate-45' : ''} text-gray-400`} />
            </button>
            {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
        </div>
    );
}

/* ─── Main Panel ─────────────────────────────────────────────── */
export default function FormThemePanel({ form }: { form: Form }) {
    const updateForm = useFormStore(s => s.updateForm);
    const appliedId = (form.theme as { __presetId?: string })?.__presetId ?? null;

    const [view, setView] = useState<View>('gallery');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [previewTheme, setPreviewTheme] = useState<ThemePreset>(THEMES[0]);
    const [device, setDevice] = useState<Device>('desktop');
    const [custom, setCustom] = useState<CustomTheme>({
        fontFamily: 'Inter', fontSize: 'md',
        primaryColor: '#0d9488', backgroundColor: '#f9fafb',
        textColor: '#111827', headerBg: '#1f2937', opacity: 100,
    });

    const applyPreset = (t: ThemePreset) => {
        updateForm(form.id, { theme: { primaryColor: t.primaryColor, backgroundColor: t.backgroundColor, textColor: t.textColor, fontFamily: t.fontFamily, __presetId: t.id } as Form['theme'] & { __presetId: string } });
    };

    const applyCustom = () => {
        updateForm(form.id, { theme: { primaryColor: custom.primaryColor, backgroundColor: custom.backgroundColor, textColor: custom.textColor, fontFamily: custom.fontFamily, __presetId: 'scratch' } as Form['theme'] & { __presetId: string } });
        setView('gallery');
    };

    const openPreview = (t: ThemePreset) => { setPreviewTheme(t); setView('preview'); };

    /* ══ PREVIEW MODE ══════════════════════════════════════════ */
    if (view === 'preview') {
        return (
            <div className="flex flex-1 bg-[#1a1a2e] overflow-hidden h-full">
                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-[#12121e] flex items-center justify-between px-4 z-10 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{previewTheme.name}</span>
                        <span className="text-xs text-amber-400 font-medium">(Preview)</span>
                    </div>
                    {/* Device switcher */}
                    <div className="flex items-center gap-3">
                        {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([d, Icon]) => (
                            <button key={d} onClick={() => setDevice(d)}
                                className={`p-1.5 rounded transition-colors ${device === d ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-500 hover:text-gray-300'}`}>
                                <Icon size={18} />
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { applyPreset(previewTheme); setView('gallery'); }}
                            className="px-4 py-1.5 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-400 transition-colors">
                            Apply Theme
                        </button>
                        <button onClick={() => setView('gallery')} className="p-1.5 text-gray-400 hover:text-white"><X size={18} /></button>
                    </div>
                </div>

                {/* Center preview */}
                <div className="flex-1 overflow-auto pt-16 pb-8 px-8 flex items-start justify-center">
                    <FormPreview form={form} t={previewTheme} device={device} />
                </div>

                {/* Right: theme selector */}
                <div className="w-52 bg-[#12121e] border-l border-white/10 pt-16 overflow-y-auto flex-shrink-0">
                    <p className="text-xs font-bold text-gray-400 px-4 py-3 uppercase tracking-wider">Select Theme:</p>
                    <div className="space-y-3 px-3 pb-6">
                        {THEMES.map(t => (
                            <div key={t.id}
                                className={`rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${previewTheme.id === t.id ? 'border-teal-400' : 'border-transparent hover:border-white/20'}`}
                                onClick={() => setPreviewTheme(t)}>
                                <div className="h-24"><ThumbPreview t={t} /></div>
                                <div className="bg-[#1e1e2e] px-2 py-1.5">
                                    <p className="text-[11px] text-gray-300 font-medium truncate">{t.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    /* ══ CUSTOMIZE MODE ════════════════════════════════════════ */
    if (view === 'customize') {
        const previewT: ThemePreset = {
            id: 'scratch', name: 'Custom',
            primaryColor: custom.primaryColor, backgroundColor: custom.backgroundColor,
            textColor: custom.textColor, fontFamily: custom.fontFamily,
            cardBg: custom.backgroundColor, headerBg: custom.headerBg, accent: custom.primaryColor,
        };
        return (
            <div className="flex flex-1 overflow-hidden h-full">
                {/* Left customization panel */}
                <div className="w-52 bg-[#1e1e2e] flex flex-col border-r border-white/10 overflow-y-auto flex-shrink-0">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#1e1e2e] z-10">
                        <div className="flex items-center gap-2 text-white text-sm font-semibold">
                            <Settings2 size={15} className="text-gray-400" />
                            Form Customization
                        </div>
                    </div>

                    <CustSection label="Layout" />

                    <CustSection label="Page" defaultOpen>
                        {/* Font Family */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Font Family</label>
                            <select value={custom.fontFamily} onChange={e => setCustom(p => ({ ...p, fontFamily: e.target.value }))}
                                className="w-full bg-[#12121e] text-gray-200 text-xs border border-white/10 rounded px-2 py-1.5 outline-none">
                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        {/* Font Size */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Font Size</label>
                            <div className="flex gap-1">
                                {FONT_SIZES.map((sz, i) => (
                                    <button key={sz} onClick={() => setCustom(p => ({ ...p, fontSize: sz }))}
                                        className={`flex-1 h-7 rounded border transition-all ${custom.fontSize === sz ? 'border-teal-400 bg-teal-900/30 text-teal-300' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                                        style={{ fontSize: `${9 + i * 2}px`, fontWeight: 600 }}>
                                        A
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Background Color */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Background Color</label>
                            <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8">
                                    <input type="color" value={custom.backgroundColor}
                                        onChange={e => setCustom(p => ({ ...p, backgroundColor: e.target.value }))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ background: `linear-gradient(135deg,${custom.backgroundColor},#e0d0ff)` }} />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white/20 cursor-pointer" style={{ background: `linear-gradient(135deg,${custom.primaryColor},#e0d0ff)` }}
                                    onClick={() => setCustom(p => ({ ...p, backgroundColor: custom.primaryColor }))} />
                            </div>
                        </div>
                        {/* Background Image */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Background Image</label>
                            <div className="h-16 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-white/40">
                                <ImagePlus size={16} className="text-gray-500" />
                                <span className="text-[10px] text-gray-500">Insert Image</span>
                            </div>
                        </div>
                        {/* Opacity */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 flex justify-between">
                                <span>Opacity</span><span className="text-gray-300">{custom.opacity}%</span>
                            </label>
                            <input type="range" min={10} max={100} value={custom.opacity}
                                onChange={e => setCustom(p => ({ ...p, opacity: +e.target.value }))}
                                className="w-full h-1.5 rounded-full cursor-pointer accent-teal-400" />
                        </div>
                        {/* Primary / Header / Text */}
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={custom.primaryColor}
                                    onChange={e => setCustom(p => ({ ...p, primaryColor: e.target.value }))}
                                    className="w-8 h-8 border-0 rounded cursor-pointer p-0" />
                                <span className="text-[10px] font-mono text-gray-400">{custom.primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Header Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={custom.headerBg}
                                    onChange={e => setCustom(p => ({ ...p, headerBg: e.target.value }))}
                                    className="w-8 h-8 border-0 rounded cursor-pointer p-0" />
                                <span className="text-[10px] font-mono text-gray-400">{custom.headerBg}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Text Color</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={custom.textColor}
                                    onChange={e => setCustom(p => ({ ...p, textColor: e.target.value }))}
                                    className="w-8 h-8 border-0 rounded cursor-pointer p-0" />
                                <span className="text-[10px] font-mono text-gray-400">{custom.textColor}</span>
                            </div>
                        </div>
                    </CustSection>

                    <CustSection label="Header" />
                    <CustSection label="Footer" />
                    <CustSection label="Fields & Input" />
                    <CustSection label="Buttons" />
                </div>

                {/* Right: live preview */}
                <div className="flex-1 flex flex-col overflow-hidden" style={{ background: custom.backgroundColor }}>
                    {/* Top bar */}
                    <div className="h-11 bg-white flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">Form Customization</span>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setCustom({ fontFamily: 'Inter', fontSize: 'md', primaryColor: '#0d9488', backgroundColor: '#f9fafb', textColor: '#111827', headerBg: '#1f2937', opacity: 100 })}
                                className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                                <RotateCcw size={11} /> Restore theme defaults
                            </button>
                            <button onClick={applyCustom}
                                className="px-4 py-1.5 bg-teal-500 text-white text-xs font-semibold rounded-lg hover:bg-teal-600 transition-colors">Apply</button>
                            <button onClick={() => setView('gallery')} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
                        <FormPreview form={form} t={previewT} device="desktop" />
                    </div>
                </div>
            </div>
        );
    }

    /* ══ GALLERY ════════════════════════════════════════════════ */
    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#dbeafe 0%,#fae8ff 100%)' }}>
                <div className="max-w-3xl mx-auto px-8 py-12 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Set custom backgrounds, colors, fonts, and more for your form</h2>
                    <p className="text-sm text-gray-500 mb-6">Personalize your form's look to match your brand.</p>
                    <button onClick={() => setView('customize')}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow text-sm transition-all">
                        <Palette size={15} /> Create from Scratch
                    </button>
                    <div className="mt-8 flex flex-col items-center gap-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="h-px w-16 bg-gray-300" />
                            <span>(or) Apply a <span className="text-blue-600 font-medium">theme</span> from the gallery below.</span>
                            <div className="h-px w-16 bg-gray-300" />
                        </div>
                        <ChevronRight size={16} className="text-gray-400 mt-1 rotate-90 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="max-w-5xl mx-auto px-8 py-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 text-xs font-semibold border border-teal-400 text-teal-700 bg-teal-50 rounded-full">Pre-built Themes</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">Choose a pre-designed theme for your form.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {THEMES.map(t => {
                        const isApplied = appliedId === t.id;
                        const isHovered = hoveredId === t.id;
                        return (
                            <div key={t.id}
                                className="group relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                                onMouseEnter={() => setHoveredId(t.id)}
                                onMouseLeave={() => setHoveredId(null)}>

                                {/* Thumbnail */}
                                <div className="h-36"><ThumbPreview t={t} /></div>

                                {/* Applied tick */}
                                {isApplied && (
                                    <div className="absolute top-2 left-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow">
                                        <Check size={11} className="text-white" />
                                    </div>
                                )}

                                {/* Hover overlay */}
                                {isHovered && (
                                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex flex-col items-center justify-center gap-2 transition-all">
                                        <button onClick={() => { applyPreset(t); }}
                                            className="px-6 py-2 bg-teal-500 text-white text-sm font-bold rounded-xl hover:bg-teal-400 shadow-lg transition-colors">
                                            Apply
                                        </button>
                                        <button onClick={() => openPreview(t)}
                                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow">
                                            <Eye size={15} />
                                        </button>
                                    </div>
                                )}

                                {/* Label */}
                                <div className="px-3 py-2 bg-white border-t border-gray-100">
                                    <p className={`text-sm font-semibold ${t.dark ? 'text-gray-800' : 'text-gray-800'} truncate`}>{t.name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
