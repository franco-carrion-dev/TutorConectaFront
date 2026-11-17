import { Pipe, PipeTransform } from '@angular/core';
import { ETIQUETA_ESTADO } from '../models/Constantes';

@Pipe({ name: 'etiqueta' })
export class EtiquetaPipe implements PipeTransform {
  transform(v: string | null | undefined): string { return v ? (ETIQUETA_ESTADO[v] ?? v) : '—' }
}

@Pipe({ name: 'iniciales' })
export class InicialesPipe implements PipeTransform {
  transform(v: string | null | undefined): string {
    return (v ?? '?').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
  }
}

@Pipe({ name: 'estrellas' })
export class EstrellasPipe implements PipeTransform {
  transform(v: number | null | undefined): { on: string, off: string } {
    const n = Math.round(Number(v) || 0)
    return { on: '★'.repeat(n), off: '★'.repeat(Math.max(0, 5 - n)) }
  }
}
