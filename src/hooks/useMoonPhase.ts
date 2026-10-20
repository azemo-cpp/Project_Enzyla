export function useMoonPhase(): string {
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth() + 1;
  const d = now.getDate();
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  let age = (JD - 2451549.5) % 29.53058867;
  if (age < 0) age += 29.53058867;
  if (age < 1.85) return 'New Moon';
  if (age < 7.38) return 'Waxing Crescent';
  if (age < 9.22) return 'First Quarter';
  if (age < 14.77) return 'Waxing Gibbous';
  if (age < 16.61) return 'Full Moon';
  if (age < 22.15) return 'Waning Gibbous';
  if (age < 23.99) return 'Last Quarter';
  return 'Waning Crescent';
}
