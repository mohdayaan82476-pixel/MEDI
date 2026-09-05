import type {
  Finding,
  FindingStatus,
} from '@/types';

/**
 * Deterministic reference-range validation engine.
 * Never invents reference ranges — always uses the range supplied in the report.
 *
 * Rules:
 *   value < low        → LOW
 *   value > high       → HIGH
 *   low <= value <= high → NORMAL
 *   value or range missing → UNKNOWN
 */
export function validateFinding(
  value: number | null,
  referenceLow: number | null,
  referenceHigh: number | null,
): FindingStatus {
  if (value === null || referenceLow === null || referenceHigh === null) {
    return 'UNKNOWN';
  }
  if (value < referenceLow) return 'LOW';
  if (value > referenceHigh) return 'HIGH';
  return 'NORMAL';
}

export function validateAllFindings(findings: Finding[]): Finding[] {
  return findings.map((f) => ({
    ...f,
    status: validateFinding(f.value, f.referenceLow, f.referenceHigh),
  }));
}
