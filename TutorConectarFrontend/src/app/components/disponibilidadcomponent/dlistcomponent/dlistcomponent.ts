import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { DisponibilidadHorariaDTO } from '../../../models/DisponibilidadHorariaDTO';
import { Disponibilidadhorariaservice } from '../../../services/disponibilidadhorariaservice';

@Component({
  selector: 'app-dlistcomponent',
  imports: [MatTableModule, FormsModule],
  templateUrl: './dlistcomponent.html',
  styleUrl: './dlistcomponent.css',
})
export class Dlistcomponent implements OnInit {
  dataSource: DisponibilidadHorariaDTO[] = []
  mensaje: string = ''
  displayedColumns: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
  idTutor: number | null = null
  dia: string = ''

  constructor(
    private dS: Disponibilidadhorariaservice,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') this.listar() 
  }

  listar() { this.cargar(this.dS.list()) }
  filtrarTutor() { if (this.idTutor) this.cargar(this.dS.listByTutor(this.idTutor)) }
  filtrarDia() { if (this.dia) this.cargar(this.dS.listByDia(this.dia)) }

  private cargar(obs: any) {
    this.mensaje = 'Cargando...'
    obs.subscribe({
      next: (data: DisponibilidadHorariaDTO[]) => {
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