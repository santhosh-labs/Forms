import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Zap, LayoutDashboard, FileText, BarChart3, Folder,
    CheckSquare, ClipboardCheck, Plug, Building2, Users,
    CreditCard, Search, Bell, HelpCircle, ChevronDown,
    Settings, LogOut, User, X,
} from 'lucide-react';

/* ─── Nav items ───────────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: 'Dashboard', icon: <LayoutDashboard size={14} />, path: '/' },
    {
        label: 'Forms', icon: <FileText size={14} />, path: '/', exact: false,
        sub: [
            { label: 'My Forms', path: '/' },
            { label: 'Shared Forms', path: '/shared-forms' },
            { label: 'Org Forms', path: '/org-forms' },
        ]
    },
    { label: 'Reports', icon: <BarChart3 size={14} />, path: '/reports' },
    { label: 'Folders', icon: <Folder size={14} />, path: '/folders' },
    { label: 'Entries', icon: <CheckSquare size={14} />, path: '/tasks' },
    { label: 'Approvals', icon: <ClipboardCheck size={14} />, path: '/approvals' },
    { label: 'Integrations', icon: <Plug size={14} />, path: '/integrations' },
];

const SETTINGS_ITEMS = [
    { label: 'Organization', icon: <Building2 size={14} />, path: '/users' },
    { label: 'Team & Users', icon: <Users size={14} />, path: '/users' },
    { label: 'Billing', icon: <CreditCard size={14} />, path: '/trash' },
];

export default function TopNav() {
    const location = useLocation();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchVal, setSearchVal] = useState('');
    const [showUser, setShowUser] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [openForms, setOpenForms] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const userRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const formsRef = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;
    const isFormsActive = ['/', 'shared-forms', '/org-forms'].some(p => location.pathname === p);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
            if (formsRef.current && !formsRef.current.contains(e.target as Node)) setOpenForms(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            {/* ── Mobile overlay ───────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(3px)' }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Top Navigation Bar ───────────────────────── */}
            <header
                className="fixed top-0 left-0 right-0 z-30 flex items-center"
                style={{
                    height: 52,
                    background: '#0F172A',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                }}
            >
                <div className="flex items-center w-full px-4 gap-0">

                    {/* ── LOGO ─────────────────────────────────── */}
                    <div className="flex items-center gap-2.5 shrink-0 pr-6" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}
                        >
                            <Zap size={13} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-[13px] leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                                FormFlow
                            </p>
                            <p className="text-[9px] leading-tight" style={{ color: 'rgba(148,163,184,0.6)' }}>Enterprise</p>
                        </div>
                    </div>

                    {/* ── DESKTOP NAV ITEMS ────────────────────── */}
                    <nav className="hidden lg:flex items-center gap-0.5 flex-1 px-3 overflow-hidden">
                        {/* Dashboard */}
                        <NavLink to="/" active={isActive('/')} icon={<LayoutDashboard size={13} />} label="Dashboard" />

                        {/* Forms (dropdown) */}
                        <div className="relative" ref={formsRef}>
                            <button
                                onClick={() => setOpenForms(v => !v)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150"
                                style={{
                                    color: isFormsActive ? '#e2e8f0' : 'rgba(148,163,184,0.85)',
                                    backgroundColor: isFormsActive || openForms ? 'rgba(255,255,255,0.08)' : 'transparent',
                                }}
                                onMouseEnter={e => { if (!isFormsActive && !openForms) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (!isFormsActive && !openForms) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                            >
                                <FileText size={13} style={{ color: isFormsActive ? '#818cf8' : 'rgba(100,116,139,0.8)' }} />
                                <span>Forms</span>
                                <ChevronDown size={11} style={{ color: 'rgba(100,116,139,0.7)', transform: openForms ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                            </button>
                            {openForms && (
                                <div
                                    className="absolute left-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden"
                                    style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 50 }}
                                >
                                    {[
                                        { label: 'My Forms', path: '/' },
                                        { label: 'Shared Forms', path: '/shared-forms' },
                                        { label: 'Org Forms', path: '/org-forms' },
                                    ].map(it => (
                                        <Link
                                            key={it.path}
                                            to={it.path}
                                            onClick={() => setOpenForms(false)}
                                            className="flex items-center px-3.5 py-2.5 text-[12.5px] font-medium transition-colors duration-100"
                                            style={{
                                                color: isActive(it.path) ? '#a5b4fc' : 'rgba(148,163,184,0.9)',
                                                backgroundColor: isActive(it.path) ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            }}
                                            onMouseEnter={e => { if (!isActive(it.path)) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                                            onMouseLeave={e => { if (!isActive(it.path)) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                        >
                                            {it.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <NavLink to="/reports" active={isActive('/reports')} icon={<BarChart3 size={13} />} label="Reports" />
                        <NavLink to="/folders" active={isActive('/folders')} icon={<Folder size={13} />} label="Folders" />
                        <NavLink to="/tasks" active={isActive('/tasks')} icon={<CheckSquare size={13} />} label="Entries" />
                        <NavLink to="/approvals" active={isActive('/approvals')} icon={<ClipboardCheck size={13} />} label="Approvals" />

                        {/* Divider */}
                        <div className="mx-1 h-4 w-px" style={{ background: 'rgba(255,255,255,0.1)' }} />

                        {/* Settings dropdown */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setShowSettings(v => !v)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150"
                                style={{
                                    color: 'rgba(148,163,184,0.85)',
                                    backgroundColor: showSettings ? 'rgba(255,255,255,0.08)' : 'transparent',
                                }}
                                onMouseEnter={e => { if (!showSettings) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (!showSettings) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                            >
                                <Settings size={13} style={{ color: 'rgba(100,116,139,0.8)' }} />
                                <span>Settings</span>
                                <ChevronDown size={11} style={{ color: 'rgba(100,116,139,0.7)', transform: showSettings ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
                            </button>
                            {showSettings && (
                                <div
                                    className="absolute left-0 top-full mt-1.5 w-48 rounded-xl overflow-hidden"
                                    style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 50 }}
                                >
                                    {SETTINGS_ITEMS.map(it => (
                                        <Link
                                            key={it.label}
                                            to={it.path}
                                            onClick={() => setShowSettings(false)}
                                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-medium transition-colors duration-100"
                                            style={{ color: 'rgba(148,163,184,0.9)' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.9)'; }}
                                        >
                                            <span style={{ color: 'rgba(100,116,139,0.7)' }}>{it.icon}</span>
                                            {it.label}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* ── RIGHT: Search + Icons + Avatar ───────── */}
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                        {/* Search */}
                        <div
                            className="relative transition-all duration-200 hidden md:block"
                            style={{ width: searchFocused ? 220 : 160 }}
                        >
                            <Search
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150"
                                style={{ color: searchFocused ? '#818cf8' : 'rgba(100,116,139,0.7)' }}
                            />
                            <input
                                type="text"
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                placeholder="Search…"
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="w-full outline-none transition-all duration-200"
                                style={{
                                    height: 32,
                                    paddingLeft: 30,
                                    paddingRight: 10,
                                    fontSize: 12,
                                    borderRadius: 7,
                                    background: searchFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                                    border: searchFocused ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                                    color: '#e2e8f0',
                                    boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                                }}
                            />
                        </div>

                        {/* Help */}
                        <DarkIconBtn title="Help">
                            <HelpCircle size={15} />
                        </DarkIconBtn>

                        {/* Notifications */}
                        <div className="relative" ref={notifRef}>
                            <DarkIconBtn title="Notifications" onClick={() => setShowNotif(v => !v)}>
                                <Bell size={15} />
                            </DarkIconBtn>
                            <span
                                className="absolute top-1.5 right-1.5 rounded-full pointer-events-none"
                                style={{ width: 5, height: 5, background: '#818cf8', boxShadow: '0 0 5px rgba(129,140,248,0.8)' }}
                            />
                            {showNotif && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden"
                                    style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 50 }}
                                >
                                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Notifications</p>
                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>3 new</span>
                                    </div>
                                    {[
                                        { title: 'Form submitted', desc: 'Contact Us received a new response', time: '2m ago' },
                                        { title: 'Approval pending', desc: 'Leave Request from Hemanth.K', time: '1h ago' },
                                        { title: 'Integration synced', desc: 'Google Sheets sync completed', time: '3h ago' },
                                    ].map((n, i) => (
                                        <div key={i} className="px-4 py-3 cursor-pointer transition-colors duration-100"
                                            style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}>
                                            <div className="flex items-start gap-2">
                                                <span className="mt-1.5 rounded-full shrink-0" style={{ width: 5, height: 5, background: '#6366f1' }} />
                                                <div>
                                                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#e2e8f0' }}>{n.title}</p>
                                                    <p style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{n.desc}</p>
                                                    <p style={{ fontSize: 10.5, color: '#475569', marginTop: 3 }}>{n.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="px-4 py-2.5 text-center">
                                        <button style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>View all →</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-5 w-px mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

                        {/* User avatar */}
                        <div className="relative" ref={userRef}>
                            <button
                                onClick={() => setShowUser(v => !v)}
                                className="flex items-center gap-2 px-2 py-1 rounded-lg transition-all duration-150"
                                style={{ background: showUser ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
                                onMouseLeave={e => { if (!showUser) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                                >
                                    H
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', lineHeight: '1.2' }}>Hemanth</p>
                                    <p style={{ fontSize: 10, color: 'rgba(148,163,184,0.7)', lineHeight: '1.2' }}>Free Plan</p>
                                </div>
                                <ChevronDown
                                    size={11}
                                    className={`hidden sm:block transition-transform duration-200 ${showUser ? 'rotate-180' : ''}`}
                                    style={{ color: 'rgba(100,116,139,0.7)' }}
                                />
                            </button>

                            {showUser && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden"
                                    style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 50 }}
                                >
                                    {/* Header */}
                                    <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>H</div>
                                            <div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Hemanth</p>
                                                <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>hemanth@formflow.io</p>
                                            </div>
                                        </div>
                                        <span className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full"
                                            style={{ fontSize: 9.5, fontWeight: 600, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                                            Free Plan
                                        </span>
                                    </div>
                                    {/* Items */}
                                    <div className="py-1">
                                        {[
                                            { icon: <User size={13} />, label: 'My Account' },
                                            { icon: <Settings size={13} />, label: 'Settings' },
                                            { icon: <HelpCircle size={13} />, label: 'Help & Support' },
                                        ].map(it => (
                                            <button
                                                key={it.label}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                                                style={{ fontSize: 12.5, fontWeight: 500, color: '#94a3b8' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                                            >
                                                <span style={{ color: 'rgba(100,116,139,0.7)' }}>{it.icon}</span>
                                                {it.label}
                                            </button>
                                        ))}
                                        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                                        <button
                                            className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                                            style={{ fontSize: 12.5, fontWeight: 500, color: '#f87171' }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                        >
                                            <LogOut size={13} />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
                            style={{ color: 'rgba(148,163,184,0.8)' }}
                        >
                            {mobileOpen ? <X size={16} /> : <LayoutDashboard size={16} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile slide-down menu ────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed top-[52px] left-0 right-0 z-40 lg:hidden"
                    style={{
                        background: '#0F172A',
                        borderBottom: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        padding: '8px 12px 16px',
                    }}
                >
                    {[...NAV_ITEMS, ...SETTINGS_ITEMS].map((it, i) => (
                        <Link
                            key={i}
                            to={it.path}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150"
                            style={{
                                color: isActive(it.path) ? '#a5b4fc' : 'rgba(148,163,184,0.9)',
                                backgroundColor: isActive(it.path) ? 'rgba(99,102,241,0.14)' : 'transparent',
                                marginBottom: 2,
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            <span style={{ color: isActive(it.path) ? '#818cf8' : 'rgba(100,116,139,0.8)' }}>{it.icon}</span>
                            {it.label}
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

/* ─── NavLink helper ─────────────────────────────────────────── */
function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-all duration-150"
            style={{
                color: active ? '#e2e8f0' : 'rgba(148,163,184,0.85)',
                backgroundColor: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
                borderRadius: active ? '6px 6px 0 0' : 6,
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.85)'; } }}
        >
            <span style={{ color: active ? '#818cf8' : 'rgba(100,116,139,0.8)', flexShrink: 0 }}>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

/* ─── Dark icon button ───────────────────────────────────────── */
function DarkIconBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
    return (
        <button
            title={title}
            onClick={onClick}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
            style={{ color: 'rgba(148,163,184,0.7)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.7)'; }}
        >
            {children}
        </button>
    );
}
