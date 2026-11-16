/** Estados: pendiente_pago -> agendada -> realizada | cancelada */
export class SesionDTO {
  idSesion: number = 0
  idEstudiante: number = 0
  idTutor: number = 0
  idMateria: number = 0
  fechaInicio: string = ''
  fechaFin: string = ''
  estado: string = 'pendiente_pago'
  enlaceJitsi: string = ''
  fechaCreacion: string | null = null
}
