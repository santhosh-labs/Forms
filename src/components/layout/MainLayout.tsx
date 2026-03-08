import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
  onNewFormClick?: () => void;
}

const SIDEBAR_W = 240; // expanded width
const COLLAPSED_W = 68; // collapsed width

export default function MainLayout({ children, onNewFormClick }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sideW = collapsed ? COLLAPSED_W : SIDEBAR_W;

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* ── Fixed left sidebar ────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Right column: topbar + content ────────── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: sideW }}
      >
        {/* Sticky topbar */}
        <div className="sticky top-0 z-20">
          <Topbar onMenuClick={() => setMobileOpen(true)} onNewFormClick={onNewFormClick} />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              padding: '28px 28px',
              width: '100%',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
