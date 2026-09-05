import { FileText, Pill, User, Sparkles, BadgeCheck } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import type { Provenance, DocumentType } from '@/types';

const provenanceConfig: Record<Provenance, { color: string; Icon: typeof User }> = {
  USER_PROVIDED: { color: 'bg-blue-500', Icon: User },
  AI_EXTRACTED: { color: 'bg-brand', Icon: FileText },
  AI_GENERATED: { color: 'bg-amber-500', Icon: Sparkles },
  HUMAN_VERIFIED: { color: 'bg-status-verified', Icon: BadgeCheck },
};

const docTypeConfig: Record<DocumentType, { label: string; Icon: typeof FileText }> = {
  LAB_REPORT: { label: 'Lab Report', Icon: FileText },
  PRESCRIPTION: { label: 'Prescription', Icon: Pill },
  INTAKE: { label: 'Patient Intake', Icon: User },
  IMAGING: { label: 'Imaging', Icon: FileText },
  CLINICAL_NOTE: { label: 'Clinical Note', Icon: FileText },
};

export function Timeline() {
  const { timeline, patient } = useData();

  const sortedTimeline = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-[1200px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Patient Timeline</h1>
        <p className="text-sm text-ink-muted mt-0.5">Longitudinal view of all records and findings for {patient.name}. Each entry is labeled with its provenance.</p>
      </div>

      {/* Legend */}
      <div className="card px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(provenanceConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
              <span className="text-xs text-ink-muted">
                {key === 'USER_PROVIDED' ? 'User Provided' : key === 'AI_EXTRACTED' ? 'AI Extracted' : key === 'AI_GENERATED' ? 'AI Generated' : 'Human Verified'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="relative">
          {sortedTimeline.map((event, idx) => {
            const provConfig = provenanceConfig[event.provenance];
            const typeConfig = docTypeConfig[event.documentType];
            const Icon = typeConfig.Icon;
            const ProvIcon = provConfig.Icon;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Vertical line + dot */}
                <div className="flex flex-col items-center shrink-0 ml-5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${provConfig.color} text-white z-10`}>
                    <ProvIcon className="w-4 h-4" />
                  </div>
                  {idx < sortedTimeline.length - 1 && (
                    <div className="w-px flex-1 bg-line mt-1" style={{ minHeight: '40px' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-ink-faint" />
                    <span className="text-sm font-semibold text-ink">{event.date}</span>
                    <span className="text-sm text-ink-muted">·</span>
                    <span className="text-sm text-ink-muted">{typeConfig.label}</span>
                  </div>

                  <div className="card p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-ink">{event.title}</h4>
                      <ProvenanceTag source={event.provenance} compact />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {event.findings.map((finding, i) => (
                        <div key={i} className="bg-gray-50 border border-line rounded-control px-3 py-2">
                          <p className="text-xs font-medium text-ink">{finding.name}</p>
                          <p className="text-sm text-ink-muted mt-0.5">
                            {finding.value} {finding.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
