import { useState, useRef } from 'react';
import {
    X, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
    AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon,
    Table, Minus, Image as ImageIcon, Quote, ChevronDown,
    Superscript, Subscript, Eraser, Tag, LayoutTemplate,
} from 'lucide-react';

interface RichTextModalProps {
    fieldLabel: string;
    content: string;
    onSave: (content: string, label: string) => void;
    onClose: () => void;
}

const FONTS = ['Verdana', 'Arial', 'Georgia', 'Inter', 'Roboto', 'Courier New'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

function DropdownMenu({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setOpen(p => !p)}
                className="flex items-center gap-0.5 px-2 py-1.5 hover:bg-gray-100 rounded text-sm text-gray-700">
                {label} <ChevronDown size={12} />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-max py-1">
                    {children}
                </div>
            )}
        </div>
    );
}

function ToolbarBtn({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) {
    return (
        <button title={title} onClick={onClick}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0">
            {icon}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-gray-200 mx-1 self-center flex-shrink-0" />;
}

export default function RichTextModal({ fieldLabel, content, onSave, onClose }: RichTextModalProps) {
    const [label, setLabel] = useState(fieldLabel);
    const [body, setBody] = useState(content);
    const [font, setFont] = useState('Verdana');
    const [fontSize, setFontSize] = useState(12);
    const editorRef = useRef<HTMLDivElement>(null);

    const charCount = body.replace(/<[^>]*>/g, '').length;
    const maxChars = 69971 - charCount;

    const exec = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        if (editorRef.current) setBody(editorRef.current.innerHTML);
    };

    const handleSave = () => {
        onSave(editorRef.current?.innerHTML ?? body, label);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-4xl h-[80vh]">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#1e2332] rounded-t-xl flex-shrink-0">
                    <h2 className="text-white font-semibold text-base">{label || 'Description'}</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg">
                        <X size={18} />
                    </button>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 flex flex-col overflow-hidden px-6 py-5 gap-4">
                    {/* Field Label row */}
                    <div>
                        <label className="text-sm font-semibold text-red-500 mb-1 block">Field Label</label>
                        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                    </div>

                    {/* Rich text editor area */}
                    <div className="flex-1 flex flex-col border border-gray-300 rounded-lg overflow-hidden">
                        {/* Label row above toolbar */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                            <span className="text-sm font-semibold text-gray-600">Text Editor</span>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium">
                                    <Tag size={12} /> Field Labels
                                </button>
                                <button className="p-1 text-gray-400 hover:text-gray-700">
                                    <LayoutTemplate size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-gray-200 bg-white flex-shrink-0">
                            <ToolbarBtn icon={<Bold size={15} />} title="Bold" onClick={() => exec('bold')} />
                            <ToolbarBtn icon={<Italic size={15} />} title="Italic" onClick={() => exec('italic')} />
                            <ToolbarBtn icon={<Underline size={15} />} title="Underline" onClick={() => exec('underline')} />
                            <ToolbarBtn icon={<Strikethrough size={15} />} title="Strikethrough" onClick={() => exec('strikeThrough')} />
                            <Divider />

                            {/* Font family */}
                            <DropdownMenu label={<span className="text-sm text-gray-700 w-20 truncate">{font}</span>}>
                                {FONTS.map(f => (
                                    <button key={f} onClick={() => { setFont(f); exec('fontName', f); }}
                                        className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50"
                                        style={{ fontFamily: f }}>{f}</button>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            {/* Font size */}
                            <DropdownMenu label={<span className="text-sm text-gray-700">{fontSize}</span>}>
                                {FONT_SIZES.map(s => (
                                    <button key={s} onClick={() => { setFontSize(s); exec('fontSize', '3'); }}
                                        className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50">{s}</button>
                                ))}
                            </DropdownMenu>

                            <Divider />

                            {/* Text color */}
                            <ToolbarBtn title="Text color" icon={
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold leading-none text-gray-800">A</span>
                                    <div className="h-1 w-4 bg-red-500 rounded" />
                                </div>
                            } onClick={() => exec('foreColor', '#e53e3e')} />

                            {/* Highlight */}
                            <ToolbarBtn title="Highlight color" icon={
                                <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold leading-none text-gray-800">A</span>
                                    <div className="h-1 w-4 bg-yellow-300 rounded" />
                                </div>
                            } onClick={() => exec('hiliteColor', '#fef08a')} />

                            <Divider />

                            {/* Alignment */}
                            <DropdownMenu label={<AlignLeft size={15} />}>
                                <button onClick={() => exec('justifyLeft')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><AlignLeft size={14} /> Left</button>
                                <button onClick={() => exec('justifyCenter')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><AlignCenter size={14} /> Center</button>
                                <button onClick={() => exec('justifyRight')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><AlignRight size={14} /> Right</button>
                                <button onClick={() => exec('justifyFull')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><AlignJustify size={14} /> Justify</button>
                            </DropdownMenu>

                            {/* Lists */}
                            <DropdownMenu label={<List size={15} />}>
                                <button onClick={() => exec('insertUnorderedList')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><List size={14} /> Bullet List</button>
                                <button onClick={() => exec('insertOrderedList')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><ListOrdered size={14} /> Numbered List</button>
                            </DropdownMenu>

                            {/* Indent */}
                            <DropdownMenu label={<span className="text-xs font-bold text-gray-600">↕</span>}>
                                <button onClick={() => exec('indent')} className="px-3 py-1.5 text-sm hover:bg-gray-50 w-full text-left">Indent</button>
                                <button onClick={() => exec('outdent')} className="px-3 py-1.5 text-sm hover:bg-gray-50 w-full text-left">Outdent</button>
                            </DropdownMenu>

                            <Divider />

                            {/* Superscript / Subscript */}
                            <DropdownMenu label={<Superscript size={15} />}>
                                <button onClick={() => exec('superscript')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><Superscript size={14} /> Superscript</button>
                                <button onClick={() => exec('subscript')} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 w-full"><Subscript size={14} /> Subscript</button>
                            </DropdownMenu>

                            <Divider />

                            <ToolbarBtn icon={<Quote size={15} />} title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')} />
                            <ToolbarBtn icon={<Eraser size={15} />} title="Clear formatting" onClick={() => exec('removeFormat')} />
                            <Divider />
                            <ToolbarBtn icon={<LinkIcon size={15} />} title="Insert link" onClick={() => {
                                const url = window.prompt('Enter URL:');
                                if (url) exec('createLink', url);
                            }} />
                            <ToolbarBtn icon={<Table size={15} />} title="Insert table" />
                            <ToolbarBtn icon={<Minus size={15} />} title="Horizontal rule" onClick={() => exec('insertHorizontalRule')} />
                            <ToolbarBtn icon={<ImageIcon size={15} />} title="Insert image" />
                        </div>

                        {/* Editable content */}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={() => { if (editorRef.current) setBody(editorRef.current.innerHTML); }}
                            className="flex-1 px-4 py-3 text-sm text-gray-700 outline-none overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                            style={{ fontFamily: font, fontSize: `${fontSize}px`, minHeight: '200px' }}
                            dangerouslySetInnerHTML={{ __html: body || '' }}
                            data-placeholder="Add content..."
                        />

                        {/* Character count */}
                        <div className="flex justify-end px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                            <span className="text-xs text-gray-400 font-mono">{Math.max(0, maxChars)}</span>
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex-shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-2 text-sm text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button onClick={handleSave}
                        className="px-6 py-2 text-sm bg-[#1e2332] text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
