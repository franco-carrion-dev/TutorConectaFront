export class UsuarioDTO {
  idUsuario: number = 0;
  nombre: string = '';
  apellido: string = '';
  email: string = '';
  passwordHash: string = '';
  idRol: number = 0;
  fechaRegistro: string = '';
  activo: boolean = true;
}
