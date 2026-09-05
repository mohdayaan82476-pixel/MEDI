import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User } from 'lucide-react';
import { useData } from '@/store/DataContext';
import { ProvenanceTag } from '@/components/ProvenanceTag';
import type { Provenance } from '@/types';

export function PatientIntake() {
  const { patient, updatePatient, addToast } = useData();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: patient.name,
    age: patient.age.toString(),
    sex: patient.sex,
    symptoms: patient.symptoms,
    conditions: patient.conditions,
    allergies: patient.allergies,
    medications: patient.medications,
    notes: patient.notes,
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updatePatient({
      name: form.name,
      age: parseInt(form.age) || 0,
      sex: form.sex as 'Male' | 'Female' | 'Other',
      symptoms: form.symptoms,
      conditions: form.conditions,
      allergies: form.allergies,
      medications: form.medications,
      notes: form.notes,
    });
    addToast('Patient record saved successfully.', 'success');
    navigate('/patient');
  };

  return (
    <div className="max-w-[1100px] space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-ink">Patient Intake</h1>
        <p className="text-sm text-ink-muted mt-0.5">Enter patient information. All fields are labeled with their source of origin.</p>
      </div>

      <div className="card">
        {/* Patient identification */}
        <div className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-semibold text-ink">Patient Identification</h3>
            <ProvenanceTag source="USER_PROVIDED" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-text" htmlFor="name">Name / Identifier</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                value={form.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="sex">Sex</label>
              <select
                id="sex"
                value={form.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical information */}
        <div className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-ink">Clinical Information</h3>
            <ProvenanceTag source="USER_PROVIDED" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-text" htmlFor="symptoms">Symptoms / Concerns</label>
              <textarea
                id="symptoms"
                value={form.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="conditions">Conditions</label>
              <textarea
                id="conditions"
                value={form.conditions}
                onChange={(e) => handleChange('conditions', e.target.value)}
                rows={3}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                value={form.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="medications">Medications</label>
              <textarea
                id="medications"
                value={form.medications}
                onChange={(e) => handleChange('medications', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Additional notes */}
        <div className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-ink">Additional Notes</h3>
            <ProvenanceTag source="USER_PROVIDED" />
          </div>
          <div>
            <label className="label-text" htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ProvenanceTag source="USER_PROVIDED" />
            <span className="text-xs text-ink-faint">All information above is recorded as user-provided.</span>
          </div>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Patient Record
          </button>
        </div>
      </div>
    </div>
  );
}
