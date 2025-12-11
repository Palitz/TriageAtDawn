import { useState, useEffect } from 'react';
import { getDoctorQueue } from '../services/api';
import { Stethoscope, Clock, AlertCircle, User, Activity } from 'lucide-react';

const DOCTORS = [
  { id: 1, name: 'Dr. Bones', spec: 'Orthopedics' }, 
  { id: 2, name: 'Dr. Hart', spec: 'Cardiology' },   
  { id: 3, name: 'Dr. Cure', spec: 'Oncology' },
];

export default function DoctorDashboard() {
  const [selectedDoc, setSelectedDoc] = useState(DOCTORS[1].id); 
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueue = async (docId: number) => {
    setLoading(true);
    try {
      const data = await getDoctorQueue(docId);
      setQueue(data);
    } catch (err) {
      console.error("Failed to fetch queue", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(selectedDoc);
    const interval = setInterval(() => fetchQueue(selectedDoc), 2000); 
    return () => clearInterval(interval);
  }, [selectedDoc]);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="bg-medical-100 p-2 rounded-lg text-medical-600">
              <Activity size={32} />
            </div>
            Live Priority Queue
          </h2>
          <p className="text-slate-500 mt-1">Real-time Patient Sorting</p>
        </div>

        {/* Doctor Switcher */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex overflow-hidden">
          {DOCTORS.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDoc(doc.id)}
              className={`px-4 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
                selectedDoc === doc.id 
                  ? 'bg-medical-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <User size={16} />
              <div className="text-left leading-tight">
                <div className="block">{doc.name}</div>
                <div className="text-[10px] opacity-80 font-normal">{doc.spec}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden min-h-[400px]">
        {loading && queue.length === 0 ? (
          <div className="p-20 text-center text-slate-400">Loading...</div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-400">
            <Stethoscope size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium">Queue Empty</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
             <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Patient</div>
                <div className="col-span-3">Condition</div>
                <div className="col-span-2">Wait Time</div>
                <div className="col-span-2 text-right">Score</div>
             </div>

            {queue.map((patient, index) => (
              <div key={patient.id} className={`grid grid-cols-12 gap-4 px-6 py-5 items-center ${index === 0 ? 'bg-blue-50/50' : ''}`}>
                
                {/* RANKING # */}
                <div className="col-span-1">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                    index === 0 ? 'bg-medical-600 text-white shadow-lg' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {index + 1}
                  </span>
                </div>

                <div className="col-span-4">
                  <h4 className="font-bold text-slate-800 text-lg">{patient.name}</h4>
                  {index === 0 && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">CURRENTLY SERVING</span>}
                </div>

                <div className="col-span-3">
                   <div className="flex items-center gap-2 mb-1">
                      {patient.severity_level >= 4 && <AlertCircle size={16} className="text-red-500 fill-red-100" />}
                      <span className={`text-sm font-bold ${patient.severity_level >= 4 ? 'text-red-600' : 'text-slate-600'}`}>
                        Sev: {patient.severity_level}/5
                      </span>
                   </div>
                   <p className="text-xs text-slate-500 truncate">{patient.symptoms}</p>
                </div>

                <div className="col-span-2 flex items-center gap-2 text-slate-500 text-sm font-medium">
                   <Clock size={16} />
                   {Math.round(patient.hours_waiting * 60)} min
                </div>

                <div className="col-span-2 text-right">
                   <span className="block text-2xl font-black text-slate-800 tracking-tight">
                     {Math.round(patient.priority_score)}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}