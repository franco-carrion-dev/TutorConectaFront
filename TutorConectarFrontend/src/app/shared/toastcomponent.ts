import { Component, inject } from '@angular/core';
import { Toastservice } from '../core/toastservice';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toasts" aria-live="polite">
      @for (t of ts.toasts(); track t.id) {
        <div class="toast" [class]="t.tipo" (click)="ts.cerrar(t.id)">
          <span class="material-icons">{{ t.tipo === 'ok' ? 'check_circle' : t.tipo === 'error' ? 'error' : 'info' }}</span>
          {{ t.texto }}
        </div>
      }
    </div>`,
  styles: [`
    .toasts { position: fixed; right: 16px; bottom: 16px; display: grid; gap: 8px; z-index: 100; max-width: 380px; }
    .toast { display: flex; gap: 8px; align-items: flex-start; padding: 12px 14px; border-radius: 10px; color: #fff;
      background: #1F2937; box-shadow: 0 8px 24px rgba(0,0,0,.18); font-size: 14px; cursor: pointer; }
    .toast.ok { background: #15803D; } .toast.error { background: #B91C1C; }`],
})
export class Toastcomponent { ts = inject(Toastservice) }
