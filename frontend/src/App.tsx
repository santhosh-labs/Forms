import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import Submissions from './pages/Submissions';
import FormRenderer from './pages/FormRenderer';
import Trash from './pages/Trash';
import FeaturePage from './pages/FeaturePage';
import MyTasks from './pages/MyTasks';
import MyReports from './pages/MyReports';
import UserManagement from './pages/UserManagement';
import MyFolders from './pages/MyFolders';
import SharedFolders from './pages/SharedFolders';
import OrgForms from './pages/OrgForms';
import SharedForms from './pages/SharedForms';
import MyApprovals from './pages/MyApprovals';
import { BarChart3, SlidersHorizontal } from 'lucide-react';
import { useEffect } from 'react';
import { useFormStore } from './store/useFormStore';

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const loadForms = useFormStore(s => s.loadForms);
  const loadFolders = useFormStore(s => s.loadFolders);
  const loadAllSubmissions = useFormStore(s => s.loadAllSubmissions);

  useEffect(() => {
    // Load forms first, then all submissions in parallel
    loadForms().then(() => loadAllSubmissions());
    loadFolders();
  }, [loadForms, loadFolders, loadAllSubmissions]);

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AppBootstrap>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/shared-forms" element={<SharedForms />} />
          <Route path="/org-forms" element={<OrgForms />} />

          <Route path="/builder/:id" element={<FormBuilder />} />
          <Route path="/submissions/:id" element={<Submissions />} />
          <Route path="/form/:id" element={<FormRenderer />} />

          <Route path="/reports" element={<MyReports />} />
          <Route path="/reports/:reportId" element={<MyReports />} />
          <Route path="/shared-reports" element={<FeaturePage title="Shared Reports" description="Reports shared with you by other users will appear here." icon={BarChart3} />} />
          <Route path="/folders" element={<MyFolders />} />
          <Route path="/shared-folders" element={<SharedFolders />} />

          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/approvals" element={<MyApprovals />} />

          <Route path="/users" element={<UserManagement />} />
          <Route path="/control-panel" element={<FeaturePage title="Control Panel" description="Manage your organization settings and preferences." icon={SlidersHorizontal} />} />

          <Route path="/trash" element={<Trash />} />
        </Routes>
      </AppBootstrap>
    </Router>
  );
}

export default App;
