import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Datos, Datosservice } from '../../core/datosservice';
import { Loginservice } from '../../core/loginservice';
import { SesionDTO } from '../../models/SesionDTO';
import { EtiquetaPipe } from '../../shared/pipes';

/** Videollamada integrada con Jitsi Meet (iframe embebido, sin API key) */
@Component({
  selector: 'app-sala',
  imports: [RouterLink, DatePipe, EtiquetaPipe],
  templateUrl: './salacomponent.html',
})
export class Salacomponent implements OnInit {
  private dS = inject(Datosservice)
  private san = inject(DomSanitizer)
  private route = inject(ActivatedRoute)
  auth = inject(Loginservice)
  d = new Datos()
  s: SesionDTO | undefined
  url: SafeResourceUrl | null = null
  permitido = false
  cargando = true
  volver = '/'

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.volver = { ADMIN: '/admin/sesiones', TUTOR: '/tutor/sesiones', ESTUDIANTE: '/estudiante/sesiones' }[this.auth.rol() ?? 'ADMIN'] ?? '/'
    this.dS.cargar(['sesiones', 'usuarios', 'materias']).subscribe(d => {
      this.d = d
      this.s = d.sesion(id)
      const yo = this.auth.id()
      this.permitido = !!this.s && (this.auth.rol() === 'ADMIN' || this.s.idTutor === yo || this.s.idEstudiante === yo)
      if (this.s?.enlaceJitsi && this.permitido) {
        const nombre = encodeURIComponent(JSON.stringify(this.auth.usuario()?.nombre ?? 'Participante'))
        const asunto = encodeURIComponent(JSON.stringify(`TutorConecta · ${d.nombreMateria(this.s.idMateria)}`))
        const u = `${this.s.enlaceJitsi}#userInfo.displayName=${nombre}&config.subject=${asunto}&config.prejoinPageEnabled=false`
        this.url = this.san.bypassSecurityTrustResourceUrl(u)
      }
      this.cargando = false
    })
  }
}
