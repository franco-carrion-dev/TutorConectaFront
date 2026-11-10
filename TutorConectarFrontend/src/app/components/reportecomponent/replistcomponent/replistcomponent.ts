import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ReporteProgresoDTO } from '../../../models/ReporteProgresoDTO';
import { Reporteprogresoservice } from '../../../services/reporteprogresoservice';

@Component({
  selector: 'app-replistcomponent',
  imports: [MatTableModule, FormsModule, DatePipe],
  templateUrl: './replistcomponent.html',
  styleUrl: './replistcomponent.css',
})
export class Replistcomponent implements OnInit {
  dataSource: ReporteProgresoDTO[] = []
  mensaje: string = ''
  displayedColumns: string[] = ['A', 'B', 'C', 'D', 'E', 'F']
  idEstudiante: number | null = null
  idTutor: number | null = null

  constructor(private rS: Reporteprogresoservice, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') this.listar() 
  }

  listar() { this.cargar(this.rS.list()) }
  filtrarEstudiante() { if (this.idEstudiante) this.cargar(this.rS.listByEstudiante(this.idEstudiante)) }
  filtrarTutor() { if (this.idTutor) this.cargar(this.rS.listByTutor(this.idTutor)) }

  private cargar(obs: any) {
    this.mensaje = 'Cargando...'
    obs.subscribe({
      next: (data: ReporteProgresoDTO[]) => {
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