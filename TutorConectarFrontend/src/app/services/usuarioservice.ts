import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {
  // Si tus compañeros usan environment.base, ajústalo al nombre que tengan en environment.ts
  private apiurl = `${environment.base}/api/usuarios`;

  constructor(private http: HttpClient) {}

  list(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiurl);
  }
  
  listByRol(rol: string): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiurl}/rol/${rol}`);
  }

  listTutorByNombre(nombre: string): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiurl}/tutores/buscar?nombre=${nombre}`);
  }

  listId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiurl}/${id}`);
  }

  insert(u: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiurl, u);
  }

  update(id: number, u: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiurl}/${id}`, u);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiurl}/${id}`);
  }
}