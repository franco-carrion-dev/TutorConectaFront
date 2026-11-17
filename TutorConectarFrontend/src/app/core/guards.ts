import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Loginservice, Rol } from './loginservice';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Loginservice)
  return auth.verificar() ? true : inject(Router).createUrlTree(['/login'])
}

/** Uso: canActivate: [rolGuard], data: { roles: ['ADMIN'] } */
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(Loginservice)
  const router = inject(Router)
  if (!auth.verificar()) return router.createUrlTree(['/login'])
  const roles = (route.data?.['roles'] ?? []) as Rol[]
  if (roles.length === 0 || roles.includes(auth.rol()!)) return true
  return router.createUrlTree([auth.inicio()])
}

export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Loginservice)
  return auth.verificar() ? inject(Router).createUrlTree([auth.inicio()]) : true
}
