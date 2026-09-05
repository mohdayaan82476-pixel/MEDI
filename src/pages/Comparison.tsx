import { useMemo, useState } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge } from '@/components/StatusBadges';

export function Comparison() {
  const { findings, documents } = useData();

  const labReports = useMemo(
    () => documents.filter((d) => d.documentType === 'LAB_REPORT').sort((a, b) => a.uploadDate.localeCompare(b.uploadDate)),
    [documents],
  );

  const [reportAId, setReportAId] = useState(labReports[0]?.id ?? '');
  const [reportBId, setReportBId] = useState(labReports[labReports.length - 1]?.id ?? '');

  const comparisonData = useMemo(() => {
    const findingsA = findings.filter((f) => f.documentId === reportAId);
    const findingsB = findings.filter((f) => f.documentId === reportBId);

    const allNames = new Set<string>([
      ...findingsA.map((f) => f.normalizedName),
      ...findingsB.map((f) => f.normalizedName),
    ]);

    const rows: {
      name: string;
      previous: number | null;
      current: number | null;
      unit: string;
      change: number | null;
      status: typeof findings[number]['status'];
    }[] = [];

    allNames.forEach((name) => {
      const fA = findingsA.find((f) => f.normalizedName === name);
      const fB = findingsB.find((f) => f.normalizedName === name);
      const prev = fA?.value ?? null;
      const curr = fB?.value ?? null;
      const change = prev !== null && curr !== null ? curr - prev : null;
      const status = fB?.status ?? fA?.status ?? 'UNKNOWN';

      rows.push({
        name,
        previous: prev,
        current: curr,
        unit: fB?.unit ?? fA?.unit ?? '',
        change,
        status,
      });
    });

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }, [findings, reportAId, reportBId]);

  const reportA = documents.find((d) => d.id === reportAId);
  const reportB = documents.find((d) => d.id === reportBId);

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Report Comparison</h1>
        <p className="text-sm text-ink-muted mt-0.5">Side-by-side comparison of laboratory findings across two report dates. Changes are shown as differences, not diagnoses.</p>
      </div>

      {/* Report selectors */}
      <div className="card px-5 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="label-text" htmlFor="report-a">Previous Report</label>
            <select id="report-a" value={reportAId} onChange={(e) => setReportAId(e.target.value)} className="input-field">
              {labReports.map((r) => (
                <option key={r.id} value={r.id}>{r.uploadDate}</option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <ArrowRight className="w-5 h-5 text-ink-faint" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label-text" htmlFor="report-b">Current Report</label>
            <select id="report-b" value={reportBId} onChange={(e) => setReportBId(e.target.value)} className="input-field">
              {labReports.map((r) => (
                <option key={r.id} value={r.id}>{r.uploadDate}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="card">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h3 className="section-title">Finding Comparison</h3>
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            <span>{reportA?.uploadDate}</span>
            <span>vs</span>
            <span>{reportB?.uploadDate}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-gray-50/50">
                <th className="text-left table-header px-4 py-2.5">Finding</th>
                <th className="text-right table-header px-4 py-2.5">Previous</th>
                <th className="text-right table-header px-4 py-2.5">Current</th>
                <th className="text-right table-header px-4 py-2.5">Change</th>
                <th className="text-left table-header px-4 py-2.5">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row) => (
                <tr key={row.name} className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-2.5 text-right text-ink-muted">
                    {row.previous !== null ? `${row.previous} ${row.unit}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-ink font-medium">
                    {row.current !== null ? `${row.current} ${row.unit}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {row.change === null ? (
                      <span className="text-xs text-ink-faint">New</span>
                    ) : row.change === 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-ink-muted">
                        <Minus className="w-3 h-3" />
                        0
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${row.change < 0 ? 'text-status-low' : 'text-status-high'}`}>
                        {row.change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {row.change > 0 ? '+' : ''}{row.change}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-line">
          <p className="text-xs text-ink-faint">
            Changes reflect differences between report dates. These are not diagnoses or treatment recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
