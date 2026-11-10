import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Reporteprogresoservice } from '../../../services/reporteprogresoservice';

@Component({
  selector: 'app-repinsertcomponent',
  imports: [ReactiveFormsModule],
  templateUrl: './repinsertcomponent.html',
  styleUrl: './repinsertcomponent.css',
})
export class Repinsertcomponent {
  form: FormGroup
  mensaje: string = ''

  constructor(private fb: FormBuilder, private rS: Reporteprogresoservice, private router: Router) {
    this.form = this.fb.group({
      idSesion: [null, [Validators.required, Validators.min(1)]],
      progreso: ['', Validators.required],
      observaciones: ['', Validators.required],
    })
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      this.mensaje = 'Completa todos los campos'
      return
    }
    this.rS.insert(this.form.value).subscribe({
      next: () => this.router.navigate(['/reportes']),
      error: () => { this.mensaje = 'No se pudo registrar el reporte' }
    })
  }
}