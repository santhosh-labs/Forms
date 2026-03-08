import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown, Settings, LogOut, User, Menu, Sparkles } from 'lucide-react';

/* ─── Route → page title ──────────────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  '/': 'My Forms',
  '/shared-forms': 'Shared Forms',
  '/org-forms': 'Org Forms',
  '/reports': 'Reports',
  '/folders': 'My Folders',
  '/shared-folders': 'Shared Folders',
  '/tasks': 'Entries',
  '/approvals': 'Approvals',
  '/integrations': 'Integrations',
  '/users': 'Team & Users',
  '/trash': 'Billing',
};

interface TopbarProps {
  onMenuClick: () => void;
  onNewFormClick?: () => void;
}

export default function Topbar({ onMenuClick, onNewFormClick }: TopbarProps) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showUser, setShowUser] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header
      className="flex items-center shrink-0"
      style={{
        height: 56,
        background: '#ffffff',
        borderBottom: '1px solid #e8ecf0',
        padding: '0 20px',
        gap: 16,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <Menu size={17} />
      </button>

      {/* Page title */}
      <h1
        className="font-bold text-[15px] mr-auto"
        style={{ color: '#0f172a', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>

      {/* Search */}
      <div
        className="relative transition-all duration-200 hidden sm:block"
        style={{ width: searchFocused ? 260 : 180 }}
      >
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
          style={{ color: searchFocused ? '#6366f1' : '#94a3b8' }}
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
            height: 34,
            paddingLeft: 34,
            paddingRight: 36,
            fontSize: 12.5,
            borderRadius: 8,
            background: searchFocused ? '#fff' : '#f8fafc',
            border: searchFocused ? '1.5px solid #6366f1' : '1.5px solid #e2e8f0',
            color: '#0f172a',
            boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
          }}
        />
        <kbd
          className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-[10px] font-medium"
          style={{ color: '#94a3b8', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, padding: '1px 5px' }}
        >
          ⌘K
        </kbd>
      </div>

      {onNewFormClick && (
        <button
          onClick={onNewFormClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#6366f1] text-white text-[12.5px] font-semibold rounded-lg hover:bg-[#4f46e5] transition-colors shadow-sm ml-2"
        >
          <Sparkles size={14} />
          New Form
        </button>
      )}

      {/* Help */}
      <IBtn title="Help">
        <HelpCircle size={16} />
      </IBtn>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <IBtn title="Notifications" onClick={() => setShowNotif(v => !v)}>
          <Bell size={16} />
        </IBtn>
        <span
          className="absolute top-1 right-1 rounded-full pointer-events-none"
          style={{ width: 6, height: 6, background: '#6366f1', boxShadow: '0 0 5px rgba(99,102,241,0.7)' }}
        />
        {showNotif && (
          <div
            className="absolute right-0 top-full mt-2 w-72 rounded-xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(15,23,42,0.12)', zIndex: 50 }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Notifications</p>
              <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '2px 8px', borderRadius: 99 }}>3 new</span>
            </div>
            {[
              { title: 'Form submitted', desc: 'Contact Us received a new response', time: '2m ago' },
              { title: 'Approval pending', desc: 'Leave Request from Hemanth.K', time: '1h ago' },
              { title: 'Integration synced', desc: 'Google Sheets sync completed', time: '3h ago' },
            ].map((n, i) => (
              <div
                key={i}
                className="px-4 py-3 cursor-pointer transition-colors duration-100"
                style={{ borderBottom: i < 2 ? '1px solid #f8fafc' : undefined }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-1.5 rounded-full shrink-0" style={{ width: 6, height: 6, background: '#6366f1' }} />
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>{n.title}</p>
                    <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{n.desc}</p>
                    <p style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 3 }}>{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-4 py-2.5 text-center">
              <button style={{ fontSize: 12, color: '#6366f1', fontWeight: 500 }}>View all notifications →</button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-5 w-px" style={{ background: '#e2e8f0' }} />

      {/* User avatar */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setShowUser(v => !v)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150"
          style={{ background: showUser ? '#f1f5f9' : 'transparent', border: '1px solid transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.border = '1px solid #e2e8f0'; }}
          onMouseLeave={e => { if (!showUser) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.border = '1px solid transparent'; } }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}
          >
            H
          </div>
          <div className="hidden sm:block text-left">
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', lineHeight: '1.2' }}>Hemanth</p>
            <p style={{ fontSize: 10, color: '#94a3b8', lineHeight: '1.2' }}>Free Plan</p>
          </div>
          <ChevronDown
            size={11}
            className={`hidden sm:block transition-transform duration-200 ${showUser ? 'rotate-180' : ''}`}
            style={{ color: '#94a3b8' }}
          />
        </button>

        {showUser && (
          <div
            className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(15,23,42,0.12)', zIndex: 50 }}
          >
            <div className="px-4 py-3.5" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)' }}>H</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Hemanth</p>
                  <p style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>hemanth@formflow.io</p>
                </div>
              </div>
              <span
                className="inline-flex items-center mt-2.5 px-2 py-0.5 rounded-full"
                style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
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
                  style={{ fontSize: 12.5, fontWeight: 500, color: '#374151' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ color: '#94a3b8' }}>{it.icon}</span>
                  {it.label}
                </button>
              ))}
              <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors duration-100"
                style={{ fontSize: 12.5, fontWeight: 500, color: '#ef4444' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ─── Icon button ───────────────────────────────────────────── */
function IBtn({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
      style={{ color: '#94a3b8' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
    >
      {children}
    </button>
  );
}
