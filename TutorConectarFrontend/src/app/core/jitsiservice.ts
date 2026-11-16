import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/** Jitsi Meet (servidor público meet.jit.si, sin API key) */
@Injectable({ providedIn: 'root' })
export class Jitsiservice {
  nuevoEnlace(): string {
    const id = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '').slice(0, 16)
    return `https://${environment.jitsiDomain}/TutorConecta-${id}`
  }
  sala(enlace: string): string { return enlace.split('/').pop() ?? '' }
}
