export interface Destination {
  id: number;
  name: string;
  cluster: string;
  alt_name?: string;
  region?: string;
  altitude_min?: number;
  altitude_max?: number;
  terrain?: string;
  duration_min?: number;
  duration_max?: number;
  cost_per_day_npr?: number;
  cost_per_day_usd?: number;
  difficulty?: string;
  best_seasons?: string[];
  activities?: string[];
  permits?: string[];
  description?: string;
  highlights?: string[];
  image_url?: string;
  requires_guide?: boolean;
  ams_risk?: string;
  fitness_level?: string;
  match_score?: number;
  similarity_explanation?: string;
  difficulty_explanation?: string;
}

export interface PreferenceInput {
  session_id?: string;
  budget: number;
  budget_currency: string;
  duration: number;
  travel_dates?: string;
  season: string;
  interests: string[];
  fitness_level: string;
  travel_type: string;
  nationality: string;
  starting_city: string;
  accommodation_type: string;
}

export interface ItineraryDay {
  day: number;
  location: string;
  activity: string;
  altitude: number;
  altitude_gain: number;
  est_cost_usd: number;
  est_cost_npr: number;
  notes: string;
  accommodation?: string;
  meals?: string;
}

export interface ItineraryResult {
  session_id: string;
  destination_name: string;
  days: ItineraryDay[];
  total_cost: number;
  total_cost_npr: number;
  emergency_buffer: number;
  emergency_buffer_npr: number;
  grand_total: number;
  grand_total_npr: number;
  warnings?: string[];
}

export interface SafetyReport {
  destination_name: string;
  difficulty: string;
  difficulty_explanation: string;
  max_altitude: number;
  ams_risk_level: string;
  required_acclimatization_days: number;
  acclimatization_schedule: string[];
  recommended_fitness_prep: string;
  essential_gear: string[];
  emergency_evacuation_points: string[];
  nearest_hospital: string;
  safety_flags: string[];
  permits_required: string[];
}

export interface BudgetItem {
  category: string;
  item: string;
  cost_usd: number;
  cost_npr: number;
  notes?: string;
}

export interface BudgetResult {
  destination_name: string;
  breakdown: BudgetItem[];
  subtotal: number;
  subtotal_npr: number;
  emergency_buffer_15: number;
  emergency_buffer_15_npr: number;
  grand_total: number;
  grand_total_npr: number;
  warnings?: string[];
}
