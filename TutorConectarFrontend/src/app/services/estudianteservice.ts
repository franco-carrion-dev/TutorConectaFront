import { Injectable } from '@angular/core';
import { Crudservice } from './crudservice';
import { EstudianteDTO } from '../models/EstudianteDTO';
import { Observable } from 'rxjs';
import { GastoEstudianteDTO } from '../models/GastoEstudianteDTO';

@Injectable({ providedIn: 'root' })
export class Estudianteservice extends Crudservice<EstudianteDTO> {
  protected recurso = 'estudiantes'
  reporteGastos(): Observable<GastoEstudianteDTO[]> {
    return this.http.get<GastoEstudianteDTO[]>(`${this.url}/reporte/gastos`)
  }
  listByPresupuestoMinimo(monto: number): Observable<EstudianteDTO[]> {
    return this.lista(this.http.get<EstudianteDTO[]>(`${this.url}/presupuesto`, { params: { monto } }))
  }
}
