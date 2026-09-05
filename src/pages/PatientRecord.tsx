import { useNavigate } from 'react-router-dom';
import { User, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, FileText, Pill } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge, VerificationBadge, ConflictStatusBadge } from '@/components/StatusBadges';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import { RecordIntegrity } from '@/components/RecordIntegrity';
import { useMemo } from 'react';

export function PatientRecord() {
  const { patient, findings, conflicts, documents } = useData();
  const navigate = useNavigate();

  const patientFindings = useMemo(() => {
    return findings
      .filter((f) => f.patientId === patient.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [findings, patient.id]);

  const allergyConflict = conflicts.find((c) => c.fieldType === 'Allergy Information');
  const prescriptionDoc = documents.find((d) => d.documentType === 'PRESCRIPTION');

  const recentChanges = useMemo(() => {
    const byName: Record<string, typeof findings> = {};
    findings.forEach((f) => {
      const key = f.normalizedName;
      if (!byName[key]) byName[key] = [];
      byName[key].push(f);
    });

    const changes: { name: string; oldValue: number; newValue: number; unit: string; change: number }[] = [];
    Object.values(byName).forEach((group) => {
      const sorted = [...group].sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length >= 2) {
        const prev = sorted[sorted.length - 2];
        const curr = sorted[sorted.length - 1];
        if (prev.value !== null && curr.value !== null) {
          changes.push({
            name: curr.normalizedName,
            oldValue: prev.value,
            newValue: curr.value,
            unit: curr.unit,
            change: curr.value - prev.value,
          });
        }
      }
    });

    return changes;
  }, [findings]);

  return (
    <div className="max-w-[1400px] space-y-5">
      {/* Patient header */}
      <div className="card px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
              <User className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink">{patient.name}</h1>
              <p className="text-sm text-ink-muted">{patient.age} years · {patient.sex}</p>
            </div>
          </div>
          <ProvenanceTag source={patient.source} />
        </div>
      </div>

      {/* Patient info summary */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line">
          <h3 className="section-title">Patient Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-line">
          <InfoBlock label="Symptoms / Concerns" value={patient.symptoms} />
          <InfoBlock label="Conditions" value={patient.conditions} />
          <InfoBlock label="Allergies" value={patient.allergies} />
          <InfoBlock label="Medications" value={patient.medications} />
        </div>
      </div>

      {/* Main workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Clinical Findings - left 68% */}
        <div className="lg:col-span-2 card">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h3 className="section-title">Clinical Findings</h3>
            <span className="text-xs text-ink-faint">{patientFindings.length} findings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-gray-50/50">
                  <th className="text-left table-header px-4 py-2.5">Finding</th>
                  <th className="text-right table-header px-4 py-2.5">Value</th>
                  <th className="text-left table-header px-4 py-2.5">Unit</th>
                  <th className="text-left table-header px-4 py-2.5">Ref Range</th>
                  <th className="text-left table-header px-4 py-2.5">Status</th>
                  <th className="text-left table-header px-4 py-2.5">Source</th>
                  <th className="text-left table-header px-4 py-2.5">Verification</th>
                </tr>
              </thead>
              <tbody>
                {patientFindings.map((f) => (
                  <tr key={f.id} className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-ink">{f.normalizedName}</td>
                    <td className="px-4 py-2.5 text-right text-ink font-medium">{f.value}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{f.unit}</td>
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

        {/* Right column - Attention + Recent Changes */}
        <div className="space-y-4">
          {/* Allergy Conflict */}
          {allergyConflict && (
            <div className="card border-status-conflictBorder">
              <div className="px-4 py-3 border-b border-line bg-status-conflictBg/50 rounded-t-container">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-conflict" />
                  <h3 className="text-sm font-semibold text-ink">Allergy Conflict</h3>
                  <ConflictStatusBadge status={allergyConflict.status} />
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xxs font-semibold text-ink-muted uppercase shrink-0 mt-0.5">Intake:</span>
                    <p className="text-sm text-ink">{allergyConflict.sourceAValue}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xxs font-semibold text-ink-muted uppercase shrink-0 mt-0.5">Rx:</span>
                    <p className="text-sm text-ink">{allergyConflict.sourceBValue}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-line">
                  <button
                    onClick={() => navigate('/conflicts')}
                    className="btn-secondary text-xs flex-1"
                  >
                    Review Conflict
                  </button>
                  <button
                    onClick={() => navigate(`/evidence?docId=${prescriptionDoc?.id ?? ''}`)}
                    className="btn-secondary text-xs flex-1"
                  >
                    Open Evidence
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Changes */}
          <div className="card">
            <div className="px-4 py-3 border-b border-line">
              <h3 className="section-title">Recent Changes</h3>
            </div>
            <div className="divide-y divide-line">
              {recentChanges.map((change) => (
                <div key={change.name} className="p-4">
                  <p className="text-sm font-medium text-ink mb-1">{change.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-ink-muted">{change.oldValue}</span>
                    <ArrowRight className="w-3 h-3 text-ink-faint" />
                    <span className="text-ink font-medium">{change.newValue} {change.unit}</span>
                    <span className={`ml-auto flex items-center gap-0.5 text-xs font-medium ${change.change < 0 ? 'text-status-low' : 'text-status-high'}`}>
                      {change.change < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {change.change > 0 ? '+' : ''}{change.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-line">
              <p className="text-xs text-ink-faint">Changes reflect differences between report dates. These are not diagnoses.</p>
            </div>
          </div>

          {/* Record Integrity */}
          <RecordIntegrity />
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4">
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wide mb-1.5">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}
