import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { ReporteProgresoDTO } from '../models/ReporteProgresoDTO';
import { ProgresoPorNivelDTO } from '../models/ProgresoPorNivelDTO';
import { MateriaCantidadDTO } from '../models/MateriaCantidadDTO';

@Injectable({ providedIn: 'root' })
export class Reporteprogresoservice extends Crudservice<ReporteProgresoDTO> {
  protected recurso = 'reportes-progreso'
  listByTutor(idTutor: number): Observable<ReporteProgresoDTO[]> {
    return this.lista(this.http.get<ReporteProgresoDTO[]>(`${this.url}/tutor/${idTutor}`))
  }
  listByEstudiante(idEstudiante: number): Observable<ReporteProgresoDTO[]> {
    return this.lista(this.http.get<ReporteProgresoDTO[]>(`${this.url}/estudiante/${idEstudiante}`))
  }
  reportePorNivel(): Observable<ProgresoPorNivelDTO[]> {
    return this.http.get<ProgresoPorNivelDTO[]>(`${this.url}/reporte/por-nivel`)
  }
  reportePorMateria(): Observable<MateriaCantidadDTO[]> {
    return this.http.get<MateriaCantidadDTO[]>(`${this.url}/reporte/por-materia`)
  }
}
