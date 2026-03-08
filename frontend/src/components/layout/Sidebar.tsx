import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Zap, FileText, BarChart2, Folder, CheckSquare, CheckCircle2,
  Trash2, ChevronLeft, ChevronRight, Settings, LogOut, HelpCircle, User,
  Share2, Users, FolderOpen, SlidersHorizontal,
} from 'lucide-react';

/* ─── Navigation structure (matches reference image) ────────── */
const SECTIONS = [
  {
    label: 'Forms',
    color: '#34d399',
    items: [
      { id: 'my-forms', label: 'My Forms', icon: FileText, path: '/' },
      { id: 'shared-forms', label: 'Shared Forms', icon: Share2, path: '/shared-forms' },
      { id: 'org-forms', label: "Org Users' Forms", icon: Users, path: '/org-forms' },
    ],
  },
  {
    label: 'Reports',
    color: '#34d399',
    items: [
      { id: 'my-reports', label: 'My Reports', icon: BarChart2, path: '/reports' },
      { id: 'shared-reports', label: 'Shared Reports', icon: BarChart2, path: '/shared-reports' },
    ],
  },
  {
    label: 'Folders',
    color: '#34d399',
    items: [
      { id: 'my-folders', label: 'My Folders', icon: Folder, path: '/folders' },
      { id: 'shared-folders', label: 'Shared Folders', icon: FolderOpen, path: '/shared-folders' },
    ],
  },
  {
    label: 'Manage',
    color: '#34d399',
    items: [
      { id: 'my-tasks', label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
      { id: 'my-approvals', label: 'My Approvals', icon: CheckCircle2, path: '/approvals' },
    ],
  },
  {
    label: 'Setup',
    color: '#34d399',
    items: [
      { id: 'users', label: 'Users', icon: User, path: '/users' },
      { id: 'control-panel', label: 'Control Panel', icon: SlidersHorizontal, path: '/control-panel' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onCollapsedChange, mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const W = collapsed ? 68 : 240;

  /* ── Shared nav link renderer ── */
  const NavLink = ({ item }: { item: typeof SECTIONS[0]['items'][0] }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        title={collapsed ? item.label : undefined}
        onClick={onMobileClose}
        className="flex items-center transition-all duration-150"
        style={{
          gap: 10,
          padding: collapsed ? '9px 0' : '7px 12px',
          margin: '1px 6px',
          borderRadius: 8,
          width: 'calc(100% - 12px)',
          color: active ? '#e2e8f0' : 'rgba(148,163,184,0.75)',
          background: active ? 'rgba(52,211,153,0.12)' : 'transparent',
          borderLeft: active ? '2.5px solid #34d399' : '2.5px solid transparent',
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          justifyContent: collapsed ? 'center' : 'flex-start',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.75)';
          }
        }}
      >
        <Icon
          size={15}
          style={{ color: active ? '#34d399' : 'rgba(100,116,139,0.75)', flexShrink: 0 }}
        />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: W,
          background: 'linear-gradient(180deg, #0d1526 0%, #0a1020 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '2px 0 20px rgba(0,0,0,0.35)',
        }}
      >
        {/* ── Logo row ─────────────────────────────────────── */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: 58,
            padding: collapsed ? '0 14px' : '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: 10,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg,#3B82F6,#6366F1)',
              boxShadow: '0 0 14px rgba(99,102,241,0.45)',
            }}
          >
            <Zap size={15} className="text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-[13.5px] leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
                FormFlow
              </p>
              <p className="text-[9.5px] leading-tight" style={{ color: 'rgba(148,163,184,0.5)' }}>Enterprise</p>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md transition-all duration-150 ml-auto"
            style={{ color: 'rgba(100,116,139,0.6)', flexShrink: 0 }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'rgba(100,116,139,0.6)';
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* ── Nav sections ─────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 sidebar-scroll">
          {SECTIONS.map((section, si) => (
            <div key={section.label}>
              {/* Section divider (not before first) */}
              {si > 0 && (
                <div
                  className="mx-4 my-2"
                  style={{ height: 1, background: 'rgba(255,255,255,0.06)' }}
                />
              )}

              {/* Section label */}
              {!collapsed && (
                <p
                  className="px-4 pt-1 pb-1.5 text-[11px] font-semibold"
                  style={{ color: '#34d399' }}
                >
                  {section.label}
                </p>
              )}

              {/* Items */}
              {section.items.map(item => (
                <NavLink key={item.id} item={item} />
              ))}
            </div>
          ))}

          {/* ── Trash (special red item at bottom of nav) ── */}
          <div className="mx-4 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <Link
            to="/trash"
            title={collapsed ? 'Trash' : undefined}
            onClick={onMobileClose}
            className="flex items-center transition-all duration-150"
            style={{
              gap: 10,
              padding: collapsed ? '9px 0' : '7px 12px',
              margin: '1px 6px',
              borderRadius: 8,
              width: 'calc(100% - 12px)',
              color: isActive('/trash') ? '#f87171' : 'rgba(248,113,113,0.6)',
              background: isActive('/trash') ? 'rgba(239,68,68,0.1)' : 'transparent',
              borderLeft: isActive('/trash') ? '2.5px solid #f87171' : '2.5px solid transparent',
              fontSize: 13,
              fontWeight: isActive('/trash') ? 600 : 400,
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              if (!isActive('/trash')) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLElement).style.color = '#f87171';
              }
            }}
            onMouseLeave={e => {
              if (!isActive('/trash')) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(248,113,113,0.6)';
              }
            }}
          >
            <Trash2 size={15} style={{ color: isActive('/trash') ? '#f87171' : 'rgba(248,113,113,0.6)', flexShrink: 0 }} />
            {!collapsed && <span>Trash</span>}
          </Link>
        </nav>

        {/* ── User footer ───────────────────────────────────── */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}
          ref={userRef}
        >
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center w-full transition-all duration-150"
            style={{
              gap: 10,
              padding: collapsed ? '13px 0' : '12px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
            >
              H
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: '#e2e8f0', lineHeight: '1.3' }}>Hemanth</p>
                  <p style={{ fontSize: 10.5, color: 'rgba(148,163,184,0.55)', lineHeight: '1.3' }}>hemanth@formflow.io</p>
                </div>
                <Settings size={13} style={{ color: 'rgba(100,116,139,0.5)', flexShrink: 0 }} />
              </>
            )}
          </button>

          {/* User popup menu (opens upward) */}
          {showUserMenu && (
            <div
              className="absolute w-52 rounded-xl overflow-hidden"
              style={{
                bottom: '100%',
                left: collapsed ? 72 : 12,
                right: collapsed ? undefined : 12,
                marginBottom: 8,
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
                zIndex: 50,
              }}
            >
              <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
                  >H</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Hemanth</p>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>hemanth@formflow.io</p>
                  </div>
                </div>
                <span
                  className="inline-flex mt-2.5 px-2 py-0.5 rounded-full"
                  style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}
                >
                  Free Plan
                </span>
              </div>
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
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
                  >
                    <span style={{ color: 'rgba(100,116,139,0.7)' }}>{it.icon}</span>
                    {it.label}
                  </button>
                ))}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                  style={{ fontSize: 12.5, fontWeight: 500, color: '#f87171' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>
    </>
  );
}
