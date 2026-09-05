import { useEffect, useState } from 'react';
import { Check, Loader2, AlertTriangle, ArrowRight, X, FileText } from 'lucide-react';

export interface PipelineStep {
  label: string;
  status: 'pending' | 'active' | 'done' | 'warning';
}

export interface PipelineResult {
  findingsExtracted: number;
  outsideRange: number;
  conflictsDetected: number;
  needsVerification: number;
}

interface ProcessingPipelineProps {
  open: boolean;
  filename: string;
  onClose: () => void;
  onComplete: () => void;
}

const STEP_LABELS = [
  'Uploading',
  'Text Extraction',
  'Finding Detection',
  'Normalization',
  'Reference Validation',
  'Evidence Linking',
  'Conflict Detection',
  'Human Review',
];

const STEP_INTERVAL = 600;

export function ProcessingPipeline({ open, filename, onClose, onComplete }: ProcessingPipelineProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setCompleted(false);
      setResult(null);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEP_LABELS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i + 1);
          if (i === STEP_LABELS.length - 1) {
            setTimeout(() => {
              setCompleted(true);
              setResult({
                findingsExtracted: 12,
                outsideRange: 3,
                conflictsDetected: 1,
                needsVerification: 2,
              });
            }, 400);
          }
        }, (i + 1) * STEP_INTERVAL),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [open]);

  if (!open) return null;

  const steps: PipelineStep[] = STEP_LABELS.map((label, i) => {
    if (completed) {
      if (i === 6) return { label, status: 'warning' as const };
      if (i === 7) return { label, status: 'pending' as const };
      return { label, status: 'done' as const };
    }
    if (i < currentStep) return { label, status: 'done' as const };
    if (i === currentStep) return { label, status: 'active' as const };
    return { label, status: 'pending' as const };
  });

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={completed ? onClose : undefined} aria-hidden="true" />
      <div className="relative bg-white border border-line rounded-container max-w-md w-full p-5 animate-slide-up" role="dialog" aria-label="Processing report">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-semibold text-ink">Processing Report</h3>
          </div>
          {completed && (
            <button onClick={onClose} className="p-1 rounded text-ink-faint hover:text-ink" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs text-ink-muted mb-4 truncate">{filename}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-5">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${completed ? 100 : (currentStep / STEP_LABELS.length) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-1.5 mb-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2.5 text-sm">
              {step.status === 'done' && (
                <Check className="w-3.5 h-3.5 text-status-verified shrink-0" />
              )}
              {step.status === 'active' && (
                <Loader2 className="w-3.5 h-3.5 text-brand shrink-0 animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
              )}
              {step.status === 'warning' && (
                <AlertTriangle className="w-3.5 h-3.5 text-status-review shrink-0" />
              )}
              <span className={
                step.status === 'done' ? 'text-ink-muted' :
                step.status === 'active' ? 'text-ink font-medium' :
                step.status === 'warning' ? 'text-status-review font-medium' :
                'text-ink-faint'
              }>
                {step.label}
              </span>
              {step.status === 'active' && (
                <span className="ml-auto text-xs text-brand">Processing…</span>
              )}
              {step.status === 'warning' && i === 6 && (
                <span className="ml-auto text-xs text-status-review">1 conflict found</span>
              )}
              {i === 7 && step.status === 'pending' && (
                <ArrowRight className="w-3 h-3 text-ink-faint ml-auto" />
              )}
            </div>
          ))}
        </div>

        {/* Result summary */}
        {completed && result && (
          <div className="border-t border-line pt-4 animate-fade-in">
            <h4 className="text-xs font-semibold text-ink uppercase tracking-wide mb-3">Extraction Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <ResultStat label="Findings extracted" value={result.findingsExtracted} />
              <ResultStat label="Outside ref range" value={result.outsideRange} tone="warning" />
              <ResultStat label="Conflicts detected" value={result.conflictsDetected} tone="danger" />
              <ResultStat label="Need verification" value={result.needsVerification} tone="warning" />
            </div>
            <button
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="btn-primary w-full mt-4"
            >
              View Findings
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultStat({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'danger' }) {
  const color = tone === 'danger' ? 'text-status-high' : tone === 'warning' ? 'text-status-review' : 'text-ink';
  return (
    <div className="bg-gray-50 border border-line rounded-control px-3 py-2">
      <p className={`text-lg font-bold ${color} leading-none`}>{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}
