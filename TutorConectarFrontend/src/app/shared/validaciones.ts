/** Mensajes de validación reutilizables (se muestran debajo de cada campo) */

export function errTarifa(v: number | null | undefined): string {
  if (v === null || v === undefined || (v as any) === '') return 'La tarifa por hora es obligatoria'
  if (isNaN(Number(v))) return 'La tarifa debe ser un número'
  if (Number(v) <= 0) return 'La tarifa debe ser mayor a 0 (no se permiten valores negativos)'
  if (Number(v) > 500) return 'La tarifa no puede superar S/ 500'
  return ''
}

export function errPresupuesto(v: number | null | undefined): string {
  if (v === null || v === undefined || (v as any) === '') return ''
  if (Number(v) < 0) return 'El presupuesto no puede ser negativo'
  return ''
}

export function errPuntuacion(v: number | null | undefined): string {
  if (!v) return 'Selecciona una calificación de 1 a 5 estrellas'
  if (v < 1 || v > 5) return 'La calificación debe estar entre 1 y 5'
  return ''
}
