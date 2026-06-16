'use client';

import { useApi } from '@/lib/use-api';
import type { ClientRow } from '@/lib/types';
import { Card, SectionHeader, EmptyState } from '@/components/admin/ui';
import { NewClientButton, EditClientButton, DeleteClientButton } from '@/components/admin/client-buttons';

export default function ClientsPage() {
  const { data: clients, loading, refetch } = useApi<ClientRow[]>('GET', '/clients');

  return (
    <>
      <SectionHeader
        eyebrow="Client Management"
        title="Clients"
        actionSlot={<NewClientButton onSaved={refetch} />}
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-faint">Loading clients…</p>
      ) : !clients || clients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add a client before creating orders." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-paper-deep/40 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">GST number</th>
                <th className="px-3 py-3 font-semibold">Phone</th>
                <th className="px-3 py-3 font-semibold">Address</th>
                <th className="px-3 py-3 font-semibold">Added</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
                  <td className="px-6 py-3.5 font-medium text-ink">{c.name}</td>
                  <td className="px-3 py-3.5 text-ink-soft">{c.gstNumber ?? '—'}</td>
                  <td className="px-3 py-3.5 text-ink-soft">{c.phone ?? '—'}</td>
                  <td className="px-3 py-3.5 text-ink-soft">{c.address ?? '—'}</td>
                  <td className="px-3 py-3.5 text-ink-soft">
                    {new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <EditClientButton client={c} onSaved={refetch} />
                      <DeleteClientButton client={c} onSaved={refetch} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </>
  );
}
