export class DisponibilidadHorariaDTO {
  idDisponibilidad: number = 0
  idTutor: number = 0
  nombreTutor?: string = ''
  diaSemana: string = 'Lunes'
  horaInicio: string = '08:00'
  horaFin: string = '10:00'
  disponible: boolean = true
}
