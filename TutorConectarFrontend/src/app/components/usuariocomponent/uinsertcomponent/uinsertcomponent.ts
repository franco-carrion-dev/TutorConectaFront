import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';

@Component({
  selector: 'app-uinsertcomponent',
  imports: [FormsModule, RouterLink],
  templateUrl: './uinsertcomponent.html',
  styleUrl: './uinsertcomponent.css',
})
export class Uinsertcomponent implements OnInit {
  usuario: UsuarioDTO = new UsuarioDTO()
  id: number = 0
  edicion: boolean = false
  mensaje: string = ''

  constructor(
    private uS: Usuarioservice,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((data: Params) => {
      this.id = data['id']
      this.edicion = data['id'] != null
      if (this.edicion && typeof window !== 'undefined') {
        this.uS.listId(this.id).subscribe((res) => {
          this.usuario = res
          this.cdr.detectChanges()
        })
      }
    })
  }

  aceptar() {
    if (!this.usuario.nombre || !this.usuario.apellido || !this.usuario.email) {
      this.mensaje = 'Completa los campos obligatorios'
      return
    }

    const peticion = this.edicion
      ? this.uS.update(this.id, this.usuario)
      : this.uS.insert(this.usuario)

    peticion.subscribe({
      next: () => this.router.navigate(['/usuarios']),
      error: () => {
        this.mensaje = 'Error al guardar el usuario'
        this.cdr.detectChanges()
      }
    })
  }
}