import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  FileUser,
  FileText,
  Clock,
  GitCompare,
  AlertTriangle,
  CheckSquare,
  FileSearch,
  Settings,
  Microscope,
  Sparkles,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/intake', label: 'Patient Intake', icon: UserPlus },
      { to: '/patient', label: 'Patient Record', icon: FileUser },
      { to: '/reports', label: 'Reports', icon: FileText },
      { to: '/timeline', label: 'Timeline', icon: Clock },
      { to: '/comparison', label: 'Comparison', icon: GitCompare },
    ],
  },
  {
    label: 'Review',
    items: [
      { to: '/conflicts', label: 'Conflicts', icon: AlertTriangle },
      { to: '/verification', label: 'Verification', icon: CheckSquare },
    ],
  },
  {
    label: 'Evidence',
    items: [
      { to: '/evidence', label: 'Sources', icon: FileSearch },
      { to: '/summary', label: 'AI Summary', icon: Sparkles },
    ],
  },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-[230px] bg-sidebar text-white flex flex-col z-30"
      aria-label="Primary navigation"
    >
      {/* Logo / Brand */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-brand rounded-control">
            <Microscope className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">MEDLENS</h1>
            <p className="text-xxs text-white/50 mt-0.5">Clinical Record Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-5 text-xxs font-semibold text-white/30 uppercase tracking-wider mb-1.5">
              {section.label}
            </p>
            <div className="px-2 space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-control text-sm transition-colors ${
                        isActive
                          ? 'bg-brand text-white font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings */}
      <div className="px-2 py-3 border-t border-white/10">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-control text-sm transition-colors ${
              isActive
                ? 'bg-brand text-white font-medium'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
