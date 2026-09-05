import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Check, Search, Info } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { StatusBadge, VerificationBadge } from '@/components/StatusBadges';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import { EmptyState } from '@/components/Dialogs';
import type { Finding } from '@/types';

export function EvidenceViewer() {
  const { documents, findings, verifyFinding } = useData();
  const [searchParams] = useSearchParams();

  const initialDocId = searchParams.get('docId') ?? documents[0]?.id ?? '';
  const initialFindingId = searchParams.get('findingId') ?? '';

  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [selectedFindingId, setSelectedFindingId] = useState<string>(initialFindingId);

  // If URL params change (e.g. navigated from another page), update selection
  useEffect(() => {
    const docId = searchParams.get('docId');
    const findingId = searchParams.get('findingId');
    if (docId) setSelectedDocId(docId);
    if (findingId) setSelectedFindingId(findingId);
  }, [searchParams]);

  // Ensure selected finding belongs to selected doc; if not, pick first finding of that doc
  useEffect(() => {
    const docFindings = findings.filter((f) => f.documentId === selectedDocId);
    if (docFindings.length > 0 && !docFindings.some((f) => f.id === selectedFindingId)) {
      setSelectedFindingId(docFindings[0].id);
    }
  }, [selectedDocId, findings, selectedFindingId]);

  const selectedDoc = useMemo(() => documents.find((d) => d.id === selectedDocId), [documents, selectedDocId]);
  const selectedFinding = useMemo(() => findings.find((f) => f.id === selectedFindingId), [findings, selectedFindingId]);

  const docFindings = useMemo(() => findings.filter((f) => f.documentId === selectedDocId), [findings, selectedDocId]);

  const highlightSnippet = (text: string, snippet: string): { parts: { text: string; highlight: boolean }[] } => {
    if (!snippet || snippet.length < 3) return { parts: [{ text, highlight: false }] };
    const idx = text.indexOf(snippet);
    if (idx === -1) {
      const words = snippet.split(/\s+/).slice(0, 4).join(' ');
      const partialIdx = text.indexOf(words);
      if (partialIdx === -1) return { parts: [{ text, highlight: false }] };
      return {
        parts: [
          { text: text.slice(0, partialIdx), highlight: false },
          { text: text.slice(partialIdx, partialIdx + words.length), highlight: true },
          { text: text.slice(partialIdx + words.length), highlight: false },
        ],
      };
    }
    return {
      parts: [
        { text: text.slice(0, idx), highlight: false },
        { text: text.slice(idx, idx + snippet.length), highlight: true },
        { text: text.slice(idx + snippet.length), highlight: false },
      ],
    };
  };

  const renderedText = selectedDoc && selectedFinding
    ? highlightSnippet(selectedDoc.rawText, selectedFinding.sourceSnippet)
    : null;

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Evidence & Sources</h1>
        <p className="text-sm text-ink-muted mt-0.5">Trace any structured finding back to its exact source snippet. Every piece of information has a verifiable origin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '500px' }}>
        {/* LEFT - Documents/pages */}
        <div className="lg:col-span-3 card">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="section-title">Documents</h3>
          </div>
          <div className="divide-y divide-line">
            {documents.map((doc) => (
              <div key={doc.id}>
                <button
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedDocId === doc.id ? 'bg-brand-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${selectedDocId === doc.id ? 'text-brand' : 'text-ink-faint'}`} />
                    <span className={`text-sm font-medium ${selectedDocId === doc.id ? 'text-brand' : 'text-ink'}`}>
                      {doc.uploadDate}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted ml-5.5">{doc.documentType === 'LAB_REPORT' ? 'Lab Report' : doc.documentType === 'PRESCRIPTION' ? 'Prescription' : doc.documentType}</p>
                  <p className="text-xs text-ink-faint ml-5.5 mt-0.5 truncate">{doc.filename}</p>
                </button>
                {selectedDocId === doc.id && (
                  <div className="px-4 pb-2">
                    <div className="ml-5.5 text-xs text-ink-faint">Page 1 of {doc.pageCount}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CENTER - Document content */}
        <div className="lg:col-span-5 card">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h3 className="section-title">Source Content</h3>
            {selectedDoc && <ProvenanceTag source="AI_EXTRACTED" compact />}
          </div>
          <div className="p-5">
            {selectedDoc ? (
              <div className="bg-white border border-line rounded-control p-5 min-h-[400px]">
                {renderedText ? (
                  <pre className="text-sm font-mono text-ink whitespace-pre-wrap leading-relaxed">
                    {renderedText.parts.map((part, i) =>
                      part.highlight ? (
                        <mark key={i} className="bg-amber-200 text-ink px-0.5 rounded">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                  </pre>
                ) : (
                  <pre className="text-sm font-mono text-ink whitespace-pre-wrap leading-relaxed">{selectedDoc.rawText}</pre>
                )}
              </div>
            ) : (
              <EmptyState title="No document selected" message="Select a document from the left panel to view its content." icon={<FileText className="w-8 h-8" />} />
            )}
          </div>
        </div>

        {/* RIGHT - Evidence details */}
        <div className="lg:col-span-4 card">
          <div className="px-4 py-3 border-b border-line">
            <h3 className="section-title">Evidence Details</h3>
          </div>
          <div className="p-4">
            {/* Findings selector */}
            {docFindings.length > 0 && (
              <div className="mb-4">
                <label className="label-text" htmlFor="finding-select">Select Finding</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint" aria-hidden="true" />
                  <select
                    id="finding-select"
                    value={selectedFindingId}
                    onChange={(e) => setSelectedFindingId(e.target.value)}
                    className="input-field pl-8 appearance-none"
                  >
                    {docFindings.map((f) => (
                      <option key={f.id} value={f.id}>{f.normalizedName} — {f.value} {f.unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {selectedFinding ? (
              <FindingEvidenceDetail finding={selectedFinding} onVerify={() => verifyFinding(selectedFinding.id)} />
            ) : (
              <EmptyState title="No findings available" message="This document has no structured findings to display." icon={<Search className="w-8 h-8" />} />
            )}
          </div>
        </div>
      </div>

      {/* Traceability + confidence info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Search className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">Traceability:</span> Every structured finding can be traced to its source document, page, and exact text snippet. This chain of evidence is a core differentiator of MedLens.
            </p>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-ink-faint mt-0.5 shrink-0" />
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">Extraction confidence is not medical certainty.</span> Confidence scores reflect the reliability of text extraction, not the clinical significance of a finding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FindingEvidenceDetail({ finding, onVerify }: { finding: Finding; onVerify: () => void }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Finding" value={finding.normalizedName} />
      <DetailRow label="Original Name" value={finding.testName} />
      <DetailRow label="Normalized Value" value={`${finding.value} ${finding.unit}`} />
      <DetailRow label="Reference Range" value={finding.referenceRangeRaw} />
      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-ink-muted uppercase tracking-wide">Status</span>
        <StatusBadge status={finding.status} />
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-ink-muted uppercase tracking-wide">Confidence</span>
        <span className={`text-sm font-medium ${finding.confidence >= 95 ? 'text-status-normal' : 'text-status-review'}`}>{finding.confidence}%</span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-ink-muted uppercase tracking-wide">Provenance</span>
        <ProvenanceTag source="AI_EXTRACTED" compact />
      </div>
      <DetailRow label="Source Page" value={`Page ${finding.sourcePage}`} />
      <DetailRow label="Source Date" value={finding.date} />

      <div className="pt-2 border-t border-line">
        <p className="text-xs text-ink-muted uppercase tracking-wide mb-1.5">Exact Snippet</p>
        <div className="bg-amber-50 border border-amber-200 rounded-control p-3">
          <p className="text-sm font-mono text-ink">{finding.sourceSnippet}</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-ink-muted uppercase tracking-wide">Verification</span>
        <VerificationBadge status={finding.verificationStatus} />
      </div>

      <button onClick={onVerify} className="btn-primary w-full mt-2" disabled={finding.verificationStatus === 'VERIFIED'}>
        <Check className="w-4 h-4" />
        Verify Finding
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-ink-muted uppercase tracking-wide">{label}</span>
      <span className="text-sm text-ink font-medium">{value}</span>
    </div>
  );
}
