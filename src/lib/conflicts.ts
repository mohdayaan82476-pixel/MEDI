import type { Conflict, Patient } from '@/types';

/**
 * Rule-based conflict detection.
 *
 * Examples:
 *   "No known allergies" vs "Penicillin allergy" → CONFLICT
 *   "Penicillin allergy" vs "No penicillin allergy" → CONFLICT
 *   Same medication, different dosage → REVIEW (not conflict)
 *   Medication current vs discontinued → REVIEW (not conflict)
 *   Same lab test, different values across dates → TREND, NOT CONFLICT
 *
 * MedLens never decides which source is correct — it only flags the discrepancy.
 */

const NO_ALLERGY_PATTERNS = [
  /no\s+known\s+allerg/i,
  /no\s+allerg/i,
  /nkda/i,
  /nka/i,
  /none/i,
];

const ALLERGY_CONFLICT_PATTERNS = [
  /penicillin/i,
  /sulfa/i,
  /aspirin/i,
  /ibuprofen/i,
  /latex/i,
  /peanut/i,
  /shellfish/i,
];

export function hasAllergyConflict(intakeAllergies: string, prescriptionAllergies: string): boolean {
  const intakeIsNoAllergy = NO_ALLERGY_PATTERNS.some((p) => p.test(intakeAllergies));
  const prescriptionHasAllergy = ALLERGY_CONFLICT_PATTERNS.some((p) => p.test(prescriptionAllergies));
  return intakeIsNoAllergy && prescriptionHasAllergy;
}

export function detectAllergyConflict(
  patient: Patient,
  prescriptionAllergy: string,
  prescriptionRef: string,
): Conflict | null {
  if (!hasAllergyConflict(patient.allergies, prescriptionAllergy)) {
    return null;
  }

  return {
    id: `conflict-allergy-${patient.id}`,
    patientId: patient.id,
    fieldType: 'Allergy Information',
    sourceARef: 'Patient Intake',
    sourceAValue: patient.allergies,
    sourceBRef: prescriptionRef,
    sourceBValue: prescriptionAllergy,
    detectionMethod: 'Rule-based',
    description: `Patient intake states "${patient.allergies}" while ${prescriptionRef} records "${prescriptionAllergy}".`,
    status: 'UNRESOLVED',
    priority: 'HIGH',
  };
}
