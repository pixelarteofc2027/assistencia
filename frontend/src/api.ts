const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function basicAuthHeader(username: string, password: string) {
  const token = window.btoa(`${username}:${password}`);
  return {
    Authorization: `Basic ${token}`,
    'Content-Type': 'application/json'
  };
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Credenciais inválidas');
  }

  const data = await response.json();
  localStorage.setItem('techflow-user', username);
  localStorage.setItem('techflow-password', password);
  return data;
}

export function getStoredCredentials() {
  const username = localStorage.getItem('techflow-user');
  const password = localStorage.getItem('techflow-password');
  return username && password ? { username, password } : null;
}

export function clearStoredCredentials() {
  localStorage.removeItem('techflow-user');
  localStorage.removeItem('techflow-password');
}

export async function getJson<T>(path: string): Promise<T> {
  const credentials = getStoredCredentials();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (credentials) {
    const auth = basicAuthHeader(credentials.username, credentials.password);
    Object.assign(headers, auth);
  }

  const response = await fetch(`${API}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path}`);
  }
  return response.json();
}
