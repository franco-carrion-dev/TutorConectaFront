import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ReporteProgresoDTO } from '../models/ReporteProgresoDTO';

@Injectable({ providedIn: 'root' })
export class Reporteprogresoservice {
  private apiURL = `${environment.base}/api/reportes-progreso`;
  constructor(private http: HttpClient) { }

  list(): Observable<ReporteProgresoDTO[]> {
    return this.http.get<ReporteProgresoDTO[]>(this.apiURL);
  }
  listByTutor(idTutor: number): Observable<ReporteProgresoDTO[]> {
    return this.http.get<ReporteProgresoDTO[]>(`${this.apiURL}/tutor/${idTutor}`);
  }
  listByEstudiante(idEstudiante: number): Observable<ReporteProgresoDTO[]> {
    return this.http.get<ReporteProgresoDTO[]>(`${this.apiURL}/estudiante/${idEstudiante}`);
  }
  insert(d: ReporteProgresoDTO): Observable<ReporteProgresoDTO> {
    return this.http.post<ReporteProgresoDTO>(this.apiURL, d);
  }
}