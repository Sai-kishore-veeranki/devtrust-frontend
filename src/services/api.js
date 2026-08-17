import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export async function fetchLatestIncidents() {
  const response = await axios.get(`${API_BASE}/incidents`);
  return response.data;
}

export async function fetchDoraMetrics(days) {
  const response = await axios.get(`${API_BASE}/dora`, { params: { days } });
  return response.data;
}

export async function fetchServiceGraph() {
  const response = await axios.get(`${API_BASE}/graph`);
  return response.data;
}
