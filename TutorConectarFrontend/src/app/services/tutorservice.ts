import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { TutorDTO } from '../models/TutorDTO';
import { Observable } from 'rxjs';
import { IngresosTutorDTO } from '../models/IngresosTutorDTO';

@Injectable({ providedIn: 'root' })
export class Tutorservice extends Crudservice<TutorDTO> {
  protected recurso = 'tutores'
  reporteIngresos(): Observable<IngresosTutorDTO[]> {
    return this.http.get<IngresosTutorDTO[]>(`${this.url}/reporte/ingresos`)
  }
  listByRangoTarifa(min: number, max: number): Observable<TutorDTO[]> {
    return this.lista(this.http.get<TutorDTO[]>(`${this.url}/tarifa`, { params: { min, max } }))
  }
}
