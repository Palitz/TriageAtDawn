import axios from 'axios';
const API_URL = 'https://triage-backend-api.onrender.com';

export const submitTriage = async (formData: any) => {
  const response = await axios.post(`${API_URL}/triage`, formData);
  return response.data;
};

export const getDoctorQueue = async (doctorId: number) => {
  const response = await axios.get(`${API_URL}/doctor/queue`, {
    params: { doctorId }
  });
  return response.data;
};