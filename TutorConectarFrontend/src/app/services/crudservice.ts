import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

/** CRUD genérico contra la API REST de Spring Boot. Los 204 (sin contenido) se convierten en [] */
export abstract class Crudservice<T> {
  protected http = inject(HttpClient)
  protected abstract recurso: string

  protected get url(): string { return `${environment.base}/api/${this.recurso}` }

  protected lista(o: Observable<T[] | null>): Observable<T[]> {
    return o.pipe(map(r => r ?? []))
  }

  list(): Observable<T[]> { return this.lista(this.http.get<T[]>(this.url)) }
  listId(id: number): Observable<T> { return this.http.get<T>(`${this.url}/${id}`) }
  insert(o: T): Observable<T> { return this.http.post<T>(this.url, o) }
  update(id: number, o: T): Observable<T> { return this.http.put<T>(`${this.url}/${id}`, o) }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`) }
}
