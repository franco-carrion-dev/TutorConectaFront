import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';

@Component({
  selector: 'app-ulistcomponent',
  imports: [MatTableModule, FormsModule, RouterLink],
  templateUrl: './ulistcomponent.html',
  styleUrl: './ulistcomponent.css',
})
export class Ulistcomponent implements OnInit {
  dataSource: UsuarioDTO[] = []
  mensaje: string = ''
  displayedColumns: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
  nombreTutor: string = ''
  rol: string = ''

  constructor(
    private uS: Usuarioservice,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') this.listar()
  }

  listar() { this.cargar(this.uS.list()) }
  filtrarTutor() { if (this.nombreTutor) this.cargar(this.uS.listTutorByNombre(this.nombreTutor)) }
  filtrarRol() { if (this.rol) this.cargar(this.uS.listByRol(this.rol.toUpperCase())) }

  eliminar(id: number) {
    this.uS.delete(id).subscribe({
      next: () => this.listar(),
      error: () => {
        this.mensaje = 'Error al eliminar'
        this.cdr.detectChanges()
      }
    })
  }

  private cargar(obs: any) {
    this.mensaje = 'Cargando...'
    obs.subscribe({
      next: (data: UsuarioDTO[]) => {
        this.dataSource = data
        this.mensaje = data.length > 0 ? '' : 'No hay registros'
        this.cdr.detectChanges()
      },
      error: () => {
        this.dataSource = []
        this.mensaje = 'Error al cargar'
        this.cdr.detectChanges()
      }
    })
  }
}