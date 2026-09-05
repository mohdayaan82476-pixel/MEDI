import { useState, useMemo } from 'react';
import { Check, Edit3, X, AlertTriangle, FileText, History } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge, VerificationBadge } from '@/components/StatusBadges';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import { Drawer } from '@/components/Drawer';
import { ConfirmDialog } from '@/components/Dialogs';
import type { Finding, Conflict, EditRecord } from '@/types';

interface QueueItem {
  id: string;
  name: string;
  patient: string;
  type: string;
  confidence: number;
  issue: string;
  status: 'NEEDS_REVIEW';
  ref: Finding | Conflict;
  kind: 'finding' | 'conflict';
}

export function VerificationQueue() {
  const { findings, conflicts, patient, verifyFinding, flagFinding, rejectFinding, editFindingValue, editFindingField, edits } = useData();

  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editField, setEditField] = useState('');
  const [editFieldValue, setEditFieldValue] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  const queueItems = useMemo<QueueItem[]>(() => {
    const items: QueueItem[] = [];

    findings
      .filter((f) => f.verificationStatus === 'NEEDS_REVIEW')
      .forEach((f) => {
        items.push({
          id: f.id,
          name: f.normalizedName,
          patient: patient.name,
          type: 'Lab Finding',
          confidence: f.confidence,
          issue: f.status !== 'NORMAL' ? `${f.status} result` : 'Low confidence extraction',
          status: 'NEEDS_REVIEW',
          ref: f,
          kind: 'finding',
        });
      });

    conflicts
      .filter((c) => c.status === 'UNRESOLVED')
      .forEach((c) => {
        items.push({
          id: c.id,
          name: c.fieldType,
          patient: patient.name,
          type: 'Medication Record',
          confidence: 99,
          issue: 'Conflicts with intake',
          status: 'NEEDS_REVIEW',
          ref: c,
          kind: 'conflict',
        });
      });

    return items;
  }, [findings, conflicts, patient.name]);

  const relatedEdits = useMemo(() => {
    if (!selectedItem || selectedItem.kind !== 'finding') return [];
    return edits.filter((e) => e.findingId === selectedItem.id);
  }, [edits, selectedItem]);

  const handleEditValue = () => {
    if (selectedItem && selectedItem.kind === 'finding') {
      editFindingValue(selectedItem.ref.id, parseFloat(editValue) || 0, editUnit);
      setEditMode(false);
      setSelectedItem(null);
    }
  };

  const handleEditField = () => {
    if (selectedItem && selectedItem.kind === 'finding' && editField && editFieldValue) {
      editFindingField(selectedItem.ref.id, editField, editFieldValue);
      setEditFieldValue('');
      setEditField('');
    }
  };

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Human Verification</h1>
        <p className="text-sm text-ink-muted mt-0.5">Review uncertain or conflicting extracted information before it becomes part of the verified record.</p>
      </div>

      {/* Queue table */}
      <div className="card">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h3 className="section-title">Verification Queue</h3>
          <span className="text-xs text-ink-faint">{queueItems.length} items pending</span>
        </div>
        {queueItems.length === 0 ? (
          <div className="p-8 text-center">
            <Check className="w-8 h-8 text-status-normal mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink">All items verified</p>
            <p className="text-sm text-ink-muted mt-1">There are no items currently requiring human verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-gray-50/50">
                  <th className="text-left table-header px-4 py-2.5">Item</th>
                  <th className="text-left table-header px-4 py-2.5">Patient</th>
                  <th className="text-left table-header px-4 py-2.5">Type</th>
                  <th className="text-left table-header px-4 py-2.5">Confidence</th>
                  <th className="text-left table-header px-4 py-2.5">Issue</th>
                  <th className="text-left table-header px-4 py-2.5">Status</th>
                  <th className="text-left table-header px-4 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-medium text-ink">{item.name}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{item.patient}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{item.type}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${item.confidence >= 95 ? 'text-status-normal' : 'text-status-review'}`}>
                        {item.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-muted">{item.issue}</td>
                    <td className="px-4 py-2.5"><VerificationBadge status="NEEDS_REVIEW" /></td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => { setSelectedItem(item); setEditMode(false); }}
                        className="text-xs text-brand font-medium hover:underline"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        open={!!selectedItem}
        onClose={() => { setSelectedItem(null); setEditMode(false); }}
        title="Review Item"
      >
        {selectedItem && (
          <div className="space-y-4">
            {selectedItem.kind === 'finding' ? (
              <FindingReview
                finding={selectedItem.ref as Finding}
                editMode={editMode}
                editValue={editValue}
                editUnit={editUnit}
                setEditValue={setEditValue}
                setEditUnit={setEditUnit}
                onEdit={() => {
                  const f = selectedItem.ref as Finding;
                  setEditValue(f.value?.toString() ?? '');
                  setEditUnit(f.unit);
                  setEditMode(true);
                }}
                onSaveEdit={handleEditValue}
                editField={editField}
                editFieldValue={editFieldValue}
                setEditField={setEditField}
                setEditFieldValue={setEditFieldValue}
                onEditField={handleEditField}
                onVerify={() => { verifyFinding(selectedItem.id); setSelectedItem(null); }}
                onFlag={() => { flagFinding(selectedItem.id); setSelectedItem(null); }}
                onReject={() => setConfirmReject(true)}
                relatedEdits={relatedEdits}
              />
            ) : (
              <ConflictReview
                conflict={selectedItem.ref as Conflict}
                onVerify={() => { flagFinding(selectedItem.id); setSelectedItem(null); }}
              />
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmReject}
        title="Reject Extraction"
        message="Are you sure you want to reject this extraction? This will be recorded in the audit history."
        confirmLabel="Reject"
        onConfirm={() => {
          if (selectedItem) {
            rejectFinding(selectedItem.id);
            setConfirmReject(false);
            setSelectedItem(null);
          }
        }}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  );
}

interface FindingReviewProps {
  finding: Finding;
  editMode: boolean;
  editValue: string;
  editUnit: string;
  setEditValue: (v: string) => void;
  setEditUnit: (v: string) => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  editField: string;
  editFieldValue: string;
  setEditField: (v: string) => void;
  setEditFieldValue: (v: string) => void;
  onEditField: () => void;
  onVerify: () => void;
  onFlag: () => void;
  onReject: () => void;
  relatedEdits: EditRecord[];
}

function FindingReview({
  finding,
  editMode,
  editValue,
  editUnit,
  setEditValue,
  setEditUnit,
  onEdit,
  onSaveEdit,
  editField,
  editFieldValue,
  setEditField,
  setEditFieldValue,
  onEditField,
  onVerify,
  onFlag,
  onReject,
  relatedEdits,
}: FindingReviewProps) {
  return (
    <>
      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Extracted Information</p>
        <p className="text-base font-semibold text-ink">{finding.normalizedName}</p>
        <p className="text-xs text-ink-faint mt-0.5">Original: {finding.testName}</p>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Value</p>
        {editMode ? (
          <div className="flex gap-2">
            <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="input-field flex-1" />
            <input type="text" value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="input-field w-20" />
            <button onClick={onSaveEdit} className="btn-primary px-3"><Check className="w-4 h-4" /></button>
          </div>
        ) : (
          <p className="text-sm text-ink">{finding.value} {finding.unit}</p>
        )}
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Source</p>
        <p className="text-sm text-ink">{finding.date} report · Page {finding.sourcePage}</p>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Source Snippet</p>
        <div className="bg-gray-50 border border-line rounded-control p-3">
          <p className="text-sm font-mono text-ink">{finding.sourceSnippet}</p>
        </div>
      </div>

      <div className="border-t border-line pt-4 flex items-center justify-between">
        <p className="text-xs text-ink-muted uppercase tracking-wide">Confidence</p>
        <span className={`text-sm font-medium ${finding.confidence >= 95 ? 'text-status-normal' : 'text-status-review'}`}>{finding.confidence}%</span>
      </div>

      <div className="border-t border-line pt-4 flex items-center justify-between">
        <p className="text-xs text-ink-muted uppercase tracking-wide">Reference Range</p>
        <p className="text-sm text-ink">{finding.referenceRangeRaw}</p>
      </div>

      <div className="border-t border-line pt-4 flex items-center justify-between">
        <p className="text-xs text-ink-muted uppercase tracking-wide">Current Status</p>
        <StatusBadge status={finding.status} />
      </div>

      {/* Edit field section */}
      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-2">Edit Field</p>
        <div className="flex gap-2">
          <select value={editField} onChange={(e) => setEditField(e.target.value)} className="input-field flex-1">
            <option value="">Select field…</option>
            <option value="testName">Test Name</option>
            <option value="unit">Unit</option>
            <option value="referenceRangeRaw">Reference Range</option>
          </select>
          <input type="text" value={editFieldValue} onChange={(e) => setEditFieldValue(e.target.value)} placeholder="New value" className="input-field flex-1" />
          <button onClick={onEditField} className="btn-secondary px-3" disabled={!editField || !editFieldValue}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Audit history */}
      {relatedEdits.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="text-xs text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Audit History
          </p>
          <div className="space-y-1.5">
            {relatedEdits.map((edit: EditRecord) => (
              <div key={edit.id} className="text-xs text-ink-muted bg-gray-50 rounded-control px-3 py-2">
                <span className="font-medium text-ink">{edit.field}</span>: {edit.oldValue} → {edit.newValue}
                <span className="text-ink-faint"> · {edit.editedBy} · {new Date(edit.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-line pt-4 space-y-2">
        <button onClick={onVerify} className="btn-primary w-full">
          <Check className="w-4 h-4" />
          Verify
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onEdit} className="btn-secondary">
            <Edit3 className="w-4 h-4" />
            Edit Value
          </button>
          <button onClick={onFlag} className="btn-secondary">
            <AlertTriangle className="w-4 h-4" />
            Flag
          </button>
        </div>
        <button onClick={onReject} className="btn-ghost w-full text-status-high">
          <X className="w-4 h-4" />
          Reject Extraction
        </button>
      </div>
    </>
  );
}

function ConflictReview({ conflict, onVerify }: { conflict: Conflict; onVerify: () => void }) {
  return (
    <>
      <div>
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Conflict Type</p>
        <p className="text-base font-semibold text-ink">{conflict.fieldType}</p>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Source A — {conflict.sourceARef}</p>
        <div className="bg-gray-50 border border-line rounded-control p-3">
          <p className="text-sm text-ink">{conflict.sourceAValue}</p>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Source B — {conflict.sourceBRef}</p>
        <div className="bg-gray-50 border border-line rounded-control p-3">
          <p className="text-sm text-ink">{conflict.sourceBValue}</p>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Detection Method</p>
        <p className="text-sm text-ink">{conflict.detectionMethod}</p>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm text-ink-muted">{conflict.description}</p>
      </div>

      <div className="border-t border-line pt-4">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          Resolution Note
        </p>
        <p className="text-xs text-ink-faint">MedLens does not determine which source is correct. Please review both sources and acknowledge the conflict.</p>
      </div>

      <div className="border-t border-line pt-4">
        <button onClick={onVerify} className="btn-primary w-full">
          <Check className="w-4 h-4" />
          Resolve Conflict
        </button>
      </div>
    </>
  );
}
