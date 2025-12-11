import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import TriageForm from './components/TriageForm'; 

const DoctorDashboard = () => <div className="p-10 text-center"><h2>Doctor Dashboard (Step 2)</h2></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList /> Triage Pro
            </h1>
            <div className="space-x-4">
              <Link to="/" className="hover:text-blue-200 font-medium">Patient Check-In</Link>
              <Link to="/doctor" className="hover:text-blue-200 font-medium">Doctor View</Link>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto mt-8 px-4">
          <Routes>
            <Route path="/" element={<TriageForm />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;