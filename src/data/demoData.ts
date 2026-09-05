import type {
  Patient,
  DocumentRecord,
  Finding,
  Conflict,
  EditRecord,
  SummaryRecord,
  TimelineEvent,
  ClarificationQuestion,
} from '@/types';
import { validateFinding } from '@/lib/validation';
import { normalizeTestName } from '@/lib/normalization';
import { detectAllergyConflict } from '@/lib/conflicts';

export const DEMO_PATIENT: Patient = {
  id: 'p-001',
  name: 'Alex Morgan',
  age: 42,
  sex: 'Male',
  symptoms: 'Fatigue, occasional headaches over the past 3 weeks.',
  conditions: 'Hypertension (managed).',
  allergies: 'No known allergies.',
  medications: 'Amlodipine 5 mg, once daily.',
  notes: 'Patient reports feeling more tired than usual. No recent dietary changes.',
  source: 'USER_PROVIDED',
};

export const DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-001',
    patientId: 'p-001',
    filename: 'lab_report_2026-03-15.pdf',
    uploadDate: '2026-03-15',
    rawText: `LABORATORY REPORT
Date: March 15, 2026
Patient: Alex Morgan

Test Results:
HGB 14.2 g/dL  13.0-17.0
WBC 7.8 K/uL   4.0-11.0
Platelets 245 K/uL  150-400
Glucose 92 mg/dL  70-100`,
    fileType: 'pdf',
    documentType: 'LAB_REPORT',
    extractionStatus: 'VERIFIED',
    pageCount: 1,
    findingsCount: 4,
  },
  {
    id: 'doc-002',
    patientId: 'p-001',
    filename: 'lab_report_2026-06-18.pdf',
    uploadDate: '2026-06-18',
    rawText: `LABORATORY REPORT
Date: June 18, 2026
Patient: Alex Morgan

Test Results:
HGB 12.1 g/dL  13.0-17.0
WBC 8.4 K/uL   4.0-11.0
Platelets 238 K/uL  150-400
Glucose 108 mg/dL  70-100
Total Cholesterol 220 mg/dL  125-200`,
    fileType: 'pdf',
    documentType: 'LAB_REPORT',
    extractionStatus: 'NEEDS_REVIEW',
    pageCount: 1,
    findingsCount: 5,
  },
  {
    id: 'doc-003',
    patientId: 'p-001',
    filename: 'prescription_2026-06-20.pdf',
    uploadDate: '2026-06-20',
    rawText: `PRESCRIPTION
Date: June 20, 2026
Patient: Alex Morgan

Medications:
Amlodipine 5 mg, once daily
Metformin 500 mg, twice daily

Allergies:
Penicillin — Skin rash`,
    fileType: 'pdf',
    documentType: 'PRESCRIPTION',
    extractionStatus: 'EXTRACTED',
    pageCount: 1,
    findingsCount: 0,
  },
];

function makeFinding(
  id: string,
  documentId: string,
  patientId: string,
  testName: string,
  value: number,
  unit: string,
  refLow: number,
  refHigh: number,
  refRaw: string,
  confidence: number,
  sourcePage: number,
  snippet: string,
  verification: 'NEEDS_REVIEW' | 'VERIFIED',
  date: string,
): Finding {
  return {
    id,
    documentId,
    patientId,
    testName,
    normalizedName: normalizeTestName(testName),
    value,
    unit,
    referenceRangeRaw: refRaw,
    referenceLow: refLow,
    referenceHigh: refHigh,
    status: validateFinding(value, refLow, refHigh),
    confidence,
    sourcePage,
    sourceSnippet: snippet,
    verificationStatus: verification,
    date,
  };
}

export const DEMO_FINDINGS: Finding[] = [
  // March 15 report
  makeFinding('f-001', 'doc-001', 'p-001', 'HGB', 14.2, 'g/dL', 13.0, 17.0, '13.0–17.0', 98, 1, 'HGB 14.2 g/dL  13.0-17.0', 'VERIFIED', '2026-03-15'),
  makeFinding('f-002', 'doc-001', 'p-001', 'WBC', 7.8, 'K/uL', 4.0, 11.0, '4.0–11.0', 97, 1, 'WBC 7.8 K/uL   4.0-11.0', 'VERIFIED', '2026-03-15'),
  makeFinding('f-003', 'doc-001', 'p-001', 'Platelets', 245, 'K/uL', 150, 400, '150–400', 96, 1, 'Platelets 245 K/uL  150-400', 'VERIFIED', '2026-03-15'),
  makeFinding('f-004', 'doc-001', 'p-001', 'Glucose', 92, 'mg/dL', 70, 100, '70–100', 98, 1, 'Glucose 92 mg/dL  70-100', 'VERIFIED', '2026-03-15'),

  // June 18 report
  makeFinding('f-005', 'doc-002', 'p-001', 'HGB', 12.1, 'g/dL', 13.0, 17.0, '13.0–17.0', 96, 1, 'HGB 12.1 g/dL  13.0-17.0', 'NEEDS_REVIEW', '2026-06-18'),
  makeFinding('f-006', 'doc-002', 'p-001', 'WBC', 8.4, 'K/uL', 4.0, 11.0, '4.0–11.0', 97, 1, 'WBC 8.4 K/uL   4.0-11.0', 'VERIFIED', '2026-06-18'),
  makeFinding('f-007', 'doc-002', 'p-001', 'Platelets', 238, 'K/uL', 150, 400, '150–400', 95, 1, 'Platelets 238 K/uL  150-400', 'VERIFIED', '2026-06-18'),
  makeFinding('f-008', 'doc-002', 'p-001', 'Glucose', 108, 'mg/dL', 70, 100, '70–100', 98, 1, 'Glucose 108 mg/dL  70-100', 'VERIFIED', '2026-06-18'),
  makeFinding('f-009', 'doc-002', 'p-001', 'Total Cholesterol', 220, 'mg/dL', 125, 200, '125–200', 94, 1, 'Total Cholesterol 220 mg/dL  125-200', 'NEEDS_REVIEW', '2026-06-18'),
];

