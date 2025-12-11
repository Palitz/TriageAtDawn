import { useState } from 'react';
import { submitTriage } from '../services/api';
import { 
  Activity, Ambulance, CheckCircle, AlertTriangle, User, Mail, 
  Ruler, Weight, FileText, HeartPulse, Clock, Users 
} from 'lucide-react';

// Component defined OUTSIDE to prevent focus loss bugs
const InputField = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
      <Icon size={18} />
    </div>
    <input 
      {...props} 
      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all outline-none text-sm font-medium text-slate-700 placeholder-slate-400" 
    />
  </div>
);

export default function TriageForm() {
  const [formData, setFormData] = useState({
    name: '', age: '', weight: '', height: '', email: '',
    history: '', symptoms: ''
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height)
      };
      const data = await submitTriage(payload);
      setResult(data);
    } catch (err) {
      setError('Connection to Triage Server failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Card Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Patient Intake</h2>
            <p className="text-slate-500 text-sm mt-1">AI-Powered Symptom Analysis & Triage</p>
          </div>
          <div className="bg-white p-3 rounded-full shadow-sm">
            <HeartPulse className="text-medical-500" size={28} />
          </div>
        </div>

        <div className="p-8">
          {!result ? (
            // FORM VIEW
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Info Group */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField icon={User} name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange} />
                  <InputField icon={Mail} name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <InputField icon={User} name="age" type="number" placeholder="Age" required value={formData.age} onChange={handleChange} />
                  <InputField icon={Weight} name="weight" type="number" placeholder="Weight (kg)" required value={formData.weight} onChange={handleChange} />
                  <InputField icon={Ruler} name="height" type="number" placeholder="Ht (cm)" required value={formData.height} onChange={handleChange} />
                </div>
              </div>

              {/* Medical Info Group */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medical Information</h3>
                <div className="relative">
                   <div className="absolute top-3 left-3 text-slate-400"><FileText size={18} /></div>
                   <textarea name="history" placeholder="Previous Medical History (e.g. Diabetes, None)" className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg h-20 focus:ring-2 focus:ring-medical-500 outline-none text-sm text-slate-700 resize-none" value={formData.history} onChange={handleChange} />
                </div>
                <div className="relative">
                   <div className="absolute top-3 left-3 text-red-400"><Activity size={18} /></div>
                   <textarea name="symptoms" placeholder="Describe current symptoms (e.g. severe chest pain, fracture)..." required className="w-full pl-10 p-3 bg-red-50 border border-red-100 rounded-lg h-24 focus:ring-2 focus:ring-red-400 outline-none text-sm text-slate-700 placeholder-red-300 resize-none" value={formData.symptoms} onChange={handleChange} />
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-medical-600 to-medical-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:opacity-90 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>Analyze & Check-In <Activity size={18} /></>
                )}
              </button>
            </form>
          ) : (
            // ENHANCED RESULT VIEW (With Transparency)
            <div className="animate-fade-in text-center py-6">
              
              {/* Severity Icon Badge */}
              <div className={`inline-flex p-4 rounded-full mb-4 shadow-lg ${result.severityLevel >= 4 ? 'bg-red-100 text-red-600 ring-4 ring-red-50' : 'bg-green-100 text-green-600 ring-4 ring-green-50'}`}>
                {result.severityLevel >= 4 ? <AlertTriangle size={48} /> : <CheckCircle size={48} />}
              </div>
              
              <h3 className="text-3xl font-bold text-slate-800 mb-1">{result.message}</h3>
              <p className="text-slate-500 mb-8">Triaged successfully based on medical priority.</p>
              
              {/* TRANSPARENCY STATS GRID */}
              <div className="grid grid-cols-2 gap-4 text-left max-w-sm mx-auto mb-6">
                
                {/* 1. Queue Position & Wait Time (New) */}
                <div className="col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 p-4"><Users size={64}/></div>
                  <div>
                    <span className="text-xs text-blue-400 uppercase font-bold tracking-wider flex items-center gap-1"><Users size={12}/> Your Position</span>
                    <div className="text-2xl font-bold text-blue-700">#{result.queueDetails?.position || 1} in line</div>
                  </div>
                  <div className="text-right z-10">
                    <span className="text-xs text-blue-400 uppercase font-bold tracking-wider flex items-center gap-1 justify-end"><Clock size={12}/> Est. Wait</span>
                    <div className="text-xl font-bold text-slate-700">~{result.queueDetails?.estimatedWaitMins || 15} min</div>
                  </div>
                </div>

                {/* 2. Severity Score */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 uppercase font-bold">Severity Score</span>
                  <div className="flex items-end gap-1 mt-1">
                    <span className={`text-3xl font-bold ${result.severityLevel >= 4 ? 'text-red-600' : 'text-slate-700'}`}>{result.severityLevel}</span>
                    <span className="text-slate-400 mb-1">/ 5</span>
                  </div>
                </div>

                {/* 3. Department */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 uppercase font-bold">Department</span>
                  <p className="text-lg font-bold text-medical-600 mt-1 truncate">{result.specialization}</p>
                </div>
              </div>

              {/* AMBULANCE STATUS (With Count) */}
              {result.ambulance && result.ambulance !== "Not needed" ? (
                <div className="mt-4 bg-red-500 text-white p-4 rounded-xl flex flex-col items-center justify-center animate-pulse shadow-lg shadow-red-200 mx-auto max-w-sm">
                  <div className="flex items-center gap-3">
                    <Ambulance size={24} /> 
                    <span className="font-bold text-lg">{result.ambulance}</span>
                  </div>
                  <span className="text-xs text-white/80 mt-1">
                    {result.queueDetails?.availableAmbulances > 0 
                      ? `${result.queueDetails.availableAmbulances} other units currently standby`
                      : "High demand: No other units available"
                    }
                  </span>
                </div>
              ) : (
                 <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 max-w-sm mx-auto flex items-center justify-between text-sm text-slate-500">
                    <span className="flex items-center gap-2"><Ambulance size={16}/> Ambulance Status:</span>
                    <span className="font-medium text-green-600">
                      {result.queueDetails?.availableAmbulances > 0 
                        ? `${result.queueDetails.availableAmbulances} units available` 
                        : "All units busy"}
                    </span>
                 </div>
              )}

              <button onClick={() => setResult(null)} className="mt-8 text-slate-400 hover:text-medical-600 text-sm font-medium transition-colors">
                ← Process Another Patient
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}