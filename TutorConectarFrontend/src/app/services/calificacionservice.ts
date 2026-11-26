import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { CalificacionDTO } from '../models/CalificacionDTO';
import { Observable } from 'rxjs';
import { PromedioTutorDTO } from '../models/PromedioTutorDTO';
import { CalificacionesPorPuntuacionDTO } from '../models/CalificacionesPorPuntuacionDTO';

@Injectable({ providedIn: 'root' })
export class Calificacionservice extends Crudservice<CalificacionDTO> {
  protected recurso = 'calificaciones'
  reportePromedioPorTutor(): Observable<PromedioTutorDTO[]> {
    return this.http.get<PromedioTutorDTO[]>(`${this.url}/reporte/promedio-por-tutor`)
  }
  reportePorPuntuacion(): Observable<CalificacionesPorPuntuacionDTO[]> {
    return this.http.get<CalificacionesPorPuntuacionDTO[]>(`${this.url}/reporte/por-puntuacion`)
  }
}
