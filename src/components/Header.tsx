import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { useMemo } from 'react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/intake': 'Patient Intake',
  '/patient': 'Patient Record',
  '/reports': 'Medical Reports',
  '/timeline': 'Timeline',
  '/comparison': 'Report Comparison',
  '/conflicts': 'Conflicts & Inconsistencies',
  '/verification': 'Human Verification',
  '/evidence': 'Evidence & Sources',
  '/summary': 'AI Record Summary',
  '/settings': 'Settings',
};

export function Header() {
  const { pathname } = useLocation();
  const { conflicts, findings } = useData();

  const title = useMemo(() => {
    if (pathname.startsWith('/reports/')) return 'Report Detail';
    return pageTitles[pathname] ?? 'MedLens';
  }, [pathname]);

  const unresolvedConflicts = conflicts.filter((c) => c.status === 'UNRESOLVED').length;
  const needsReview = findings.filter((f) => f.verificationStatus === 'NEEDS_REVIEW').length;
  const notificationCount = unresolvedConflicts + needsReview;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line h-14 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search patients, findings, reports…"
            className="w-64 pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-line rounded-control text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 focus:bg-white transition-colors"
            aria-label="Search"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-control text-ink-muted hover:bg-gray-100 hover:text-ink transition-colors"
          aria-label={`Notifications (${notificationCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-status-high text-white text-xxs font-bold rounded-full flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-line">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold">
            SC
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-ink leading-none">Dr. Sarah Chen</p>
            <p className="text-xxs text-ink-muted mt-0.5">Clinical Reviewer</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-ink-faint hidden md:block" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
