import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, FileText, Check, Edit3, Flag, X } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge, VerificationBadge, ExtractionBadge } from '@/components/StatusBadges';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import { Drawer } from '@/components/Drawer';
import { ConfirmDialog } from '@/components/Dialogs';
import type { Finding } from '@/types';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocumentById, getFindingsByDocument, patient, verifyFinding, flagFinding, editFindingValue } = useData();

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [confirmReject, setConfirmReject] = useState(false);

  const document = id ? getDocumentById(id) : undefined;
  const findings = id ? getFindingsByDocument(id) : [];

  if (!document) {
    return (
      <div className="max-w-[1400px]">
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-muted">Report not found.</p>
          <button onClick={() => navigate('/reports')} className="btn-secondary mt-3">Back to Reports</button>
        </div>
      </div>
    );
  }

  const handleEdit = (finding: Finding) => {
    setEditMode(true);
    setEditValue(finding.value?.toString() ?? '');
    setEditUnit(finding.unit);
  };

  const handleSaveEdit = () => {
    if (selectedFinding) {
      editFindingValue(selectedFinding.id, parseFloat(editValue) || 0, editUnit);
      setEditMode(false);
      setSelectedFinding(null);
    }
  };

  return (
    <div className="max-w-[1400px] space-y-5">
      {/* Back link */}
      <button onClick={() => navigate('/reports')} className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </button>

      {/* Report header */}
      <div className="card px-5 py-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-50 rounded-control">
              <FileText className="w-5 h-5 text-ink-muted" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-ink">{document.uploadDate}</h1>
              <p className="text-sm text-ink-muted">{document.documentType === 'LAB_REPORT' ? 'Laboratory Report' : document.documentType === 'PRESCRIPTION' ? 'Prescription' : document.documentType}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-ink-muted">Extraction Status</p>
              <div className="mt-1"><ExtractionBadge status={document.extractionStatus} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-muted">Findings</p>
              <p className="text-lg font-semibold text-ink">{findings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report metadata */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line">
          <h3 className="section-title">Report Metadata</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line">
          <MetaItem label="Filename" value={document.filename} />
          <MetaItem label="Patient" value={patient.name} />
          <MetaItem label="Upload Date" value={document.uploadDate} />
          <MetaItem label="File Type" value={document.fileType.toUpperCase()} />
        </div>
      </div>

      {/* Findings table */}
      <div className="card">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h3 className="section-title">Extracted Findings</h3>
          <span className="text-xs text-ink-faint">Click a row to view extraction details</span>
        </div>
        {findings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-ink-muted">No structured findings extracted from this document.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-gray-50/50">
                  <th className="text-left table-header px-4 py-2.5">Original Test Name</th>
                  <th className="text-left table-header px-4 py-2.5">Normalized Name</th>
                  <th className="text-right table-header px-4 py-2.5">Value</th>
                  <th className="text-left table-header px-4 py-2.5">Unit</th>
                  <th className="text-left table-header px-4 py-2.5">Ref Range</th>
                  <th className="text-left table-header px-4 py-2.5">Status</th>
                  <th className="text-left table-header px-4 py-2.5">Confidence</th>
                  <th className="text-left table-header px-4 py-2.5">Source</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => { setSelectedFinding(f); setEditMode(false); }}
                    className="border-b border-line last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-ink-muted">{f.testName}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">{f.normalizedName}</td>
                    <td className="px-4 py-2.5 text-right text-ink font-medium">{f.value}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{f.unit}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{f.referenceRangeRaw}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={f.status} /></td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${f.confidence >= 95 ? 'text-status-normal' : 'text-status-review'}`}>
                        {f.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5"><ProvenanceTag source="AI_EXTRACTED" compact /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Finding detail drawer */}
      <Drawer
        open={!!selectedFinding}
        onClose={() => { setSelectedFinding(null); setEditMode(false); }}
        title="Finding Detail"
      >
        {selectedFinding && (
          <div className="space-y-4">
            {/* Finding name */}
            <div>
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Finding</p>
              <p className="text-base font-semibold text-ink">{selectedFinding.normalizedName}</p>
              <p className="text-xs text-ink-faint mt-0.5">Original: {selectedFinding.testName}</p>
            </div>

            {/* Extracted value */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Extracted Value</p>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="input-field flex-1"
                  />
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="input-field w-20"
                  />
                  <button onClick={handleSaveEdit} className="btn-primary px-3">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-ink">{selectedFinding.value} {selectedFinding.unit}</p>
              )}
            </div>

            {/* Normalized */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Normalized Name</p>
              <p className="text-sm text-ink">{selectedFinding.normalizedName}</p>
            </div>

            {/* Reference range */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Reference Range</p>
              <p className="text-sm text-ink">{selectedFinding.referenceRangeRaw}</p>
            </div>

            {/* Status */}
            <div className="border-t border-line pt-4 flex items-center justify-between">
              <p className="text-xs text-ink-muted uppercase tracking-wide">Status</p>
              <StatusBadge status={selectedFinding.status} />
            </div>

            {/* Confidence */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Confidence</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${selectedFinding.confidence >= 95 ? 'bg-status-normal' : 'bg-status-review'}`}
                    style={{ width: `${selectedFinding.confidence}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-ink">{selectedFinding.confidence}%</span>
              </div>
            </div>

            {/* Source */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">Source</p>
              <p className="text-sm text-ink">{document.uploadDate} report · Page {selectedFinding.sourcePage}</p>
            </div>

            {/* Source snippet */}
            <div className="border-t border-line pt-4">
              <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Source Snippet</p>
              <div className="bg-gray-50 border border-line rounded-control p-3">
                <p className="text-sm font-mono text-ink">{selectedFinding.sourceSnippet}</p>
              </div>
            </div>

            {/* Verification */}
            <div className="border-t border-line pt-4 flex items-center justify-between">
              <p className="text-xs text-ink-muted uppercase tracking-wide">Verification</p>
              <VerificationBadge status={selectedFinding.verificationStatus} />
            </div>

            {/* Actions */}
            <div className="border-t border-line pt-4 space-y-2">
              <button onClick={() => verifyFinding(selectedFinding.id)} className="btn-primary w-full">
                <Check className="w-4 h-4" />
                Verify
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleEdit(selectedFinding)} className="btn-secondary">
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button onClick={() => flagFinding(selectedFinding.id)} className="btn-secondary">
                  <Flag className="w-4 h-4" />
                  Flag for Review
                </button>
              </div>
              <button onClick={() => setConfirmReject(true)} className="btn-ghost w-full text-status-high">
                <X className="w-4 h-4" />
                Reject Extraction
              </button>
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmReject}
        title="Reject Extraction"
        message="Are you sure you want to reject this finding extraction? This action will be recorded in the audit history."
        confirmLabel="Reject"
        onConfirm={() => {
          if (selectedFinding) {
            flagFinding(selectedFinding.id);
            setConfirmReject(false);
            setSelectedFinding(null);
          }
        }}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <p className="text-xs text-ink-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-ink font-medium">{value}</p>
    </div>
  );
}
