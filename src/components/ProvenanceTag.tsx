import { User, FileText, Sparkles, BadgeCheck } from 'lucide-react';
import type { Provenance } from '@/types';

interface ProvenanceTagProps {
  source: Provenance;
  compact?: boolean;
}

export function ProvenanceTag({ source, compact = false }: ProvenanceTagProps) {
  const config: Record<Provenance, { label: string; classes: string; Icon: typeof User }> = {
    USER_PROVIDED: { label: 'User Provided', classes: 'bg-blue-50 text-blue-700 border-blue-200', Icon: User },
    AI_EXTRACTED: { label: 'AI Extracted', classes: 'bg-brand-50 text-brand-600 border-brand-100', Icon: FileText },
    AI_GENERATED: { label: 'AI Generated', classes: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Sparkles },
    HUMAN_VERIFIED: { label: 'Human Verified', classes: 'bg-status-verifiedBg text-status-verified border-status-verifiedBorder', Icon: BadgeCheck },
  };

  const { label, classes, Icon } = config[source];

  return (
    <span className={`provenance-tag border ${classes}`}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {compact ? label.replace(' ', '\u00A0') : label}
    </span>
  );
}
