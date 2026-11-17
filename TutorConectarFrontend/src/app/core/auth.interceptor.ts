import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Loginservice } from './loginservice';

/** Agrega "Authorization: Bearer <jwt>" y cierra sesión si el token expiró (401) */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Loginservice)
  const router = inject(Router)
  const token = auth.token()
  const esAuth = req.url.includes('/api/auth/')
  const r = token && !esAuth ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req
  return next(r).pipe(
    catchError((e: HttpErrorResponse) => {
      if (e.status === 401 && !esAuth) {
        auth.logout()
        router.navigate(['/login'], { queryParams: { expirada: 1 } })
      }
      return throwError(() => e)
    })
  )
}
