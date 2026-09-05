import { ShieldCheck, AlertTriangle, FileSearch, CheckCircle2 } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { useMemo } from 'react';

export function RecordIntegrity({ compact = false }: { compact?: boolean }) {
  const { findings, documents, conflicts } = useData();

  const metrics = useMemo(() => {
    const verified = findings.filter((f) => f.verificationStatus === 'VERIFIED').length;
    const completeness = findings.length > 0 ? Math.round((findings.filter((f) => f.value !== null).length / findings.length) * 100) : 100;
    const sourceCoverage = documents.length > 0 ? Math.round((documents.filter((d) => d.extractionStatus !== 'PROCESSING').length / documents.length) * 100) : 100;
    const verification = findings.length > 0 ? Math.round((verified / findings.length) * 100) : 100;
    const consistency = conflicts.length > 0
      ? Math.round(((conflicts.length - conflicts.filter((c) => c.status === 'UNRESOLVED').length) / conflicts.length) * 100)
      : 100;

    const openConflicts = conflicts.filter((c) => c.status === 'UNRESOLVED').length;
    const uncertainFindings = findings.filter((f) => f.verificationStatus === 'NEEDS_REVIEW').length;
    const evidenceLinked = findings.filter((f) => f.sourceSnippet.length > 0).length;
    const evidencePct = findings.length > 0 ? Math.round((evidenceLinked / findings.length) * 100) : 100;

    return { completeness, sourceCoverage, verification, consistency, openConflicts, uncertainFindings, evidencePct };
  }, [findings, documents, conflicts]);

  const bars = [
    { label: 'Completeness', value: metrics.completeness, color: 'bg-brand' },
    { label: 'Source Coverage', value: metrics.sourceCoverage, color: 'bg-blue-500' },
    { label: 'Verification', value: metrics.verification, color: 'bg-status-verified' },
    { label: 'Consistency', value: metrics.consistency, color: 'bg-status-normal' },
  ];

  const stats = [
    { label: 'Open Conflicts', value: metrics.openConflicts, icon: AlertTriangle, tone: metrics.openConflicts > 0 ? 'danger' : 'normal' },
    { label: 'Uncertain Findings', value: metrics.uncertainFindings, icon: FileSearch, tone: metrics.uncertainFindings > 0 ? 'warning' : 'normal' },
    { label: 'Evidence Linked', value: metrics.evidencePct, icon: CheckCircle2, tone: 'normal', suffix: '%' },
  ];

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand" />
        <h3 className="section-title">Record Integrity</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Progress bars */}
        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-muted">{bar.label}</span>
                <span className="text-sm font-semibold text-ink">{bar.value}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                  style={{ width: `${bar.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stat row */}
        <div className={`grid ${compact ? 'grid-cols-3' : 'grid-cols-3'} gap-2 pt-2 border-t border-line`}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            const toneColor =
              stat.tone === 'danger' ? 'text-status-high' :
              stat.tone === 'warning' ? 'text-status-review' :
              'text-status-verified';
            return (
              <div key={stat.label} className="text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${toneColor}`} />
                <p className={`text-base font-bold ${toneColor} leading-none`}>
                  {stat.value}{stat.suffix ?? ''}
                </p>
                <p className="text-xs text-ink-muted mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="pt-2 border-t border-line">
          <p className="text-xs text-ink-faint">
            These indicators describe record quality and traceability, not patient health.
          </p>
        </div>
      </div>
    </div>
  );
}
