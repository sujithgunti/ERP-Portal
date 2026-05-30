import { apiFetch } from '@/lib/api-client';
import type { ClientRow } from '@/lib/types';
import { Card, SectionHeader, EmptyState } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await apiFetch<ClientRow[]>('/clients');

  return (
    <>
      <SectionHeader
        eyebrow="Client Management"
        title="Clients"
        action={{ label: '+ New client', href: '/admin/clients/new' }}
      />

      {clients.length === 0 ? (
        <EmptyState title="No clients yet" hint="Add a client before creating orders." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-deep/40 text-[11px] uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Contact</th>
                <th className="px-6 py-3 font-semibold">Added</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t border-ink-faint/10 hover:bg-paper-deep/20">
                  <td className="px-6 py-3.5 font-medium text-ink">{c.name}</td>
                  <td className="px-3 py-3.5 text-ink-soft">{c.contact ?? '—'}</td>
                  <td className="px-6 py-3.5 text-ink-soft">
                    {new Date(c.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
