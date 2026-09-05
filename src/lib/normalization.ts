/**
 * Deterministic normalization of common lab-test aliases.
 * Keeps the original test name AND the normalized name.
 * Never normalizes ambiguous terms.
 */
const ALIAS_MAP: Record<string, string> = {
  HGB: 'Hemoglobin',
  HGBS: 'Hemoglobin',
  HB: 'Hemoglobin',
  HEMOGLOBIN: 'Hemoglobin',
  WBC: 'White Blood Cell Count',
  WBCC: 'White Blood Cell Count',
  WHITE_BLOOD_CELL_COUNT: 'White Blood Cell Count',
  PLT: 'Platelets',
  PLATELETS: 'Platelets',
  PLATELET_COUNT: 'Platelets',
  GLU: 'Glucose',
  BLOOD_GLUCOSE: 'Glucose',
  FASTING_GLUCOSE: 'Glucose',
  FBG: 'Glucose',
  CHOL: 'Total Cholesterol',
  TOTAL_CHOLESTEROL: 'Total Cholesterol',
  TC: 'Total Cholesterol',
  LDL: 'LDL Cholesterol',
  HDL: 'HDL Cholesterol',
  TRIG: 'Triglycerides',
  TRIGLYCERIDES: 'Triglycerides',
  CREAT: 'Creatinine',
  CREATININE: 'Creatinine',
  ALT: 'ALT',
  SGPT: 'ALT',
  AST: 'AST',
  SGOT: 'AST',
  TSH: 'Thyroid Stimulating Hormone',
  RBC: 'Red Blood Cell Count',
  HCT: 'Hematocrit',
  MCV: 'Mean Corpuscular Volume',
  MCH: 'Mean Corpuscular Hemoglobin',
  MCHC: 'Mean Corpuscular Hemoglobin Concentration',
};

export function normalizeTestName(rawName: string): string {
  const key = rawName.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
  return ALIAS_MAP[key] ?? rawName;
}
