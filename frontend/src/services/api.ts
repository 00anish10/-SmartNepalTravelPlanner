import type { Destination, PreferenceInput, ItineraryResult, SafetyReport, BudgetResult } from '../types';

const API_BASE = '/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...options,
  });
  if (res.status === 401) {
    handleLogout();
    throw new Error('Session expired. Please login again.');
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getDestinations(cluster?: string): Promise<Destination[]> {
  const qs = cluster ? `?cluster=${encodeURIComponent(cluster)}` : '';
  return fetchJSON<Destination[]>(`/destinations${qs}`);
}

export async function getDestination(name: string): Promise<Destination> {
  return fetchJSON<Destination>(`/destinations/${encodeURIComponent(name)}`);
}

export async function getRecommendations(prefs: PreferenceInput) {
  return fetchJSON<{ session_id: string; destinations: Destination[]; warnings: string[] }>(
    '/recommendations/recommend',
    { method: 'POST', body: JSON.stringify(prefs) }
  );
}

export async function generateItinerary(params: {
  destination_name: string;
  duration: number;
  budget: number;
  fitness_level: string;
  starting_city: string;
  accommodation_type?: string;
}): Promise<ItineraryResult> {
  return fetchJSON<ItineraryResult>('/itineraries/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function getSafetyReport(destinationName: string): Promise<SafetyReport> {
  return fetchJSON<SafetyReport>(`/safety/report/${encodeURIComponent(destinationName)}`);
}

export async function getBudgetEstimate(
  destinationName: string,
  duration: number,
  accommodationType: string = 'mid',
  guidePorter: boolean = false
): Promise<BudgetResult> {
  const qs = `?duration=${duration}&accommodation_type=${accommodationType}&guide_porter_required=${guidePorter}`;
  return fetchJSON<BudgetResult>(`/budgets/estimate/${encodeURIComponent(destinationName)}${qs}`);
}

export async function elicitPreferences(prefs: PreferenceInput) {
  return fetchJSON<{ session_id: string; summary: string; next_step: string }>(
    '/preferences/elicit',
    { method: 'POST', body: JSON.stringify(prefs) }
  );
}

// Auth API
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  return fetchJSON<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function registerUser(username: string, email: string, password: string): Promise<{ message: string; user: AuthUser }> {
  return fetchJSON<{ message: string; user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function getMe(): Promise<AuthUser> {
  return fetchJSON<AuthUser>('/auth/me');
}

// Admin API
export async function adminGetDestinations(): Promise<Destination[]> {
  return fetchJSON<Destination[]>('/admin/destinations');
}

export async function adminCreateDestination(data: Partial<Destination>): Promise<Destination> {
  return fetchJSON<Destination>('/admin/destinations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteDestination(id: number): Promise<void> {
  await fetchJSON<void>(`/admin/destinations/${id}`, { method: 'DELETE' });
}
