import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Patient,
  DocumentRecord,
  Finding,
  Conflict,
  EditRecord,
  SummaryRecord,
  ClarificationQuestion,
  TimelineEvent,
  VerificationStatus,
  ConflictStatus,
} from '@/types';
import {
  DEMO_PATIENT,
  DEMO_DOCUMENTS,
  DEMO_FINDINGS,
  DEMO_CONFLICTS,
  DEMO_EDITS,
  DEMO_SUMMARY,
  DEMO_CLARIFICATIONS,
  DEMO_TIMELINE,
} from '@/data/demoData';
import { validateFinding } from '@/lib/validation';
import { normalizeTestName } from '@/lib/normalization';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface DataContextValue {
  patient: Patient;
  documents: DocumentRecord[];
  findings: Finding[];
  conflicts: Conflict[];
  edits: EditRecord[];
  summary: SummaryRecord;
  clarifications: ClarificationQuestion[];
  timeline: TimelineEvent[];
  toasts: Toast[];
  updatePatient: (updates: Partial<Patient>) => void;
  addDocument: (doc: Omit<DocumentRecord, 'id'>) => string;
  updateDocument: (docId: string, updates: Partial<DocumentRecord>) => void;
  verifyFinding: (findingId: string) => void;
  flagFinding: (findingId: string) => void;
  rejectFinding: (findingId: string) => void;
  editFindingValue: (findingId: string, newValue: number, newUnit: string) => void;
  editFindingField: (findingId: string, field: string, newValue: string) => void;
  acknowledgeConflict: (conflictId: string) => void;
  dismissConflict: (conflictId: string) => void;
  resolveConflict: (conflictId: string, resolution: 'sourceA' | 'sourceB') => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetDemoData: () => void;
  getFindingsByDocument: (documentId: string) => Finding[];
  getFindingsByPatient: (patientId: string) => Finding[];
  getConflictById: (id: string) => Conflict | undefined;
  getFindingById: (id: string) => Finding | undefined;
  getDocumentById: (id: string) => DocumentRecord | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

let toastCounter = 0;

export function DataProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient>(DEMO_PATIENT);
  const [documents, setDocuments] = useState<DocumentRecord[]>(DEMO_DOCUMENTS);
  const [findings, setFindings] = useState<Finding[]>(DEMO_FINDINGS);
  const [conflicts, setConflicts] = useState<Conflict[]>(DEMO_CONFLICTS);
  const [edits, setEdits] = useState<EditRecord[]>(DEMO_EDITS);
  const [summary] = useState<SummaryRecord>(DEMO_SUMMARY);
  const [clarifications] = useState<ClarificationQuestion[]>(DEMO_CLARIFICATIONS);
  const [timeline] = useState<TimelineEvent[]>(DEMO_TIMELINE);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addEditRecord = useCallback((findingId: string, field: string, oldValue: string, newValue: string) => {
    const edit: EditRecord = {
      id: `edit-${Date.now()}`,
      findingId,
      field,
      oldValue,
      newValue,
      editedBy: 'Dr. Sarah Chen',
      timestamp: new Date().toISOString(),
    };
    setEdits((prev) => [edit, ...prev]);
  }, []);

  const updatePatient = useCallback((updates: Partial<Patient>) => {
    setPatient((prev) => ({ ...prev, ...updates }));
  }, []);

  const addDocument = useCallback((doc: Omit<DocumentRecord, 'id'>) => {
    const id = `doc-${Date.now()}`;
    setDocuments((prev) => [...prev, { ...doc, id }]);
    return id;
  }, []);

  const updateDocument = useCallback((docId: string, updates: Partial<DocumentRecord>) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...updates } : d)));
  }, []);

  const resetDemoData = useCallback(() => {
    setPatient(DEMO_PATIENT);
    setDocuments(DEMO_DOCUMENTS);
    setFindings(DEMO_FINDINGS);
    setConflicts(DEMO_CONFLICTS);
    setEdits(DEMO_EDITS);
    addToast('Demo data reset to default state.', 'success');
  }, [addToast]);

  const verifyFinding = useCallback((findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          addEditRecord(findingId, 'verification_status', f.verificationStatus, 'VERIFIED');
          return { ...f, verificationStatus: 'VERIFIED' as VerificationStatus };
        }
        return f;
      }),
    );
    addToast('Finding verified successfully.', 'success');
  }, [addEditRecord, addToast]);

  const flagFinding = useCallback((findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          addEditRecord(findingId, 'verification_status', f.verificationStatus, 'FLAGGED');
          return { ...f, verificationStatus: 'FLAGGED' as VerificationStatus };
        }
        return f;
      }),
    );
    addToast('Finding flagged for review.', 'info');
  }, [addEditRecord, addToast]);

  const rejectFinding = useCallback((findingId: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          addEditRecord(findingId, 'verification_status', f.verificationStatus, 'REJECTED');
          return { ...f, verificationStatus: 'REJECTED' as VerificationStatus };
        }
        return f;
      }),
    );
    addToast('Extraction rejected.', 'info');
  }, [addEditRecord, addToast]);

  const editFindingValue = useCallback((findingId: string, newValue: number, newUnit: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const oldVal = f.value !== null ? f.value.toString() : '—';
          addEditRecord(findingId, 'value', oldVal, newValue.toString());
          const status = validateFinding(newValue, f.referenceLow, f.referenceHigh);
          return { ...f, value: newValue, unit: newUnit, status };
        }
        return f;
      }),
    );
    addToast('Finding value updated.', 'success');
  }, [addEditRecord, addToast]);

  const editFindingField = useCallback((findingId: string, field: string, newValue: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const oldVal = (f as unknown as Record<string, unknown>)[field] as string;
          addEditRecord(findingId, field, oldVal, newValue);
          if (field === 'testName') {
            return { ...f, testName: newValue, normalizedName: normalizeTestName(newValue) };
          }
          return { ...f, [field]: newValue };
        }
        return f;
      }),
    );
    addToast('Finding field updated.', 'success');
  }, [addEditRecord, addToast]);

  const acknowledgeConflict = useCallback((conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId ? { ...c, status: 'ACKNOWLEDGED' as ConflictStatus } : c,
      ),
    );
    addToast('Conflict acknowledged.', 'success');
  }, [addToast]);

  const dismissConflict = useCallback((conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId ? { ...c, status: 'DISMISSED' as ConflictStatus } : c,
      ),
    );
    addToast('Conflict dismissed.', 'info');
  }, [addToast]);

  const resolveConflict = useCallback((conflictId: string, resolution: 'sourceA' | 'sourceB') => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? { ...c, status: 'ACKNOWLEDGED' as ConflictStatus }
          : c,
      ),
    );
    addToast(`Conflict resolved in favor of ${resolution === 'sourceA' ? 'Source A' : 'Source B'}.`, 'success');
  }, [addToast]);

  const getFindingsByDocument = useCallback(
    (documentId: string) => findings.filter((f) => f.documentId === documentId),
    [findings],
  );

  const getFindingsByPatient = useCallback(
    (patientId: string) => findings.filter((f) => f.patientId === patientId),
    [findings],
  );

  const getConflictById = useCallback((id: string) => conflicts.find((c) => c.id === id), [conflicts]);
  const getFindingById = useCallback((id: string) => findings.find((f) => f.id === id), [findings]);
  const getDocumentById = useCallback((id: string) => documents.find((d) => d.id === id), [documents]);

  const value: DataContextValue = {
    patient,
    documents,
    findings,
    conflicts,
    edits,
    summary,
    clarifications,
    timeline,
    toasts,
    updatePatient,
    addDocument,
    updateDocument,
    verifyFinding,
    flagFinding,
    rejectFinding,
    editFindingValue,
    editFindingField,
    acknowledgeConflict,
    dismissConflict,
    resolveConflict,
    addToast,
    removeToast,
    resetDemoData,
    getFindingsByDocument,
    getFindingsByPatient,
    getConflictById,
    getFindingById,
    getDocumentById,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
