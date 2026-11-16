export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const NIVELES = ['Primaria', 'Secundaria', 'Preuniversitario', 'Universitario']
export const ESTADOS_SESION = ['pendiente_pago', 'agendada', 'realizada', 'cancelada']
export const ESTADOS_PAGO = ['PENDIENTE', 'COMPLETADO', 'EN_DISPUTA', 'REEMBOLSADO', 'RECHAZADO']
export const METODOS_PAGO = ['Tarjeta', 'Yape', 'Plin', 'Transferencia', 'Culqi', 'Mercado Pago']
/** Nivel de progreso -> % para las barras del panel del estudiante */
export const PROGRESOS: Record<string, number> = {
  'Inicial': 25, 'En progreso': 50, 'Logrado': 75, 'Destacado': 100,
}
export const ETIQUETA_ESTADO: Record<string, string> = {
  pendiente_pago: 'Pendiente de pago', agendada: 'Agendada', realizada: 'Realizada', cancelada: 'Cancelada',
  PENDIENTE: 'Pendiente', COMPLETADO: 'Completado', EN_DISPUTA: 'En disputa', REEMBOLSADO: 'Reembolsado', RECHAZADO: 'Rechazado',
}
