import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Crudservice } from './crudservice';
import { UsuarioDTO } from '../models/UsuarioDTO';

@Injectable({ providedIn: 'root' })
export class Usuarioservice extends Crudservice<UsuarioDTO> {
  protected recurso = 'usuarios'
  me(): Observable<UsuarioDTO> { return this.http.get<UsuarioDTO>(`${this.url}/me`) }
  buscarTutoresPorNombre(nombre: string): Observable<UsuarioDTO[]> {
    return this.lista(this.http.get<UsuarioDTO[]>(`${this.url}/tutores/buscar`, { params: { nombre } }))
  }
}
