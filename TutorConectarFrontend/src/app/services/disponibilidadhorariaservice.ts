import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { DisponibilidadHorariaDTO } from '../models/DisponibilidadHorariaDTO';

@Injectable({ providedIn: 'root' })
export class Disponibilidadhorariaservice {
  private apiURL = `${environment.base}/api/disponibilidades-horarias`;
  constructor(private http: HttpClient) { }

  list(): Observable<DisponibilidadHorariaDTO[]> {
    return this.http.get<DisponibilidadHorariaDTO[]>(this.apiURL);
  }
  listByTutor(idTutor: number): Observable<DisponibilidadHorariaDTO[]> {
    return this.http.get<DisponibilidadHorariaDTO[]>(`${this.apiURL}/tutor/${idTutor}`);
  }
  listByDia(dia: string): Observable<DisponibilidadHorariaDTO[]> {
    return this.http.get<DisponibilidadHorariaDTO[]>(`${this.apiURL}/dia/${dia}`);
  }
  insert(d: DisponibilidadHorariaDTO): Observable<DisponibilidadHorariaDTO> {
    return this.http.post<DisponibilidadHorariaDTO>(this.apiURL, d);
  }
}