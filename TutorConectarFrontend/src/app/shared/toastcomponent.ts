import { Component, inject } from '@angular/core';
import { Toastservice } from '../core/toastservice';

// Notificaciones (Guía de Estilos 6.7): arriba a la derecha en escritorio, abajo en móvil,
// 5 s de duración, botón para cerrar, role="status" (role="alert" en errores).
@Component({
  selector: 'app-toast',
  template: `
    <div class="toasts">
      @for (t of ts.toasts(); track t.id) {
        <div class="toast" [class]="t.tipo" [attr.role]="t.tipo === 'error' ? 'alert' : 'status'">
          <span class="material-icons" aria-hidden="true">{{ t.tipo === 'ok' ? 'check_circle' : t.tipo === 'error' ? 'error' : 'info' }}</span>
          <span class="txt">{{ t.texto }}</span>
          <button type="button" class="cerrar" aria-label="Cerrar notificación" (click)="ts.cerrar(t.id)">
            <span class="material-icons" aria-hidden="true">close</span>
          </button>
        </div>
      }
    </div>`,
  styles: [`
    .toasts { position: fixed; top: 76px; right: 16px; display: grid; gap: 8px; z-index: 100; width: min(380px, calc(100vw - 32px)); }
    .toast { display: flex; gap: 10px; align-items: flex-start; padding: 12px 8px 12px 14px; border-radius: var(--r-md);
      border-left: 4px solid var(--info-700); background: #fff; color: var(--gray-900);
      box-shadow: var(--sh2); font-size: 14px; line-height: 20px; }
    .toast > .material-icons { color: var(--info-700); }
    .toast.ok { border-left-color: var(--success-700); } .toast.ok > .material-icons { color: var(--success-700); }
    .toast.error { border-left-color: var(--error-700); } .toast.error > .material-icons { color: var(--error-700); }
    .txt { flex: 1; padding-top: 1px; }
    .cerrar { border: 0; background: none; color: var(--gray-500); cursor: pointer; width: 28px; height: 28px; border-radius: var(--r-sm);
      display: inline-flex; align-items: center; justify-content: center; }
    .cerrar:hover { background: var(--gray-100); color: var(--gray-900); }
    @media (max-width: 700px) { .toasts { top: auto; bottom: 16px; left: 16px; right: 16px; width: auto; } }`],
})
export class Toastcomponent { ts = inject(Toastservice) }
