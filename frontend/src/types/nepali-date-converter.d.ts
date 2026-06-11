declare module '@sbmdkl/nepali-date-converter' {
  export function adToBs(date: string): string
  export function bsToAd(date: string): string
  export function calculateAge(date: string): { year: number; month: number; day: number }
}
