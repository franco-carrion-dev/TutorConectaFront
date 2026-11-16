export class UsuarioDTO {
  idUsuario: number = 0
  nombre: string = ''
  apellido: string = ''
  email: string = ''
  password?: string = ''
  idRol: number = 3
  denominacionRol?: string = ''
  activo: boolean = true
  fechaRegistro: string = ''
}