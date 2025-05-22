"use client"

import { EntityDetailView } from "@/components/entity-detail-view"
import { use } from 'react'

// Sample data
const subseccional = {
  id: 1,
  subseccional: "São Paulo",
  id_usuario: 1,
  usuario: "João Silva",
}

export default function SubseccionalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <EntityDetailView
      title="Detalhes da Subseccional"
      backUrl="/subseccional"
      editUrl={`/subseccional/edit/${id}`}
      items={[
        { label: "ID", value: subseccional.id },
        { label: "Nome", value: subseccional.subseccional },
        { label: "Usuário Responsável", value: subseccional.usuario },
      ]}
    />
  )
}
