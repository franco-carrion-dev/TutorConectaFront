/** Estados: PENDIENTE, COMPLETADO, EN_DISPUTA, REEMBOLSADO, RECHAZADO */
export class PagoDTO {
  idPago: number = 0
  idSesion: number = 0
  nombreTutor?: string = ''
  monto: number = 0
  fechaPago: string = ''
  estado: string = 'COMPLETADO'
  metodoPago: string = ''
}
