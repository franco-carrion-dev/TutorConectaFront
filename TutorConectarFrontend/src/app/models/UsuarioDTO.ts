export interface UsuarioDTO {
  idUsuario?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  telefono?: string;
  activo?: boolean;
  rol?: any;
  [key: string]: any;
}
