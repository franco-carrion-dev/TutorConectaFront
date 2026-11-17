import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { Calificacionservice } from '../services/calificacionservice';
import { Tutorservice } from '../services/tutorservice';

/** Recalcula tutores.calificacionPromedio después de crear/editar/eliminar una calificación */
@Injectable({ providedIn: 'root' })
export class Promedioservice {
  private cS = inject(Calificacionservice)
  private tS = inject(Tutorservice)

  recalcular(idTutor: number): Observable<unknown> {
    return forkJoin({ cal: this.cS.list(), tutor: this.tS.listId(idTutor) }).pipe(
      switchMap(({ cal, tutor }) => {
        const c = cal.filter(x => x.idTutor === idTutor)
        const prom = c.length ? Math.round((c.reduce((a, b) => a + b.puntuacion, 0) / c.length) * 100) / 100 : 0
        if (Number(tutor.calificacionPromedio) === prom) return of(null)
        return this.tS.update(idTutor, { ...tutor, calificacionPromedio: prom, idMaterias: tutor.idMaterias ?? [] })
      }),
      map(() => null),
    )
  }
}
