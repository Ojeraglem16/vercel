'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Usuario, Cargo, UsuarioFormData } from '@/types'

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(false)

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vista_usuarios_cargos')
      .select('*')
    
    if (!error) setUsuarios(data || [])
    setLoading(false)
    return { data, error }
  }

  const fetchCargos = async () => {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
    
    if (!error) setCargos(data || [])
    return { data, error }
  }

  const agregarUsuario = async (usuarioData: UsuarioFormData) => {
    const { nombre, email, id_cargo, fecha_inicio } = usuarioData
    
    const { data: usuario, error: errorUsuario } = await supabase
      .from('usuarios')
      .insert([{ nombre, email }])
      .select()
      .single()

    if (errorUsuario) return { error: errorUsuario }

    const { error: errorCargo } = await supabase
      .from('cargos_usuarios')
      .insert([{ 
        id_usuario: usuario.id, 
        id_cargo: parseInt(id_cargo), 
        fecha_inicio 
      }])

    if (errorCargo) return { error: errorCargo }

    await fetchUsuarios()
    return { success: true }
  }

  const eliminarUsuario = async (id: number) => {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (!error) await fetchUsuarios()
    return { error }
  }

  const modificarUsuario = async (id: number, usuarioData: Partial<UsuarioFormData>) => {
    const { nombre, email, id_cargo } = usuarioData
    
    const { error: errorUsuario } = await supabase
      .from('usuarios')
      .update({ nombre, email })
      .eq('id', id)

    if (errorUsuario) return { error: errorUsuario }

    if (id_cargo) {
      const { error: errorCargo } = await supabase
        .from('cargos_usuarios')
        .update({ id_cargo: parseInt(id_cargo) })
        .eq('id_usuario', id)

      if (errorCargo) return { error: errorCargo }
    }

    await fetchUsuarios()
    return { success: true }
  }

  const usuariosSueldoMayor = async (monto: number): Promise<{ data: Usuario[]; error?: unknown }> => {
    const { data, error } = await supabase
      .from('vista_usuarios_cargos')
      .select('*')
      .gt('sueldo', monto)
    return { data: (data as Usuario[]) || [], error }
  }

  const usuariosSueldoEntre = async (min: number, max: number): Promise<{ data: Usuario[]; error?: unknown }> => {
    const { data, error } = await supabase
      .from('vista_usuarios_cargos')
      .select('*')
      .gte('sueldo', min)
      .lte('sueldo', max)
    return { data: (data as Usuario[]) || [], error }
  }

  const usuariosLlegaronTarde = async (): Promise<{ data: Usuario[]; error?: unknown }> => {
    const { data, error } = await supabase
      .from('vista_usuarios_tarde')
      .select('*')
    return { data: (data as Usuario[]) || [], error }
  }

  const usuariosSalieronTemprano = async (): Promise<{ data: Usuario[]; error?: unknown }> => {
    const { data, error } = await supabase
      .from('vista_usuarios_temprano')
      .select('*')
    return { data: (data as Usuario[]) || [], error }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchCargos()
  }, [])

  return {
    usuarios,
    cargos,
    loading,
    fetchUsuarios,
    agregarUsuario,
    eliminarUsuario,
    modificarUsuario,
    usuariosSueldoMayor,
    usuariosSueldoEntre,
    usuariosLlegaronTarde,
    usuariosSalieronTemprano
  }
}