import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 animate-fade-in" onClick={onCancel} aria-hidden="true" />
      <div
        className="relative bg-white border border-line rounded-container max-w-sm w-full p-5 animate-slide-up"
        role="alertdialog"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-status-reviewBg rounded-control shrink-0">
            <AlertTriangle className="w-5 h-5 text-status-review" aria-hidden="true" />
          </div>
          <div>
            <h3 id="confirm-title" className="text-sm font-semibold text-ink">
              {title}
            </h3>
            <p className="text-sm text-ink-muted mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="btn-primary">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-ink-faint mb-3">{icon}</div>}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted mt-1 max-w-xs">{message}</p>
    </div>
  );
}
