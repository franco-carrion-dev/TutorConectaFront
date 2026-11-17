import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Loginservice } from './loginservice';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Loginservice);
  const router = inject(Router);
  const token = auth.token();
  const esAuth = req.url.includes('/api/auth/');

  const r = token && !esAuth 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) 
    : req;

  return next(r).pipe(
    catchError((e: HttpErrorResponse) => {
      // Opcional: Ignoramos el cierre de sesión automático en llamadas secundarias 
      // para evitar falsos positivos si el token parpadea al arrancar, 
      // o validamos estrictamente que la sesión realmente expiró.
      if (e.status === 401 && !esAuth) {
        console.warn(`Petición rechazada (401) en: ${req.url}`);
        
        // Descomenta la siguiente línea solo si estás 100% seguro de querer 
        // sacar al usuario ante cualquier 401:
        // auth.logout();
        // router.navigate(['/login'], { queryParams: { expirada: 1 } });
      }
      return throwError(() => e);
    })
  );
};
