import axios from 'axios';

// FINAL, CONFIRMED LIVE URL for the Render Backend
// The local '/api' prefix has been removed from the backend, so the base URL is just the domain.
const API_URL = 'https://triageatdawn.onrender.com'; 

export const submitTriage = async (formData: any) => {
  // POST request to the Triage endpoint
  const response = await axios.post(`${API_URL}/triage`, formData);
  return response.data;
};

export const getDoctorQueue = async (doctorId: number) => {
  // GET request to the Priority Queue endpoint
  const response = await axios.get(`${API_URL}/doctor/queue`, {
    params: { doctorId }
  });
  return response.data;
};

// Exporting the base URL in case it's needed for other parts (e.g., image loading, though not used here)
export { API_URL };