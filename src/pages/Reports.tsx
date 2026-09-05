import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ClipboardPaste, FileText, X } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { ExtractionBadge } from '@/components/StatusBadges';
import { ProcessingPipeline } from '@/components/ProcessingPipeline';
import type { DocumentType } from '@/types';

export function Reports() {
  const { documents, patient, addDocument, updateDocument, addToast } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteName, setPasteName] = useState('');
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [pipelineFilename, setPipelineFilename] = useState('');
  const [pipelineDocId, setPipelineDocId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('File exceeds 10 MB size limit.', 'error');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      addToast('Unsupported file type. Please upload PDF, image, or text files.', 'error');
      return;
    }

    const fileType = file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : 'text';
    const docType: DocumentType = file.name.toLowerCase().includes('prescription') ? 'PRESCRIPTION' : 'LAB_REPORT';

    const docId = addDocument({
      patientId: patient.id,
      filename: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      rawText: 'Processing…',
      fileType,
      documentType: docType,
      extractionStatus: 'PROCESSING',
      pageCount: 1,
      findingsCount: 0,
    });

    setPipelineFilename(file.name);
    setPipelineDocId(docId);
    setPipelineOpen(true);
    e.target.value = '';
  };

  const handlePipelineComplete = () => {
    if (pipelineDocId) {
      updateDocument(pipelineDocId, {
        extractionStatus: 'NEEDS_REVIEW',
        findingsCount: 12,
      });
      navigate(`/reports/${pipelineDocId}`);
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      addToast('Please paste report text before submitting.', 'error');
      return;
    }

    const name = pasteName.trim() || `pasted_report_${new Date().toISOString().split('T')[0]}.txt`;
    const docId = addDocument({
      patientId: patient.id,
      filename: name,
      uploadDate: new Date().toISOString().split('T')[0],
      rawText: pasteText,
      fileType: 'text',
      documentType: 'LAB_REPORT',
      extractionStatus: 'PROCESSING',
      pageCount: 1,
      findingsCount: 0,
    });

    setPasteText('');
    setPasteName('');
    setShowPaste(false);

    setPipelineFilename(name);
    setPipelineDocId(docId);
    setPipelineOpen(true);
  };

  return (
    <div className="max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Medical Reports</h1>
          <p className="text-sm text-ink-muted mt-0.5">Upload and manage patient documents. Extracted findings are linked to the patient record.</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
            <Upload className="w-4 h-4" />
            Upload Report
          </button>
          <button onClick={() => setShowPaste(true)} className="btn-secondary">
            <ClipboardPaste className="w-4 h-4" />
            Paste Report Text
          </button>
        </div>
      </div>

      {/* Reports table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-gray-50/50">
                <th className="text-left table-header px-4 py-2.5">Document</th>
                <th className="text-left table-header px-4 py-2.5">Patient</th>
                <th className="text-left table-header px-4 py-2.5">Date</th>
                <th className="text-left table-header px-4 py-2.5">Type</th>
                <th className="text-left table-header px-4 py-2.5">Findings</th>
                <th className="text-left table-header px-4 py-2.5">Extraction</th>
                <th className="text-left table-header px-4 py-2.5">Review</th>
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
                    <FileText className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                    {doc.filename}
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{patient.name}</td>
                  <td className="px-4 py-2.5 text-ink-muted">{doc.uploadDate}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-ink-muted">
                      {doc.documentType === 'LAB_REPORT' ? 'Lab Report' : doc.documentType === 'PRESCRIPTION' ? 'Prescription' : doc.documentType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-ink-muted">{doc.findingsCount}</td>
                  <td className="px-4 py-2.5"><ExtractionBadge status={doc.extractionStatus} /></td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/reports/${doc.id}`); }}
                      className="text-xs text-brand font-medium hover:underline"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paste modal */}
      {showPaste && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={() => setShowPaste(false)} aria-hidden="true" />
          <div className="relative bg-white border border-line rounded-container max-w-lg w-full p-5 animate-slide-up" role="dialog" aria-label="Paste report text">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-ink">Paste Report Text</h3>
              <button onClick={() => setShowPaste(false)} className="p-1 rounded text-ink-faint hover:text-ink" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-text" htmlFor="paste-name">Filename (optional)</label>
                <input
                  id="paste-name"
                  type="text"
                  value={pasteName}
                  onChange={(e) => setPasteName(e.target.value)}
                  placeholder="report_name.txt"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text" htmlFor="paste-text">Report Text</label>
                <textarea
                  id="paste-text"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={8}
                  placeholder="Paste the full report text here…"
                  className="input-field resize-none font-mono text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowPaste(false)} className="btn-secondary">Cancel</button>
              <button onClick={handlePasteSubmit} className="btn-primary">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Processing pipeline */}
      <ProcessingPipeline
        open={pipelineOpen}
        filename={pipelineFilename}
        onClose={() => setPipelineOpen(false)}
        onComplete={handlePipelineComplete}
      />
    </div>
  );
}
