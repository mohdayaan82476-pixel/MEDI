import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ToastContainer } from '@/components/Toast';
import { DataProvider } from '@/store/DataContext';
import { Dashboard } from '@/pages/Dashboard';
import { PatientIntake } from '@/pages/PatientIntake';
import { PatientRecord } from '@/pages/PatientRecord';
import { Reports } from '@/pages/Reports';
import { ReportDetail } from '@/pages/ReportDetail';
import { ConflictCenter } from '@/pages/ConflictCenter';
import { VerificationQueue } from '@/pages/VerificationQueue';
import { EvidenceViewer } from '@/pages/EvidenceViewer';
import { Timeline } from '@/pages/Timeline';
import { Comparison } from '@/pages/Comparison';
import { AISummary } from '@/pages/AISummary';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-canvas">
          <Sidebar />
          <div className="ml-[230px] flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/intake" element={<PatientIntake />} />
                <Route path="/patient" element={<PatientRecord />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/conflicts" element={<ConflictCenter />} />
                <Route path="/verification" element={<VerificationQueue />} />
                <Route path="/evidence" element={<EvidenceViewer />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/comparison" element={<Comparison />} />
                <Route path="/summary" element={<AISummary />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
