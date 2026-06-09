import { create } from 'zustand'

interface PreferencesState {
  preferences: {
    budget: number
    budget_currency: string
    duration: number
    travel_dates: string
    season: string
    interests: string[]
    fitness_level: string
    travel_type: string
    nationality: string
    starting_city: string
    accommodation_type: string
  }
  setPreference: (key: string, value: any) => void
  reset: () => void
}

const initialState = {
  budget: 0,
  budget_currency: 'USD',
  duration: 0,
  travel_dates: '',
  season: '',
  interests: [] as string[],
  fitness_level: '',
  travel_type: '',
  nationality: '',
  starting_city: 'Kathmandu',
  accommodation_type: 'mid',
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: { ...initialState },
  setPreference: (key, value) =>
    set((state) => ({
      preferences: { ...state.preferences, [key]: value },
    })),
  reset: () => set({ preferences: { ...initialState } }),
}))
