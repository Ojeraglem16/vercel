export interface Usuario {
  id: number
  nombre: string
  email: string
  cargo?: string
  sueldo?: number
  id_cargo?: number
}

export interface Cargo {
  id: number
  cargo: string
  sueldo: number
}

export interface UsuarioFormData {
  nombre: string
  email: string
  id_cargo: string
  fecha_inicio: string
}