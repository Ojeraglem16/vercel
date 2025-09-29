'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UsuarioFormData, Cargo } from '@/types'

interface UsuarioFormProps {
  onSubmit: (data: UsuarioFormData) => void
  onCancel?: () => void
  initialData?: Partial<UsuarioFormData>
  cargos: Cargo[]
  isEditing?: boolean
}

export function UsuarioForm({ onSubmit, onCancel, initialData, cargos, isEditing }: UsuarioFormProps) {
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre: initialData?.nombre || '',
    email: initialData?.email || '',
    id_cargo: initialData?.id_cargo || '',
    fecha_inicio: initialData?.fecha_inicio || new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo</Label>
          <Select value={formData.id_cargo} onValueChange={(value) => setFormData({ ...formData, id_cargo: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cargo" />
            </SelectTrigger>
            <SelectContent>
              {cargos.map((cargo) => (
                <SelectItem key={cargo.id} value={cargo.id.toString()}>
                  {cargo.cargo} - Bs. {cargo.sueldo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Agregar'} Usuario
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}