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
          padding: collapsed ? '9px 0' : '8px 12px',
          margin: '2px 8px',
          borderRadius: 8,
          width: 'calc(100% - 16px)',
          color: active ? '#059669' : '#64748b',
          background: active ? '#ecfdf5' : 'transparent',
          borderLeft: active ? '3px solid #10b981' : '3px solid transparent',
          fontSize: 13.5,
          fontWeight: active ? 600 : 500,
          justifyContent: collapsed ? 'center' : 'flex-start',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = '#f8fafc';
            (e.currentTarget as HTMLElement).style.color = '#334155';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748b';
          }
        }}
      >
        <Icon
          size={16}
          style={{ color: active ? '#10b981' : '#94a3b8', flexShrink: 0 }}
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
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '1px 0 15px rgba(0,0,0,0.02)',
        }}
      >
        {/* ── Logo row ─────────────────────────────────────── */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: 64,
            padding: collapsed ? '0 14px' : '0 16px',
            borderBottom: '1px solid #e2e8f0',
            gap: 12,
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 4px 10px rgba(16,185,129,0.25)',
            }}
          >
            <Zap size={15} className="text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-slate-800 font-extrabold text-[15px] leading-tight" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}>
                FormFlow
              </p>
              <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-emerald-600 mt-0.5" >Enterprise</p>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md transition-all duration-150 ml-auto"
            style={{ color: '#94a3b8', flexShrink: 0 }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
              (e.currentTarget as HTMLElement).style.color = '#475569';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#94a3b8';
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
                  style={{ height: 1, background: '#f1f5f9' }}
                />
              )}

              {/* Section label */}
              {!collapsed && (
                <p
                  className="px-5 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: '#94a3b8' }}
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
          <div className="mx-4 my-2" style={{ height: 1, background: '#f1f5f9' }} />
          <Link
            to="/trash"
            title={collapsed ? 'Trash' : undefined}
            onClick={onMobileClose}
            className="flex items-center transition-all duration-150"
            style={{
              gap: 10,
              padding: collapsed ? '9px 0' : '8px 12px',
              margin: '2px 8px',
              borderRadius: 8,
              width: 'calc(100% - 16px)',
              color: isActive('/trash') ? '#ef4444' : '#94a3b8',
              background: isActive('/trash') ? '#fef2f2' : 'transparent',
              borderLeft: isActive('/trash') ? '3px solid #ef4444' : '3px solid transparent',
              fontSize: 13.5,
              fontWeight: isActive('/trash') ? 600 : 500,
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              if (!isActive('/trash')) {
                (e.currentTarget as HTMLElement).style.background = '#fef2f2';
                (e.currentTarget as HTMLElement).style.color = '#ef4444';
              }
            }}
            onMouseLeave={e => {
              if (!isActive('/trash')) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
              }
            }}
          >
            <Trash2 size={16} style={{ color: isActive('/trash') ? '#ef4444' : '#94a3b8', flexShrink: 0 }} />
            {!collapsed && <span>Trash</span>}
          </Link>
        </nav>

        {/* ── User footer ───────────────────────────────────── */}
        <div
          className="shrink-0"
          style={{ borderTop: '1px solid #e2e8f0', position: 'relative' }}
          ref={userRef}
        >
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center w-full transition-all duration-150"
            style={{
              gap: 10,
              padding: collapsed ? '13px 0' : '15px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 2px 6px rgba(16,185,129,0.25)' }}
            >
              H
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#1e293b', lineHeight: '1.3' }}>Hemanth</p>
                  <p style={{ fontSize: 11.5, color: '#64748b', lineHeight: '1.3' }}>hemanth@formflow.io</p>
                </div>
                <Settings size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
              </>
            )}
          </button>

          {/* User popup menu (opens upward) */}
          {showUserMenu && (
            <div
              className="absolute w-60 rounded-xl overflow-hidden"
              style={{
                bottom: '100%',
                left: collapsed ? 72 : 12,
                right: collapsed ? undefined : 12,
                marginBottom: 8,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.08), 0 0 4px rgba(0,0,0,0.04)',
                zIndex: 50,
              }}
            >
              <div className="px-5 py-4 bg-gray-50/50" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-md font-bold shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                  >H</div>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#1e293b' }}>Hemanth</p>
                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>hemanth@formflow.io</p>
                  </div>
                </div>
                <span
                  className="inline-flex mt-3.5 px-3 py-1 rounded-full shadow-sm"
                  style={{ fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                >
                  Enterprise Plan
                </span>
              </div>
              <div className="py-1.5">
                {[
                  { icon: <User size={15} />, label: 'My Account' },
                  { icon: <Settings size={15} />, label: 'Settings' },
                  { icon: <HelpCircle size={15} />, label: 'Help & Support' },
                ].map(it => (
                  <button
                    key={it.label}
                    className="w-full flex items-center gap-3.5 px-5 py-3 transition-colors duration-100"
                    style={{ fontSize: 13.5, fontWeight: 500, color: '#475569' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#0f172a'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
                  >
                    <span style={{ color: '#94a3b8' }}>{it.icon}</span>
                    {it.label}
                  </button>
                ))}
                <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
                <button
                  className="w-full flex items-center gap-3.5 px-5 py-3 transition-colors duration-100"
                  style={{ fontSize: 13.5, fontWeight: 600, color: '#ef4444' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <LogOut size={15} />
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
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </>
  );
}
