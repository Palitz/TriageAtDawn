import { useState } from 'react';
import { submitTriage } from '../services/api';
import { Activity, Ambulance, CheckCircle, AlertTriangle } from 'lucide-react';

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
      setError('Failed to submit triage. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Activity className="text-blue-600" /> Patient Intake Form
      </h2>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Full Name" required className="p-3 border rounded w-full" onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" required className="p-3 border rounded w-full" onChange={handleChange} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <input name="age" type="number" placeholder="Age" required className="p-3 border rounded w-full" onChange={handleChange} />
            <input name="weight" type="number" placeholder="Weight (kg)" required className="p-3 border rounded w-full" onChange={handleChange} />
            <input name="height" type="number" placeholder="Height (cm)" required className="p-3 border rounded w-full" onChange={handleChange} />
          </div>

          <textarea name="history" placeholder="Medical History (e.g., Diabetes, None)" className="p-3 border rounded w-full h-24" onChange={handleChange} />
          
          <textarea name="symptoms" placeholder="Current Symptoms (e.g., severe chest pain, fracture)" required className="p-3 border border-red-200 rounded w-full h-24 bg-red-50" onChange={handleChange} />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Submit for Triage'}
          </button>
        </form>
      ) : (
        <div className="animate-fade-in">
          <div className={`p-6 rounded-lg text-center ${result.severityLevel >= 4 ? 'bg-red-100 border-red-400' : 'bg-green-100 border-green-400'} border-2`}>
            {result.severityLevel >= 4 ? <AlertTriangle className="w-16 h-16 mx-auto text-red-600 mb-4" /> : <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />}
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.message}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-left mt-6">
              <div className="bg-white p-3 rounded shadow-sm">
                <span className="text-xs text-gray-500 uppercase font-bold">Severity Score</span>
                <p className="text-xl font-bold">{result.severityLevel} / 5</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <span className="text-xs text-gray-500 uppercase font-bold">Assigned Dept</span>
                <p className="text-xl font-bold text-blue-600">{result.specialization}</p>
              </div>
            </div>

            {result.ambulance && result.ambulance !== "Not needed" && (
              <div className="mt-4 bg-red-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                <Ambulance /> {result.ambulance}
              </div>
            )}

            <button onClick={() => setResult(null)} className="mt-6 text-blue-600 underline hover:text-blue-800">
              Process New Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}