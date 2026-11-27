import { useState } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Lock,
  CheckCircle2, XCircle, Search, Filter, History, Eye,
  Edit, ToggleLeft, ToggleRight, Sparkles, AlertCircle
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { initialRoles, initialPermissions } from '@/data/accountsMockData';
import { formatDate } from '@/utils/formatters';
import type { UserAccount, UserActivityLog, RoleInfo, PermissionInfo } from '@/types';

export default function UserAccounts() {
  const {
    userAccounts,
    addUserAccount,
    updateUserAccount,
    toggleUserStatus,
    resetUserPassword,
    activityLogs,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'logs'>('users');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
  const [viewingUser, setViewingUser] = useState<UserAccount | null>(null);

  // Form State for User Creation
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserAccount['role']>('staff');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Filtered Users
  const filteredUsers = userAccounts.filter((u) => {
    const matchRole = selectedRole === 'all' || u.role === selectedRole;
    const matchStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && u.isActive) ||
      (selectedStatus === 'inactive' && !u.isActive);
    return matchRole && matchStatus;
  });

  const handleCreateUser = () => {
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      addToast('Please enter full name, email, and password', 'error');
      return;
    }
    if (formPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    addUserAccount({
      fullName: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      phone: formPhone.trim(),
      city: formCity.trim(),
      isActive: formIsActive,
      permissions: formRole === 'super_admin' ? ['all'] : formRole === 'admin' ? ['payments', 'financial', 'users'] : ['orders'],
    });

    setIsCreateOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormCity('');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserAccount(editingUser.id, {
      fullName: formName.trim() || editingUser.fullName,
      role: formRole,
      phone: formPhone.trim(),
      city: formCity.trim(),
      isActive: formIsActive,
    });
    setEditingUser(null);
  };

  const handleResetPassword = () => {
    if (!resettingUser) return;
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    resetUserPassword(resettingUser.id, newPassword);
    setResettingUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setFormName(u.fullName);
    setFormRole(u.role);
    setFormPhone(u.phone || '');
    setFormCity(u.city || '');
    setFormIsActive(u.isActive);
  };

  // User table columns
  const userColumns = [
    {
      key: 'fullName',
      label: 'User Name',
      sortable: true,
      render: (u: UserAccount) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-xs">
            {u.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-xs text-text-primary">{u.fullName}</p>
            <p className="text-[11px] text-text-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role / Access',
      sortable: true,
      render: (u: UserAccount) => {
        let roleBg = 'bg-gray-100 text-gray-700';
        if (u.role === 'super_admin') roleBg = 'bg-purple-100 text-purple-800 border border-purple-200';
        else if (u.role === 'admin') roleBg = 'bg-primary/10 text-primary border border-primary/20';
        else if (u.role === 'staff') roleBg = 'bg-blue-100 text-blue-800';

        const roleLabel =
          u.role === 'super_admin'
            ? '⚡ Super Admin'
            : u.role === 'admin'
            ? '🛡️ Admin'
            : u.role === 'staff'
            ? '👤 Staff'
            : '🛒 Customer';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleBg}`}>
            {roleLabel}
          </span>
        );
      },
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (u: UserAccount) => (
        <span className="text-xs text-text-secondary">{u.phone || u.city || '—'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (u: UserAccount) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
          }`}
        >
          {u.isActive ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (u: UserAccount) => (
        <span className="text-[11px] text-text-muted">{u.lastLogin || 'Never'}</span>
      ),
    },
  ];

  // Logs table columns
  const logColumns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (l: UserActivityLog) => (
        <span className="text-[11px] font-mono text-text-muted">{l.createdAt}</span>
      ),
    },
    {
      key: 'userName',
      label: 'Initiator',
      render: (l: UserActivityLog) => (
        <div>
          <p className="font-semibold text-xs text-text-primary">{l.userName}</p>
          <p className="text-[10px] text-text-muted font-mono">{l.ipAddress}</p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action Event',
      render: (l: UserActivityLog) => (
        <span className="px-2 py-0.5 rounded-md bg-secondary/50 font-mono text-[10px] font-bold text-text-primary">
          {l.action}
        </span>
      ),
    },
    {
      key: 'module',
      label: 'Module',
      render: (l: UserActivityLog) => (
        <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">{l.module}</span>
      ),
    },
    {
      key: 'details',
      label: 'Event Details',
      render: (l: UserActivityLog) => (
        <span className="text-xs text-text-secondary">{l.details}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <span>👤</span> User Accounts & Role Permissions (RBAC)
          </h1>
          <p className="text-[14px] font-normal text-text-muted">
            Manage admin credentials, staff roles, granular RBAC access controls, security policies, and user activity logs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormName('');
            setFormEmail('');
            setFormPassword('');
            setFormRole('staff');
            setFormPhone('');
            setFormCity('');
            setFormIsActive(true);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-accent text-white text-[14px] font-medium shadow-sm transition cursor-pointer"
        >
          <UserPlus size={15} />
          <span>Create New User</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Accounts</p>
          <p className="text-[26px] font-bold text-text-primary mt-1 tabular-nums">{userAccounts.length}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Across all roles</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Super Admins</p>
          <p className="text-[26px] font-bold text-purple-700 mt-1 tabular-nums">
            {userAccounts.filter((u) => u.role === 'super_admin').length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Full unrestricted access</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Store Staff</p>
          <p className="text-[26px] font-bold text-blue-700 mt-1 tabular-nums">
            {userAccounts.filter((u) => u.role === 'staff').length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Fulfillment & Restock operators</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Status</p>
          <p className="text-[26px] font-bold text-emerald-600 mt-1 tabular-nums">
            {userAccounts.filter((u) => u.isActive).length} / {userAccounts.length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Verified credentials</p>
        </div>
      </div>

      {/* Main Content Area with Navigation Tabs */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center border-b border-border-light gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Users size={14} />
            <span>User Directory ({filteredUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'rbac' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Shield size={14} />
            <span>RBAC Permission Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
              activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <History size={14} />
            <span>Audit & Activity Logs ({activityLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: User Directory */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <DataTable<UserAccount>
              data={filteredUsers}
              columns={userColumns}
              searchKeys={['fullName', 'email', 'phone', 'city']}
              searchPlaceholder="Search user name, email, phone..."
              itemsPerPage={8}
              filterSlot={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                    <Filter size={14} className="text-text-muted" />
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Administrator</option>
                      <option value="staff">Store Staff</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Suspended</option>
                    </select>
                  </div>
                </div>
              }
              actions={(user) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(user)}
                    title="Edit Profile & Role"
                    className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-text-primary transition"
                  >
                    <Edit size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResettingUser(user);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    title="Reset Password"
                    className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 hover:text-amber-700 transition"
                  >
                    <Key size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleUserStatus(user.id)}
                    title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
                    className={`p-1.5 rounded-lg transition ${
                      user.isActive
                        ? 'hover:bg-red-50 text-emerald-600 hover:text-danger'
                        : 'hover:bg-emerald-50 text-text-muted hover:text-emerald-600'
                    }`}
                  >
                    {user.isActive ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                  </button>
                </div>
              )}
            />
          </div>
        )}

        {/* Tab 2: RBAC Matrix */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {initialRoles.map((role) => (
                <div key={role.id} className="p-4 rounded-xl border border-border-light bg-secondary/15 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-text-primary">
                    <ShieldCheck size={14} className="text-primary" />
                    <span>{role.displayName}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border-light">
              <table className="w-full text-xs">
                <thead className="bg-secondary/40 border-b border-border-light">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-bold text-text-secondary">Permission Code / Name</th>
                    <th className="px-4 py-2.5 text-left font-bold text-text-secondary">Module</th>
                    <th className="px-4 py-2.5 text-center font-bold text-purple-800">Super Admin</th>
                    <th className="px-4 py-2.5 text-center font-bold text-primary">Admin</th>
                    <th className="px-4 py-2.5 text-center font-bold text-blue-700">Staff</th>
                    <th className="px-4 py-2.5 text-center font-bold text-text-muted">Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {initialPermissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-text-primary">{perm.name}</p>
                        <span className="font-mono text-[10px] text-text-muted">{perm.code}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="uppercase tracking-wider font-semibold text-[10px] text-text-muted">
                          {perm.module}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-emerald-600 font-bold">✓</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {['payments', 'financial', 'users', 'products', 'orders'].includes(perm.module) ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {['products', 'orders'].includes(perm.module) || perm.code === 'payments:read' ? (
                          <span className="text-blue-600 font-bold">✓</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-gray-300">—</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Activity Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <DataTable<UserActivityLog>
              data={activityLogs}
              columns={logColumns}
              searchKeys={['userName', 'userEmail', 'action', 'details']}
              searchPlaceholder="Search audit trails by user, event, details..."
              itemsPerPage={8}
            />
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New User Account"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Save & Provision Account
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Tanjiro Kamado"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="user@animestore.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Initial Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Role Assignment</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="super_admin">⚡ Super Admin</option>
                  <option value="admin">🛡️ Administrator</option>
                  <option value="staff">👤 Store Staff</option>
                  <option value="customer">🛒 Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Account State</label>
                <select
                  value={formIsActive ? 'true' : 'false'}
                  onChange={(e) => setFormIsActive(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="true">Active & Authorized</option>
                  <option value="false">Suspended / Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Phone Number (optional)</label>
                <input
                  type="text"
                  placeholder="+855 12 345 678"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">City / Branch Location</label>
                <input
                  type="text"
                  placeholder="Phnom Penh"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={Boolean(editingUser)}
          onClose={() => setEditingUser(null)}
          title={`Edit Profile: ${editingUser.fullName}`}
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Full Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Role Assignment</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="super_admin">⚡ Super Admin</option>
                  <option value="admin">🛡️ Administrator</option>
                  <option value="staff">👤 Store Staff</option>
                  <option value="customer">🛒 Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Account State</label>
                <select
                  value={formIsActive ? 'true' : 'false'}
                  onChange={(e) => setFormIsActive(e.target.value === 'true')}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="true">Active & Authorized</option>
                  <option value="false">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">City</label>
                <input
                  type="text"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Password Reset Modal */}
      {resettingUser && (
        <Modal
          isOpen={Boolean(resettingUser)}
          onClose={() => setResettingUser(null)}
          title={`Reset Password for ${resettingUser.fullName}`}
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setResettingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>
                Update Password
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Enter a new secure password for <strong className="text-text-primary">{resettingUser.email}</strong>.
            </p>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">New Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Confirm New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
