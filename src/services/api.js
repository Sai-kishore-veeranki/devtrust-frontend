import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export async function fetchLatestIncidents() {
  const response = await axios.get(`${API_BASE}/incidents`);
  return response.data;
}