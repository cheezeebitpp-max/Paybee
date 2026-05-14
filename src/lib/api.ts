const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function apiFetch(endpoint: string, options: any = {}) {
  const token = localStorage.getItem('paybee_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('paybee_token');
    localStorage.removeItem('paybee_user');
    window.location.href = '/login';
    return null;
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'API Error');
  return data;
}
