import { RenderMode, ServerRoute } from '@angular/ssr';

// La app usa JWT en localStorage, así que todas las rutas se renderizan en el navegador
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client },
];
