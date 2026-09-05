import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useData } from '@/store/DataContext';

export function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
        const iconColor =
          toast.type === 'success'
            ? 'text-status-verified'
            : toast.type === 'error'
              ? 'text-status-high'
              : 'text-blue-500';

        return (
          <div
            key={toast.id}
            className="flex items-start gap-2.5 bg-white border border-line rounded-control px-4 py-3 shadow-sm animate-slide-up"
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
            <p className="text-sm text-ink flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded text-ink-faint hover:text-ink transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
