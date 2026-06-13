'use client';

import { useEffect, useState } from 'react';
import { Role } from '@erp/types';
import type { Role as RoleType, UserRow, CredentialResult } from '@/lib/types';
import { Card, SectionHeader, EmptyState } from '@/components/admin/ui';
import { Modal } from '@/components/ui/modal';
import { DropdownOptionSelector } from '@/components/ui/select';
import { useToast } from '@/lib/store/ui-store';
import { useUsersStore } from '@/lib/store/users-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { ApiError } from '@/lib/api';

const ROLES: RoleType[] = [Role.ADMIN, Role.SUPERVISOR, Role.PARTNER];

const ROLE_STYLES: Record<RoleType, string> = {
  ADMIN: 'bg-pine/10 text-pine',
  SUPERVISOR: 'bg-kraft/15 text-kraft-dark',
  PARTNER: 'bg-blue-50 text-blue-700',
};

export default function RolesPage() {
  const users = useUsersStore((s) => s.users);
  const loading = useUsersStore((s) => s.loading);
  const fetchUsers = useUsersStore((s) => s.fetchUsers);
  const updateUser = useUsersStore((s) => s.updateUser);
  const removeUser = useUsersStore((s) => s.removeUser);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const toast = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [cred, setCred] = useState<CredentialResult | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function onRoleChange(u: UserRow, role: RoleType) {
    try {
      await updateUser(u.id, { role });
      toast('Role updated', 'success');
    } catch {
      toast('Failed to update role', 'error');
    }
  }

  async function onDelete(u: UserRow) {
    try {
      await removeUser(u.id);
      toast('User removed', 'success');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : 'Failed to remove user', 'error');
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Access Control"
        title="Manage Roles"
        actionSlot={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="shrink-0 rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-pine-deep"
          >
            + Add user
          </button>
        }
      />

      {loading && users.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading users…</p>
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" hint="Add a user, share the generated password, and they can log in." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Email</th>
                <th className="px-3 py-3 font-semibold">Role</th>
                <th className="px-3 py-3 font-semibold">Added</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kraft/15 font-display text-sm text-kraft-dark">
                          {u.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-ink">{u.name}</span>
                        {isSelf ? (
                          <span className="rounded-full bg-pine/10 px-2 py-0.5 text-[11px] font-semibold text-pine">You</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-ink-soft">{u.email}</td>
                    <td className="px-3 py-3.5">
                      {isSelf ? (
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[u.role]}`}>
                          {u.role}
                        </span>
                      ) : (
                        <DropdownOptionSelector
                          value={u.role}
                          onChange={(v) => onRoleChange(u, v as RoleType)}
                          options={ROLES.map((r) => ({ value: r, label: r }))}
                          className="w-40"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-ink-soft">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5 text-right text-xs">
                      <button type="button" onClick={() => setResetUser(u)} className="font-medium text-pine-moss hover:text-pine">
                        Reset password
                      </button>
                      {!isSelf ? (
                        <button type="button" onClick={() => onDelete(u)} className="ml-3 font-medium text-red-700 hover:text-red-800">
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={(res) => { setAddOpen(false); setCred(res); }} />
      <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} onDone={(res) => { setResetUser(null); setCred(res); }} />
      <CredentialModal cred={cred} onClose={() => setCred(null)} />
    </>
  );
}

function AddUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (res: CredentialResult) => void;
}) {
  const createUser = useUsersStore((s) => s.createUser);
  const toast = useToast();
  const [role, setRole] = useState<RoleType>('PARTNER');
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const role = String(form.get('role') ?? 'PARTNER') as RoleType;
    if (!name) return setError('Name is required.');
    if (!email) return setError('Email is required.');

    setPending(true);
    try {
      const res = await createUser({ name, email, role });
      toast('User created', 'success');
      onCreated(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setError('That email is already registered.');
      else setError('Failed to create user.');
      setPending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title="Add user" subtitle="A password is generated automatically — share it with the user.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-semibold text-ink">Name</label>
          <input id="name" name="name" className="field" placeholder="Ramesh Kumar" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-ink">Email</label>
          <input id="email" name="email" type="email" className="field" placeholder="ramesh@factory.com" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="role" className="block text-sm font-semibold text-ink">Role</label>
          <DropdownOptionSelector
            id="role"
            name="role"
            value={role}
            onChange={(v) => setRole(v as RoleType)}
            options={ROLES.map((r) => ({ value: r, label: r }))}
          />
        </div>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60">
            {pending ? 'Creating…' : 'Create user'}
          </button>
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

/** Client-side readable random password, e.g. "Kf7p-Qm2x-9Tab". */
function randomPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
    if (i === 3 || i === 7) out += '-';
  }
  return out;
}

function ResetPasswordModal({
  user,
  onClose,
  onDone,
}: {
  user: UserRow | null;
  onClose: () => void;
  onDone: (res: CredentialResult) => void;
}) {
  const resetPassword = useUsersStore((s) => s.resetPassword);
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Reset the field whenever a new user's modal opens.
  useEffect(() => {
    setPassword('');
    setError(undefined);
  }, [user?.id]);

  if (!user) return null;

  async function save() {
    if (password.trim().length < 6) return setError('Password must be at least 6 characters.');
    setSaving(true);
    try {
      const res = await resetPassword(user!.id, password.trim());
      toast('Password updated', 'success');
      onDone(res);
    } catch {
      setError('Failed to update password.');
      setSaving(false);
    }
  }

  return (
    <Modal open={user !== null} onClose={onClose} size="md" title="Reset password" subtitle={`Set a new password for ${user.name}.`}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="newpw" className="block text-sm font-semibold text-ink">New password</label>
          <input
            id="newpw"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(undefined); }}
            placeholder="Type a password"
            className="field font-mono"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => { setPassword(randomPassword()); setError(undefined); }}
            className="text-sm font-semibold text-pine-moss hover:text-pine"
          >
            Generate random password
          </button>
        </div>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <div className="flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper hover:bg-pine-deep disabled:opacity-60">
            {saving ? 'Saving…' : 'Set password'}
          </button>
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

function CredentialModal({ cred, onClose }: { cred: CredentialResult | null; onClose: () => void }) {
  const toast = useToast();
  if (!cred) return null;

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(
      () => toast(`${label} copied`, 'success'),
      () => toast('Copy failed', 'error'),
    );
  }

  return (
    <Modal open={cred !== null} onClose={onClose} size="md" title="Login credentials" subtitle="Shown once — copy and share now. The password is not stored in plain text.">
      <div className="space-y-3">
        <CredRow label="Email" value={cred.user.email} onCopy={() => copy(cred.user.email, 'Email')} />
        <CredRow label="Password" value={cred.password} mono onCopy={() => copy(cred.password, 'Password')} />
        <button
          type="button"
          onClick={() => copy(`Email: ${cred.user.email}\nPassword: ${cred.password}`, 'Credentials')}
          className="w-full rounded-lg bg-pine px-4 py-2.5 text-sm font-semibold text-paper hover:bg-pine-deep"
        >
          Copy both
        </button>
        <p className="text-xs text-ink-faint">
          {cred.user.name} ({cred.user.role}) can now log in at the portal with these credentials.
        </p>
      </div>
    </Modal>
  );
}

function CredRow({ label, value, mono, onCopy }: { label: string; value: string; mono?: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-ink-faint/15 bg-paper-deep/30 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">{label}</p>
        <p className={`mt-0.5 truncate text-ink ${mono ? 'font-mono text-base' : 'text-sm'}`}>{value}</p>
      </div>
      <button type="button" onClick={onCopy} className="shrink-0 rounded-md border border-ink-faint/30 px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-card">
        Copy
      </button>
    </div>
  );
}
