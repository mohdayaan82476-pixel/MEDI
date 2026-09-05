export type Provenance = 'USER_PROVIDED' | 'AI_EXTRACTED' | 'AI_GENERATED' | 'HUMAN_VERIFIED';

export type FindingStatus = 'LOW' | 'HIGH' | 'NORMAL' | 'UNKNOWN';

export type VerificationStatus = 'NEEDS_REVIEW' | 'VERIFIED' | 'FLAGGED' | 'REJECTED';

export type ExtractionStatus = 'PROCESSING' | 'EXTRACTED' | 'NEEDS_REVIEW' | 'VERIFIED';

export type ConflictStatus = 'UNRESOLVED' | 'ACKNOWLEDGED' | 'DISMISSED';

export type ConflictPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type DocumentType = 'LAB_REPORT' | 'PRESCRIPTION' | 'INTAKE' | 'IMAGING' | 'CLINICAL_NOTE';

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  symptoms: string;
  conditions: string;
  allergies: string;
  medications: string;
  notes: string;
  source: Provenance;
}

export interface DocumentRecord {
  id: string;
  patientId: string;
  filename: string;
  uploadDate: string;
  rawText: string;
  fileType: 'pdf' | 'image' | 'text';
  documentType: DocumentType;
  extractionStatus: ExtractionStatus;
  pageCount: number;
  findingsCount: number;
}

export interface Finding {
  id: string;
  documentId: string;
  patientId: string;
  testName: string;
  normalizedName: string;
  value: number | null;
  unit: string;
  referenceRangeRaw: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  status: FindingStatus;
  confidence: number;
  sourcePage: number;
  sourceSnippet: string;
  verificationStatus: VerificationStatus;
  date: string;
}

export interface Conflict {
  id: string;
  patientId: string;
  fieldType: string;
  sourceARef: string;
  sourceAValue: string;
  sourceBRef: string;
  sourceBValue: string;
  detectionMethod: 'Rule-based' | 'AI-assisted';
  description: string;
  status: ConflictStatus;
  priority: ConflictPriority;
}

export interface EditRecord {
  id: string;
  findingId: string;
  field: string;
  oldValue: string;
  newValue: string;
  editedBy: string;
  timestamp: string;
}

export interface SummaryRecord {
  id: string;
  patientId: string;
  text: string;
  generatedAt: string;
  modelVersion: string;
  source: Provenance;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  documentType: DocumentType;
  findings: { name: string; value: string; unit: string }[];
  provenance: Provenance;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  evidence: string;
  relatedConflictId?: string;
}
