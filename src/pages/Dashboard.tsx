import { useNavigate } from 'react-router-dom';
import { Users, FileText, ClipboardList, AlertTriangle, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge, VerificationBadge, ExtractionBadge } from '@/components/StatusBadges';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import { RecordIntegrity } from '@/components/RecordIntegrity';
import { useMemo } from 'react';

export function Dashboard() {
  const { patient, documents, findings, conflicts } = useData();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const patients = 1;
    const reportsProcessed = documents.length;
    const findingsExtracted = findings.length;
    const needsReview = findings.filter((f) => f.verificationStatus === 'NEEDS_REVIEW').length + conflicts.filter((c) => c.status === 'UNRESOLVED').length;
    return { patients, reportsProcessed, findingsExtracted, needsReview };
  }, [documents, findings, conflicts]);

  const recentFindings = useMemo(() => {
    return [...findings]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [findings]);

  const attentionItems = useMemo(() => {
    const items = [];

    const allergyConflict = conflicts.find((c) => c.fieldType === 'Allergy Information');
    if (allergyConflict) {
      items.push({
        id: 'allergy',
        title: 'Allergy Conflict',
        description: `"${allergyConflict.sourceAValue}" vs "${allergyConflict.sourceBValue}"`,
        source: `${allergyConflict.sourceARef} vs ${allergyConflict.sourceBRef}`,
        priority: 'HIGH' as const,
        action: () => navigate('/conflicts'),
      });
    }

    const lowConfidence = findings.find((f) => f.confidence < 95 && f.verificationStatus === 'NEEDS_REVIEW');
    if (lowConfidence) {
      items.push({
        id: 'low-conf',
        title: 'Low-confidence extraction',
        description: `${lowConfidence.normalizedName} requires human verification.`,
        source: `Confidence: ${lowConfidence.confidence}%`,
        priority: 'MEDIUM' as const,
        action: () => navigate('/verification'),
      });
    }

    const abnormal = findings.find((f) => f.status === 'HIGH' && f.date === '2026-06-18');
    if (abnormal) {
      items.push({
        id: 'abnormal',
        title: 'New abnormal finding',
        description: `${abnormal.normalizedName} ${abnormal.value}${abnormal.unit} — ${abnormal.status} according to supplied report range.`,
        source: 'June 18 Report',
        priority: 'HIGH' as const,
        action: () => navigate('/patient'),
      });
    }

    return items;
  }, [conflicts, findings, navigate]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Title */}
      <div>
        <h1 className="text-xl font-semibold text-ink">Clinical Record Overview</h1>
        <p className="text-sm text-ink-muted mt-0.5">Review patient information, findings, conflicts, and verification status.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={Users} label="Patients" value={metrics.patients} />
        <MetricCard icon={FileText} label="Reports Processed" value={metrics.reportsProcessed} />
        <MetricCard icon={ClipboardList} label="Findings Extracted" value={metrics.findingsExtracted} />
        <MetricCard icon={AlertTriangle} label="Needs Review" value={metrics.needsReview} highlight />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Findings - left 65% */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <h3 className="section-title">Recent Findings</h3>
            <button onClick={() => navigate('/patient')} className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-gray-50/50">
                  <th className="text-left table-header px-4 py-2.5">Test</th>
                  <th className="text-left table-header px-4 py-2.5">Patient</th>
                  <th className="text-left table-header px-4 py-2.5">Value</th>
                  <th className="text-left table-header px-4 py-2.5">Ref Range</th>
                  <th className="text-left table-header px-4 py-2.5">Status</th>
                  <th className="text-left table-header px-4 py-2.5">Source</th>
                  <th className="text-left table-header px-4 py-2.5">Verification</th>
                </tr>
              </thead>
              <tbody>
                {recentFindings.map((f) => (
                  <tr key={f.id} className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-ink">{f.normalizedName}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{patient.name}</td>
                    <td className="px-4 py-2.5 text-ink">{f.value} {f.unit}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{f.referenceRangeRaw}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-2.5 text-ink-muted text-xs">{f.date}</td>
                    <td className="px-4 py-2.5"><VerificationBadge status={f.verificationStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attention Required - right 35% */}
        <div className="card">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="section-title">Attention Required</h3>
          </div>
          <div className="divide-y divide-line">
            {attentionItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.priority === 'HIGH' ? 'bg-status-high' : 'bg-status-review'}`} />
                    <h4 className="text-sm font-semibold text-ink">{item.title}</h4>
                  </div>
                  <span className={`text-xxs font-semibold px-1.5 py-0.5 rounded ${item.priority === 'HIGH' ? 'bg-status-highBg text-status-high' : 'bg-status-reviewBg text-status-review'}`}>
                    {item.priority === 'HIGH' ? 'HIGH PRIORITY' : 'MEDIUM'}
                  </span>
                </div>
                <p className="text-sm text-ink-muted mb-1">{item.description}</p>
                <p className="text-xs text-ink-faint mb-2.5">{item.source}</p>
                <button onClick={item.action} className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Report Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <h3 className="section-title">Report Activity</h3>
            <button onClick={() => navigate('/reports')} className="text-xs text-brand font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-gray-50/50">
                  <th className="text-left table-header px-4 py-2.5">Filename</th>
                  <th className="text-left table-header px-4 py-2.5">Patient</th>
                  <th className="text-left table-header px-4 py-2.5">Date</th>
                  <th className="text-left table-header px-4 py-2.5">Extraction</th>
                  <th className="text-left table-header px-4 py-2.5">Findings</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => navigate(`/reports/${doc.id}`)}
                    className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 font-medium text-ink flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-ink-faint" />
                      {doc.filename}
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{patient.name}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{doc.uploadDate}</td>
                    <td className="px-4 py-2.5"><ExtractionBadge status={doc.extractionStatus} /></td>
                    <td className="px-4 py-2.5 text-ink-muted">{doc.findingsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Integrity */}
        <RecordIntegrity />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight && value > 0 ? 'border-status-reviewBorder' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-control ${highlight && value > 0 ? 'bg-status-reviewBg' : 'bg-brand-50'}`}>
          <Icon className={`w-4 h-4 ${highlight && value > 0 ? 'text-status-review' : 'text-brand'}`} aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold text-ink leading-none">{value}</p>
          <p className="text-xs text-ink-muted mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}
