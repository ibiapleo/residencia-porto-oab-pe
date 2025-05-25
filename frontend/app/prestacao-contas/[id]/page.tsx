"use client"

import { EntityDetailView } from "@/components/entity-detail-view"

// Sample data
const prestacao = {
  id: 1,
  subseccional: "São Paulo",
  mesReferencia: "Janeiro",
  ano: "2023",
  dtPrevEntr: "2023-02-10",
  dtEntrega: "2023-02-08",
  dtPgto: "2023-02-15",
  valorDuzadomedio: 1200.5,
  valorDesconto: 120.05,
  valorPago: 1080.45,
  protocoloSGD: "SGD-2023-00001",
  status: "C", // C = Concluído, P = Pendente, A = Atrasado
  observacao: "Pagamento realizado dentro do prazo",
  tipoDesconto: "Desconto por Antecipação",
}

export default function PrestacaoContasDetailPage({ params }: { params: { id: string } }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "-"
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const getStatus = (status: string) => {
    switch (status) {
      case "C":
        return "Concluído"
      case "P":
        return "Pendente"
      case "A":
        return "Atrasado"
      default:
        return "Desconhecido"
    }
  }

  return (
    <EntityDetailView
      title="Detalhes da Prestação de Contas"
      backUrl="/prestacao-contas"
      editUrl={`/prestacao-contas/edit/${params.id}`}
      items={[
        { label: "Subseccional", value: prestacao.subseccional },
        { label: "Referência", value: `${prestacao.mesReferencia}/${prestacao.ano}` },
        { label: "Data Prevista", value: prestacao.dtPrevEntr, format: formatDate },
        { label: "Data de Entrega", value: prestacao.dtEntrega, format: formatDate },
        { label: "Data de Pagamento", value: prestacao.dtPgto, format: formatDate },
        { label: "Valor Duzenado Médio", value: prestacao.valorDuzadomedio, format: formatCurrency },
        { label: "Valor Desconto", value: prestacao.valorDesconto, format: formatCurrency },
        { label: "Valor Pago", value: prestacao.valorPago, format: formatCurrency },
        { label: "Protocolo SGD", value: prestacao.protocoloSGD },
        { label: "Status", value: prestacao.status, format: getStatus },
        { label: "Tipo de Desconto", value: prestacao.tipoDesconto },
        { label: "Observação", value: prestacao.observacao },
      ]}
    />
  )
}
