import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, FileText, Check, X, Eye, ArrowRight } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { ConflictStatusBadge } from '@/components/StatusBadges';
import type { ConflictStatus } from '@/types';

type FilterType = 'ALL' | 'UNRESOLVED' | 'ACKNOWLEDGED' | 'DISMISSED' | 'HIGH_PRIORITY';

export function ConflictCenter() {
  const { conflicts, patient, documents, acknowledgeConflict, dismissConflict, resolveConflict } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');

  const prescriptionDoc = documents.find((d) => d.documentType === 'PRESCRIPTION');
  const evidenceLink = `/evidence?docId=${prescriptionDoc?.id ?? ''}`;

  const filteredConflicts = useMemo(() => {
    switch (filter) {
      case 'UNRESOLVED':
        return conflicts.filter((c) => c.status === 'UNRESOLVED');
      case 'ACKNOWLEDGED':
        return conflicts.filter((c) => c.status === 'ACKNOWLEDGED');
      case 'DISMISSED':
        return conflicts.filter((c) => c.status === 'DISMISSED');
      case 'HIGH_PRIORITY':
        return conflicts.filter((c) => c.priority === 'HIGH');
      default:
        return conflicts;
    }
  }, [conflicts, filter]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'UNRESOLVED', label: 'Unresolved' },
    { key: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { key: 'DISMISSED', label: 'Dismissed' },
    { key: 'HIGH_PRIORITY', label: 'High Priority' },
  ];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Conflicts & Inconsistencies</h1>
        <p className="text-sm text-ink-muted mt-0.5">Review differences across patient-provided and extracted information. MedLens does not decide which source is correct.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-control transition-colors ${
              filter === f.key
                ? 'bg-brand text-white'
                : 'bg-white border border-line text-ink-muted hover:bg-gray-50'
            }`}
          >
            {f.label}
            {f.key === 'UNRESOLVED' && (
              <span className="ml-1.5 text-xxs">
                ({conflicts.filter((c) => c.status === 'UNRESOLVED').length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conflict cards */}
      {filteredConflicts.length === 0 ? (
        <div className="card p-8 text-center">
          <Check className="w-8 h-8 text-status-normal mx-auto mb-2" />
          <p className="text-sm font-semibold text-ink">No conflicts in this category</p>
          <p className="text-sm text-ink-muted mt-1">All conflicts have been reviewed or there are none to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((conflict) => (
            <div key={conflict.id} className="card overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3 border-b border-line bg-status-conflictBg/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-status-conflict" />
                  <h3 className="text-sm font-semibold text-ink">{conflict.fieldType} Conflict</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xxs font-semibold px-2 py-0.5 rounded ${conflict.priority === 'HIGH' ? 'bg-status-highBg text-status-high' : 'bg-status-reviewBg text-status-review'}`}>
                    {conflict.priority} PRIORITY
                  </span>
                  <ConflictStatusBadge status={conflict.status} />
                </div>
              </div>

              {/* Side-by-side evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-line">
                {/* Source A */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xxs font-bold flex items-center justify-center">A</span>
                    <span className="text-xs font-medium text-ink-muted">{conflict.sourceARef}</span>
                  </div>
                  <div className="bg-gray-50 border border-line rounded-control p-3">
                    <p className="text-sm text-ink">{conflict.sourceAValue}</p>
                  </div>
                  <button
                    onClick={() => navigate(evidenceLink)}
                    className="text-xs text-brand font-medium hover:underline flex items-center gap-1 mt-3"
                  >
                    <Eye className="w-3 h-3" />
                    View source
                  </button>
                </div>

                {/* Source B */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xxs font-bold flex items-center justify-center">B</span>
                    <span className="text-xs font-medium text-ink-muted">{conflict.sourceBRef}</span>
                  </div>
                  <div className="bg-gray-50 border border-line rounded-control p-3">
                    <p className="text-sm text-ink">{conflict.sourceBValue}</p>
                  </div>
                  <button
                    onClick={() => navigate(evidenceLink)}
                    className="text-xs text-brand font-medium hover:underline flex items-center gap-1 mt-3"
                  >
                    <Eye className="w-3 h-3" />
                    View source
                  </button>
                </div>
              </div>

              {/* Detection + description */}
              <div className="px-5 py-3 border-t border-line bg-gray-50/50">
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-ink-muted">
                    <span className="font-medium text-ink">Detection:</span> {conflict.detectionMethod}
                  </span>
                  <span className="text-ink-muted">
                    <span className="font-medium text-ink">Patient:</span> {patient.name}
                  </span>
                </div>
                <p className="text-sm text-ink-muted mt-1.5">{conflict.description}</p>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-line flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(evidenceLink)}
                  className="btn-secondary text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review Evidence
                </button>
                <button
                  onClick={() => resolveConflict(conflict.id, 'sourceA')}
                  className="btn-secondary text-xs"
                  disabled={conflict.status !== 'UNRESOLVED'}
                >
                  <Check className="w-3.5 h-3.5" />
                  Verify Source A
                </button>
                <button
                  onClick={() => resolveConflict(conflict.id, 'sourceB')}
                  className="btn-secondary text-xs"
                  disabled={conflict.status !== 'UNRESOLVED'}
                >
                  <Check className="w-3.5 h-3.5" />
                  Verify Source B
                </button>
                <button
                  onClick={() => acknowledgeConflict(conflict.id)}
                  className="btn-primary text-xs ml-auto"
                  disabled={conflict.status !== 'UNRESOLVED'}
                >
                  Acknowledge Conflict
                </button>
                {conflict.status === 'UNRESOLVED' && (
                  <button
                    onClick={() => dismissConflict(conflict.id)}
                    className="btn-ghost text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">About conflict detection:</span> MedLens uses rule-based detection to identify discrepancies between patient-provided information and extracted data. Changing lab values across different report dates are treated as trends, not conflicts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
