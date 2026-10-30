// lib/api.ts - SIMPLE, no auto-redirect

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function apiPost(endpoint: string, data: any) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    const error: any = new Error(result.message || 'Request failed')
    error.status = response.status
    error.response = result  // Direct result object
    throw error
  }

  return result
}

export async function apiGet(endpoint: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  })

  const result = await response.json()

  if (!response.ok) {
    const error: any = new Error(result.message || 'Request failed')
    error.status = response.status
    error.response = result  // Direct result object
    throw error
  }

  return result
}

export async function fetchPlans() {
  return apiGet('/plans')
}