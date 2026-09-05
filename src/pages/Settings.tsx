import { Settings as SettingsIcon, Bell, Lock, Sparkles, History, Check } from 'lucide-react';
import { useData } from '@/store/DataContext';

export function Settings() {
  const { edits } = useData();

  const settings = [
    { label: 'AI Model', value: 'Claude 4 Sonnet', section: 'AI Processing' },
    { label: 'Provenance Tracking', value: 'Enabled', section: 'AI Processing', enabled: true },
    { label: 'Human Verification', value: 'Enabled', section: 'AI Processing', enabled: true },
    { label: 'Reference Range Protection', value: 'Enabled', section: 'AI Processing', enabled: true },
  ];

  return (
    <div className="max-w-[900px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-ink-muted mt-0.5">Configure application behavior, notifications, and data privacy preferences.</p>
      </div>

      {/* Application */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-ink-muted" />
          <h3 className="section-title">Application</h3>
        </div>
        <div className="p-5 space-y-3">
          <SettingRow label="Theme" value="Clinical (Light)" />
          <SettingRow label="Language" value="English" />
          <SettingRow label="Timezone" value="UTC" />
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <Bell className="w-4 h-4 text-ink-muted" />
          <h3 className="section-title">Notifications</h3>
        </div>
        <div className="p-5 space-y-3">
          <ToggleRow label="New conflict alerts" enabled />
          <ToggleRow label="Verification queue updates" enabled />
          <ToggleRow label="Report processing complete" enabled />
          <ToggleRow label="Email notifications" enabled={false} />
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <Lock className="w-4 h-4 text-ink-muted" />
          <h3 className="section-title">Data & Privacy</h3>
        </div>
        <div className="p-5 space-y-3">
          <ToggleRow label="Encrypt patient data at rest" enabled />
          <ToggleRow label="Auto-redact PII in exports" enabled />
          <ToggleRow label="Share usage analytics" enabled={false} />
          <SettingRow label="Data retention period" value="7 years" />
        </div>
      </div>

      {/* AI Processing */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ink-muted" />
          <h3 className="section-title">AI Processing</h3>
        </div>
        <div className="p-5 space-y-3">
          <SettingRow label="AI Model" value="Claude 4 Sonnet" />
          <ToggleRow label="Provenance tracking" enabled />
          <ToggleRow label="Human verification required" enabled />
          <ToggleRow label="Reference range protection" enabled />
          <ToggleRow label="Auto-normalize test names" enabled />
        </div>
      </div>

      {/* Audit History */}
      <div className="card">
        <div className="px-5 py-3 border-b border-line flex items-center gap-2">
          <History className="w-4 h-4 text-ink-muted" />
          <h3 className="section-title">Audit History</h3>
        </div>
        <div className="p-5">
          {edits.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">No audit entries recorded.</p>
          ) : (
            <div className="space-y-2">
              {edits.map((edit) => (
                <div key={edit.id} className="flex items-center justify-between bg-gray-50 border border-line rounded-control px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-status-verified shrink-0" />
                    <span className="text-sm text-ink">
                      <span className="font-medium">{edit.field}</span>: {edit.oldValue} → {edit.newValue}
                    </span>
                  </div>
                  <div className="text-xs text-ink-faint text-right">
                    <p>{edit.editedBy}</p>
                    <p>{new Date(edit.timestamp).toLocaleDateString()} {new Date(edit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm text-ink font-medium">{value}</span>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${enabled ? 'text-status-verified' : 'text-ink-faint'}`}>
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
        <div className={`w-9 h-5 rounded-full transition-colors relative ${enabled ? 'bg-brand' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
      </div>
    </div>
  );
}
