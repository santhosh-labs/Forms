import { useState, useMemo } from 'react';
import MainLayout from '../components/layout/MainLayout';
import {
    Users, Plus, Search, ChevronDown, Check, X,
    Shield, UserCircle2, MessageSquare, Crown,
    Filter, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────── */
type Role = 'Super Admin' | 'Admin' | 'User' | 'Respondent';
type UserStatus = 'Active' | 'Inactive';

interface OrgUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    status: UserStatus;
    avatarColor: string;
    joinedAt: string;
}

const ROLE_COLORS: Record<Role, string> = {
    'Super Admin': 'bg-violet-500/15 text-violet-600 border-violet-500/25',
    'Admin': 'bg-primary/15 text-primary border-primary/25',
    'User': 'bg-muted text-foreground border-border',
    'Respondent': 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
    'Super Admin': <Crown size={12} />,
    'Admin': <Shield size={12} />,
    'User': <UserCircle2 size={12} />,
    'Respondent': <MessageSquare size={12} />,
};

const AVATAR_COLORS = [
    'bg-orange-500', 'bg-blue-500', 'bg-purple-500',
    'bg-teal-500', 'bg-pink-500', 'bg-amber-500',
];

/* ─── Add User Modal ─────────────────────────────────────────── */
function AddUserModal({ onClose, onAdd }: {
    onClose: () => void;
    onAdd: (user: Omit<OrgUser, 'id' | 'joinedAt'>) => void;
}) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<Role>('User');

    const handleAdd = () => {
        if (!email.trim() || !name.trim()) return;
        onAdd({
            email: email.trim(),
            name: name.trim(),
            role,
            status: 'Active',
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in border border-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground">Add User</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Full Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
                            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-1">Email Address</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="user@company.com"
                            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Role</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['Admin', 'User', 'Respondent'] as Role[]).map(r => (
                                <button key={r} type="button" onClick={() => setRole(r)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted'
                                        }`}
                                >
                                    <span className={`flex items-center justify-center w-5 h-5 rounded-full ${role === r ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {ROLE_ICONS[r]}
                                    </span>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                    <button onClick={handleAdd} disabled={!email.trim() || !name.trim()}
                        className="btn-primary px-4 py-2 text-sm rounded-lg font-semibold disabled:opacity-50">
                        Add User
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Change Super Admin Modal ───────────────────────────────── */
function ChangeSuperAdminModal({ users, onClose, onTransfer }: {
    users: OrgUser[]; onClose: () => void; onTransfer: (id: string) => void;
}) {
    const [selected, setSelected] = useState('');
    const candidates = users.filter(u => u.role !== 'Super Admin' && u.status === 'Active');

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in border border-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground">Change Super Admin</h2>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground">
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-muted-foreground mb-4">Select the user to become the new Super Admin. The current Super Admin will be downgraded to Admin.</p>
                    {candidates.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No eligible users. Add more active users first.</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {candidates.map(u => (
                                <button key={u.id} onClick={() => setSelected(u.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all ${selected === u.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.avatarColor}`}>
                                        {u.name[0].toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </div>
                                    {selected === u.id && <Check size={16} className="ml-auto text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="px-6 pb-5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors font-medium">Cancel</button>
                    <button
                        onClick={() => { if (selected) { onTransfer(selected); onClose(); } }}
                        disabled={!selected}
                        className="btn-primary px-4 py-2 text-sm rounded-lg font-semibold disabled:opacity-50"
                    >
                        Confirm Transfer
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
    return (
        <div className={`bg-card rounded-xl border border-border p-5 shadow-sm ${colorClass}`}>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-2 text-muted-foreground">
                <Users size={13} />
                {label}
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────── */
const INITIAL_USERS: OrgUser[] = [
    {
        id: 'u1',
        email: 'san.cloudx.io@gmail.com',
        name: 'San Cloud',
        role: 'Super Admin',
        status: 'Active',
        avatarColor: 'bg-orange-500',
        joinedAt: '2024-01-01',
    },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];
type RoleFilter = Role | 'All';

export default function UserManagement() {
    const [users, setUsers] = useState<OrgUser[]>(INITIAL_USERS);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
    const [search, setSearch] = useState('');
    const [roleTab, setRoleTab] = useState<RoleFilter>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
    const availableUsers = totalUsers - activeUsers;

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchRole = roleTab === 'All' || u.role === roleTab;
            const matchStatus = statusFilter === 'All' || u.status === statusFilter;
            const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase());
            return matchRole && matchStatus && matchSearch;
        });
    }, [users, roleTab, statusFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleAdd = (data: Omit<OrgUser, 'id' | 'joinedAt'>) => {
        setUsers(prev => [...prev, { ...data, id: `u-${Date.now()}`, joinedAt: new Date().toISOString().split('T')[0] }]);
    };

    const handleTransferSuperAdmin = (newAdminId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.role === 'Super Admin') return { ...u, role: 'Admin' as Role };
            if (u.id === newAdminId) return { ...u, role: 'Super Admin' as Role };
            return u;
        }));
    };

    const handleToggleStatus = (id: string) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    };

    return (
        <MainLayout onNewFormClick={() => { }}>
            <div className="max-w-6xl mx-auto animate-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground tracking-tight">User Management</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage team members, roles, and permissions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSuperAdminModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-semibold"
                        >
                            <Crown size={15} /> Change Super Admin
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg"
                        >
                            <Plus size={15} /> Add User
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                    <StatCard label="Total Users" value={totalUsers} colorClass="" />
                    <StatCard label="Active Users" value={activeUsers} colorClass="" />
                    <StatCard label="Inactive Users" value={inactiveUsers} colorClass="" />
                    <StatCard label="Available Seats" value={availableUsers} colorClass="" />
                </div>

                {/* Table card */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    {/* Role tabs + search/filter */}
                    <div className="flex items-center justify-between px-6 pt-4 border-b border-border">
                        {/* Role tabs */}
                        <div className="flex items-center gap-8">
                            {(['All Users', 'Admin', 'User', 'Respondent'] as const).map(tab => {
                                const filter: RoleFilter = tab === 'All Users' ? 'All' : tab as Role;
                                const isActive = roleTab === filter;
                                return (
                                    <button
                                        key={tab}
                                        onClick={() => { setRoleTab(filter); setPage(1); }}
                                        className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground/80'
                                            }`}
                                    >
                                        {tab}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search + filter */}
                        <div className="flex items-center gap-2 pb-3">
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search users..."
                                    className="pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-48 bg-background text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={e => { setStatusFilter(e.target.value as 'All' | UserStatus); setPage(1); }}
                                    className="appearance-none pl-8 pr-6 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-card text-foreground cursor-pointer"
                                >
                                    <option value="All">All</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3.5 bg-background text-xs font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                        <span>Email / Name</span>
                        <span>Role</span>
                        <span>Status</span>
                        <span></span>
                    </div>

                    {/* Rows */}
                    {paginated.length === 0 ? (
                        <div className="py-16 text-center">
                            <Users size={40} className="mx-auto text-muted mb-3" />
                            <p className="text-muted-foreground text-sm">No users found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/30">
                            {paginated.map(user => (
                                <div key={user.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/60 transition-colors">
                                    {/* Avatar + email */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${user.avatarColor}`}>
                                            {user.name[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.name}</p>
                                        </div>
                                    </div>

                                    {/* Role badge */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ROLE_COLORS[user.role]}`}>
                                            {ROLE_ICONS[user.role]}
                                            {user.role}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <button
                                            onClick={() => handleToggleStatus(user.id)}
                                            title="Click to toggle status"
                                            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest rounded-full px-2.5 py-1 border transition-colors ${user.status === 'Active'
                                                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25'
                                                : 'bg-muted text-muted-foreground border-border'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                                            {user.status}
                                        </button>
                                    </div>

                                    <div className="w-4"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination footer */}
                    <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-muted/20">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            View
                            <select
                                value={pageSize}
                                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                                className="border border-border rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary bg-card text-foreground"
                            >
                                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            per page
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>
                                {filtered.length === 0
                                    ? '0 results'
                                    : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`
                                }
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
            {showSuperAdminModal && <ChangeSuperAdminModal users={users} onClose={() => setShowSuperAdminModal(false)} onTransfer={handleTransferSuperAdmin} />}
        </MainLayout>
    );
}
