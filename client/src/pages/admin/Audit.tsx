import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import { auditApi } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDateTime } from '../../utils/format';

// Colour-code the most common audit actions.
const tone = (action: string): 'emerald' | 'amber' | 'red' | 'sky' | 'neutral' => {
  if (action.includes('APPLIED') || action.includes('ENABLED')) return 'emerald';
  if (action.includes('REMOVED') || action.includes('DISABLED')) return 'red';
  if (action.includes('PRICE')) return 'amber';
  return 'sky';
};

export default function Audit() {
  const { data: entries, isLoading } = useQuery({ queryKey: ['audit'], queryFn: auditApi.list });

  if (isLoading) return <PageLoader label="Loading audit trail" />;

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Every price change and discount action, recorded for full transparency." />

      {!entries || entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted">
          <ScrollText size={40} className="opacity-50" />
          <p>No audit entries yet — apply a discount or change a price to see activity.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Change</th>
                  <th className="px-5 py-3">By</th>
                  <th className="px-5 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line/60 last:border-0 hover:bg-surface-2/50">
                    <td className="px-5 py-3"><Badge tone={tone(e.action)}>{e.action.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-5 py-3 text-muted">{e.entity} <span className="font-mono text-xs">#{e.entityId.slice(0, 6)}</span></td>
                    <td className="px-5 py-3 text-muted">
                      {e.oldValue && e.newValue ? <span className="font-mono text-xs">{e.oldValue} → {e.newValue}</span> : e.newValue ? <span className="font-mono text-xs">{e.newValue}</span> : '—'}
                    </td>
                    <td className="px-5 py-3">{e.user ? `${e.user.firstName} ${e.user.lastName}` : '—'}</td>
                    <td className="px-5 py-3 text-right text-muted">{formatDateTime(e.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
