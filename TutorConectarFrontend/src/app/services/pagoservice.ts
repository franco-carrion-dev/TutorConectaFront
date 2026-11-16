import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { PagoDTO } from '../models/PagoDTO';

@Injectable({ providedIn: 'root' })
export class Pagoservice extends Crudservice<PagoDTO> {
  protected recurso = 'pagos'
  listByEstado(estado: string): Observable<PagoDTO[]> {
    return this.lista(this.http.get<PagoDTO[]>(`${this.url}/estado/${estado}`))
  }
  listByTutorYEstado(idTutor: number, estado: string): Observable<PagoDTO[]> {
    return this.lista(this.http.get<PagoDTO[]>(`${this.url}/tutor/${idTutor}/estado/${estado}`))
  }
}
