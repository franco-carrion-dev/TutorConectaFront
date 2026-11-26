import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { PagoDTO } from '../models/PagoDTO';
import { MontoPorMetodoDTO } from '../models/MontoPorMetodoDTO';
import { MontoPorMesDTO } from '../models/MontoPorMesDTO';

@Injectable({ providedIn: 'root' })
export class Pagoservice extends Crudservice<PagoDTO> {
  protected recurso = 'pagos'
  listByEstado(estado: string): Observable<PagoDTO[]> {
    return this.lista(this.http.get<PagoDTO[]>(`${this.url}/estado/${estado}`))
  }
  listByTutorYEstado(idTutor: number, estado: string): Observable<PagoDTO[]> {
    return this.lista(this.http.get<PagoDTO[]>(`${this.url}/tutor/${idTutor}/estado/${estado}`))
  }
  reportePorMetodo(): Observable<MontoPorMetodoDTO[]> {
    return this.http.get<MontoPorMetodoDTO[]>(`${this.url}/reporte/por-metodo`)
  }
  reportePorMes(anio: number): Observable<MontoPorMesDTO[]> {
    return this.http.get<MontoPorMesDTO[]>(`${this.url}/reporte/por-mes`, { params: { anio } })
  }
}
