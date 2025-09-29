'use client'

import { useState } from 'react'
import { useUsuarios } from '@/hooks/useUsuarios'
import { UsuarioForm } from '@/components/ui/usuario-form'
import { UsuariosTable } from '@/components/usuarios-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Usuario, UsuarioFormData } from '@/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

export default function Home() {
  const {
    usuarios,
    cargos,
    loading,
    agregarUsuario,
    eliminarUsuario,
    modificarUsuario,
    usuariosSueldoMayor,
    usuariosSueldoEntre,
    usuariosLlegaronTarde,
    usuariosSalieronTemprano
  } = useUsuarios()

  const [editando, setEditando] = useState<Usuario | null>(null)
  const [resultadosConsulta, setResultadosConsulta] = useState<Usuario[]>([])
  const [montoConsulta, setMontoConsulta] = useState(4000)

  const handleSubmit = async (data: UsuarioFormData) => {
    try {
      let result
      if (editando) {
        result = await modificarUsuario(editando.id, data)
      } else {
        result = await agregarUsuario(data)
      }

      if (result.error) throw result.error

      toast.success(editando ? "Usuario actualizado" : "Usuario agregado")
      setEditando(null)
    } catch {
      toast.error("Ha ocurrido un error al procesar la solicitud")
    }
  }

  const handleEditar = (usuario: Usuario) => {
    setEditando(usuario)
  }

  const handleCancelar = () => {
    setEditando(null)
  }

  const handleEliminar = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const result = await eliminarUsuario(id)
        if (result.error) throw result.error
        
        toast.success("Usuario eliminado correctamente")
      } catch{
        toast.error("Ha ocurrido un error al eliminar el usuario")
      }
    }
  }

  type ConsultaFunc = (...args: unknown[]) => Promise<{ data: Usuario[]; error?: unknown }>;

  const ejecutarConsulta = async <T extends unknown[]>(
    consultaFunc: (...args: T) => Promise<{ data: Usuario[]; error?: unknown }>,
    ...args: T
  ) => {
    try {
      const { data, error } = await consultaFunc(...args)
      if (error) throw error
      setResultadosConsulta(data || [])
    } catch {
      toast.error("Ha ocurrido un error al ejecutar la consulta")
    }
  }

  const datosAMostrar = resultadosConsulta.length > 0 ? resultadosConsulta : usuarios

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Sistema de Gestión de Usuarios</h1>
        <p className="text-muted-foreground">CRUD completo con Next.js y Supabase</p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>{editando ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</CardTitle>
          <CardDescription>
            {editando ? 'Modifica los datos del usuario seleccionado' : 'Completa el formulario para agregar un nuevo usuario'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsuarioForm
            onSubmit={handleSubmit}
            onCancel={handleCancelar}
            initialData={
              editando
                ? { ...editando, id_cargo: editando.id_cargo?.toString() }
                : undefined
            }
            cargos={cargos}
            isEditing={!!editando}
          />
        </CardContent>
      </Card>

      {/* Consultas */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Especiales</CardTitle>
          <CardDescription>Realiza consultas específicas sobre los usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="monto">Monto de consulta (Bs.):</Label>
              <Input
                id="monto"
                type="number"
                value={montoConsulta}
                onChange={(e) => setMontoConsulta(Number(e.target.value))}
                className="w-32"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => ejecutarConsulta(usuariosSueldoMayor, montoConsulta)}>
                Sueldo mayor a Bs. {montoConsulta}
              </Button>
              
              <Button onClick={() => ejecutarConsulta(usuariosSueldoEntre, 3000, 6000)}>
                Sueldo entre Bs. 3000-6000
              </Button>
              
              <Button onClick={() => ejecutarConsulta(usuariosLlegaronTarde)}>
                Llegaron tarde
              </Button>
              
              <Button onClick={() => ejecutarConsulta(usuariosSalieronTemprano)}>
                Salieron temprano
              </Button>
              
              <Button variant="outline" onClick={() => setResultadosConsulta([])}>
                Mostrar todos ({usuarios.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de resultados */}
      <Card>
        <CardHeader>
          <CardTitle>
            {resultadosConsulta.length > 0 ? 'Resultados de la Consulta' : 'Todos los Usuarios'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({datosAMostrar.length} registros)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsuariosTable
            usuarios={datosAMostrar}
            onEdit={handleEditar}
            onDelete={handleEliminar}
          />
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}