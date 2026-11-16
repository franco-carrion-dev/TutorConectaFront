import { DIAS } from '../models/Constantes';

const dos = (n: number) => String(n).padStart(2, '0')

/** "2026-11-13T10:30:00" en hora local (formato LocalDateTime de Java) */
export function aLocalDateTime(d: Date): string {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}:00`
}
export function ahora(): string { return aLocalDateTime(new Date()) }

/** "10:30" -> "10:30:00" */
export function aLocalTime(h: string): string { return h && h.length === 5 ? `${h}:00` : h }
/** "10:30:00" -> "10:30" */
export function hhmm(h: string | null | undefined): string { return (h ?? '').substring(0, 5) }
/** "10:30" -> minutos desde las 00:00 */
export function minutos(h: string): number { const [a, b] = hhmm(h).split(':').map(Number); return a * 60 + (b || 0) }

/** Nombre del día ("Lunes"...) de una fecha */
export function diaDe(d: Date): string { return DIAS[(d.getDay() + 6) % 7] }

/** Compara nombres de día ignorando mayúsculas y tildes */
export function mismoDia(a: string, b: string): boolean { return normalizar(a) === normalizar(b) }

export function normalizar(t: string | null | undefined): string {
  return (t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}
