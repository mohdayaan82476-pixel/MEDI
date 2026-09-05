import { ArrowDown, ArrowUp, Check, AlertTriangle, HelpCircle, Minus } from 'lucide-react';
import type { FindingStatus, VerificationStatus, ConflictStatus, ExtractionStatus } from '@/types';

interface StatusBadgeProps {
  status: FindingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<FindingStatus, { label: string; classes: string; Icon: typeof ArrowDown }> = {
    LOW: { label: 'LOW', classes: 'bg-status-lowBg text-status-low border-status-lowBorder', Icon: ArrowDown },
    HIGH: { label: 'HIGH', classes: 'bg-status-highBg text-status-high border-status-highBorder', Icon: ArrowUp },
    NORMAL: { label: 'NORMAL', classes: 'bg-status-normalBg text-status-normal border-status-normalBorder', Icon: Check },
    UNKNOWN: { label: 'UNKNOWN', classes: 'bg-status-unknownBg text-status-unknown border-status-unknownBorder', Icon: HelpCircle },
  };

  const { label, classes, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xxs font-semibold rounded border ${classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}

interface VerificationBadgeProps {
  status: VerificationStatus;
}

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const config: Record<VerificationStatus, { label: string; classes: string; Icon: typeof Check }> = {
    VERIFIED: { label: 'Verified', classes: 'bg-status-verifiedBg text-status-verified border-status-verifiedBorder', Icon: Check },
    NEEDS_REVIEW: { label: 'Needs Review', classes: 'bg-status-reviewBg text-status-review border-status-reviewBorder', Icon: AlertTriangle },
    FLAGGED: { label: 'Flagged', classes: 'bg-status-highBg text-status-high border-status-highBorder', Icon: AlertTriangle },
    REJECTED: { label: 'Rejected', classes: 'bg-gray-100 text-gray-500 border-gray-300', Icon: Minus },
  };

  const { label, classes, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xxs font-semibold rounded border ${classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}

interface ConflictStatusBadgeProps {
  status: ConflictStatus;
}

export function ConflictStatusBadge({ status }: ConflictStatusBadgeProps) {
  const config: Record<ConflictStatus, { label: string; classes: string; Icon: typeof AlertTriangle }> = {
    UNRESOLVED: { label: 'Unresolved', classes: 'bg-status-highBg text-status-high border-status-highBorder', Icon: AlertTriangle },
    ACKNOWLEDGED: { label: 'Acknowledged', classes: 'bg-status-verifiedBg text-status-verified border-status-verifiedBorder', Icon: Check },
    DISMISSED: { label: 'Dismissed', classes: 'bg-gray-100 text-gray-500 border-gray-300', Icon: Minus },
  };

  const { label, classes, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xxs font-semibold rounded border ${classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}

interface ExtractionBadgeProps {
  status: ExtractionStatus;
}

export function ExtractionBadge({ status }: ExtractionBadgeProps) {
  const config: Record<ExtractionStatus, { label: string; classes: string; Icon: typeof Check }> = {
    PROCESSING: { label: 'Processing', classes: 'bg-blue-50 text-blue-600 border-blue-200', Icon: AlertTriangle },
    EXTRACTED: { label: 'Extracted', classes: 'bg-status-verifiedBg text-status-verified border-status-verifiedBorder', Icon: Check },
    NEEDS_REVIEW: { label: 'Needs Review', classes: 'bg-status-reviewBg text-status-review border-status-reviewBorder', Icon: AlertTriangle },
    VERIFIED: { label: 'Verified', classes: 'bg-status-verifiedBg text-status-verified border-status-verifiedBorder', Icon: Check },
  };

  const { label, classes, Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xxs font-semibold rounded border ${classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {label}
    </span>
  );
}
