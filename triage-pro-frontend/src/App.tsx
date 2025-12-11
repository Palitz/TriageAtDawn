import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ClipboardList, Activity, Stethoscope } from 'lucide-react';
import TriageForm from './components/TriageForm';
import DoctorDashboard from './components/DoctorDashboard'; // ✅ Imported the real dashboard

// Helper component for Navigation Links with Active State
const NavLink = ({ to, icon: Icon, children }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
        isActive 
          ? 'bg-white text-medical-600 shadow-md font-bold' 
          : 'text-medical-100 hover:bg-medical-500 hover:text-white'
      }`}
    >
      <Icon size={18} />
      {children}
    </Link>
  );
};

// Main Layout Wrapper
const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      {/* Modern Gradient Navbar */}
      <nav className="bg-gradient-to-r from-medical-900 to-medical-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Triage<span className="text-medical-100">Pro</span></h1>
              <p className="text-xs text-medical-100 opacity-80">Smart Hospital Management</p>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex gap-2">
            <NavLink to="/" icon={ClipboardList}>Check-In</NavLink>
            <NavLink to="/doctor" icon={Stethoscope}>Doctor Portal</NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-6 py-8">
        <Routes>
          <Route path="/" element={<TriageForm />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-sm">
        <p>© 2025 TriagePro Health Systems • Secure HIPAA Compliant Environment</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;