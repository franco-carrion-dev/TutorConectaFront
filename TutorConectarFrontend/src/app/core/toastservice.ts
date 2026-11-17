import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; texto: string; tipo: 'ok' | 'error' | 'info' }

@Injectable({ providedIn: 'root' })
export class Toastservice {
  toasts = signal<Toast[]>([])
  private n = 0
  ok(t: string) { this.push(t, 'ok') }
  error(t: string) { this.push(t, 'error') }
  info(t: string) { this.push(t, 'info') }
  /** Mensaje legible a partir de un HttpErrorResponse */
  http(e: any, porDefecto = 'Ocurrió un error') {
    let t = porDefecto
    if (e?.status === 0) t = 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    else if (e?.status === 403) t = 'No tienes permisos para esta acción'
    else if (e?.error?.error) t = e.error.error
    else if (e?.status === 409) t = 'No se puede: el registro tiene datos relacionados'
    this.push(t, 'error')
  }
  cerrar(id: number) { this.toasts.update(l => l.filter(x => x.id !== id)) }
  private push(texto: string, tipo: Toast['tipo']) {
    const id = ++this.n
    this.toasts.update(l => [...l, { id, texto, tipo }])
    setTimeout(() => this.cerrar(id), 4500)
  }
}
