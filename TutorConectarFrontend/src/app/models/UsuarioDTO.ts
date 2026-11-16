export class UsuarioDTO {
  idUsuario: number = 0
  nombre: string = ''
  apellido: string = ''
  email: string = ''
  passwordHash?: string = ''
  activo: boolean = true
  fechaRegistro: string | null = null
  idRol: number | null = null
}
