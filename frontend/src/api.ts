const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`)
  if (!response.ok) throw new Error(`Falha ao consultar ${path}`)
  return response.json()
}