export const DEMO_CONFLICTS: Conflict[] = [
  detectAllergyConflict(DEMO_PATIENT, 'Penicillin — Skin rash', 'Prescription — June 20, 2026'),
].filter((c): c is Conflict => c !== null);

export const DEMO_EDITS: EditRecord[] = [
  {
    id: 'edit-001',
    findingId: 'f-006',
    field: 'verification_status',
    oldValue: 'NEEDS_REVIEW',
    newValue: 'VERIFIED',
    editedBy: 'Dr. Sarah Chen',
    timestamp: '2026-06-19T10:32:00Z',
  },
  {
    id: 'edit-002',
    findingId: 'f-008',
    field: 'verification_status',
    oldValue: 'NEEDS_REVIEW',
    newValue: 'VERIFIED',
    editedBy: 'Dr. Sarah Chen',
    timestamp: '2026-06-19T10:35:00Z',
  },
];

export const DEMO_SUMMARY: SummaryRecord = {
  id: 'sum-001',
  patientId: 'p-001',
  text: `Your recent laboratory report (June 18, 2026) includes several measurements that differ from the previous report (March 15, 2026). Hemoglobin changed from 14.2 g/dL to 12.1 g/dL, while glucose changed from 92 mg/dL to 108 mg/dL. The current report marks both values outside its supplied reference ranges. Total cholesterol (220 mg/dL) is a new measurement also marked outside the supplied range. White blood cell count and platelets remain within their reference ranges.`,
  generatedAt: '2026-06-21T08:00:00Z',
  modelVersion: 'Claude 4 Sonnet',
  source: 'AI_GENERATED',
};

export const DEMO_CLARIFICATIONS: ClarificationQuestion[] = [
  {
    id: 'cq-1',
    question: 'The intake record says "no known allergies," while the prescription lists penicillin with a skin rash. Which information should be recorded as the current patient history?',
    evidence: 'Patient Intake vs. Prescription — June 20, 2026',
    relatedConflictId: 'conflict-allergy-p-001',
  },
  {
    id: 'cq-2',
    question: 'Should the June 20 medication list (Amlodipine 5 mg, Metformin 500 mg) be treated as the current medication list?',
    evidence: 'Prescription — June 20, 2026',
  },
  {
    id: 'cq-3',
    question: 'The June 18 report does not include a prior total cholesterol value. Should total cholesterol be tracked as a new baseline?',
    evidence: 'June 18, 2026 Lab Report',
  },
];

export const DEMO_TIMELINE: TimelineEvent[] = [
  {
    id: 'tl-1',
    date: '2026-03-15',
    title: 'Lab Report',
    documentType: 'LAB_REPORT',
    provenance: 'AI_EXTRACTED',
    findings: [
      { name: 'Hemoglobin', value: '14.2', unit: 'g/dL' },
      { name: 'Glucose', value: '92', unit: 'mg/dL' },
      { name: 'WBC', value: '7.8', unit: 'K/uL' },
      { name: 'Platelets', value: '245', unit: 'K/uL' },
    ],
  },
  {
    id: 'tl-2',
    date: '2026-06-18',
    title: 'Lab Report',
    documentType: 'LAB_REPORT',
    provenance: 'AI_EXTRACTED',
    findings: [
      { name: 'Hemoglobin', value: '12.1', unit: 'g/dL' },
      { name: 'Glucose', value: '108', unit: 'mg/dL' },
      { name: 'Total Cholesterol', value: '220', unit: 'mg/dL' },
      { name: 'WBC', value: '8.4', unit: 'K/uL' },
      { name: 'Platelets', value: '238', unit: 'K/uL' },
    ],
  },
  {
    id: 'tl-3',
    date: '2026-06-20',
    title: 'Prescription',
    documentType: 'PRESCRIPTION',
    provenance: 'AI_EXTRACTED',
    findings: [
      { name: 'Amlodipine', value: '5 mg', unit: 'once daily' },
      { name: 'Metformin', value: '500 mg', unit: 'twice daily' },
      { name: 'Penicillin allergy noted', value: 'Skin rash', unit: '' },
    ],
  },
];
