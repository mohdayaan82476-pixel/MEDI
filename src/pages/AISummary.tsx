import { AlertTriangle, FileText, HelpCircle, Sparkles, Shield } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { ProvenanceTag } from '@/components/ProvenanceTag';

export function AISummary() {
  const { summary, clarifications, patient, conflicts, findings } = useData();

  const unresolvedConflicts = conflicts.filter((c) => c.status === 'UNRESOLVED');
  const needsReview = findings.filter((f) => f.verificationStatus === 'NEEDS_REVIEW');

  return (
    <div className="max-w-[1000px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">AI Record Summary</h1>
        <p className="text-sm text-ink-muted mt-0.5">A patient-friendly explanation based on structured and verified information. This is not a diagnosis.</p>
      </div>

      {/* Summary card */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="section-title">Record Summary</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-faint">{summary.modelVersion}</span>
            <ProvenanceTag source="AI_GENERATED" compact />
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm text-ink-muted italic mb-4">Based on the structured and verified information currently available…</p>
          <p className="text-sm text-ink leading-relaxed">{summary.text}</p>
        </div>
      </div>

      {/* Items to review */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-status-review" />
            <h3 className="section-title">Items to Review</h3>
          </div>
        </div>
        <div className="divide-y divide-line">
          {unresolvedConflicts.length > 0 && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-status-high mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-ink">
                    Allergy information differs between the patient intake and prescription.
                  </p>
                  <p className="text-xs text-ink-faint mt-1">
                    Intake: "{unresolvedConflicts[0].sourceAValue}" vs. Prescription: "{unresolvedConflicts[0].sourceBValue}"
                  </p>
                </div>
              </div>
            </div>
          )}
          {needsReview.length > 0 && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-status-review mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-ink">
                    Some extracted findings still require human verification.
                  </p>
                  <p className="text-xs text-ink-faint mt-1">
                    {needsReview.map((f) => f.normalizedName).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clarification questions */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand" />
            <h3 className="section-title">Clarification Needed</h3>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {clarifications.map((q, idx) => (
            <div key={q.id} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm text-ink">{q.question}</p>
                <p className="text-xs text-ink-faint mt-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Evidence: {q.evidence}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card border-status-reviewBorder bg-status-reviewBg/30">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-status-review shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-ink mb-1">Important Disclaimer</h4>
              <p className="text-sm text-ink-muted leading-relaxed">
                This summary organizes information from the supplied records. It is not a diagnosis or treatment recommendation. Please discuss medical concerns with a qualified healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient context */}
      <div className="card px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">Patient:</span>
            <span className="text-sm font-medium text-ink">{patient.name}</span>
          </div>
          <span className="text-xs text-ink-faint">Generated: {new Date(summary.generatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
