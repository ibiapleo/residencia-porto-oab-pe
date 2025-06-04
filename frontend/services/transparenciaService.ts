import { fetcher } from "@/lib/fetcher"
import type { TransparenciaResponseDTO, TransparenciaRequestDTO } from "@/types/transparencia"
import type { PaginationParams, Page } from "@/types/paginacao"
import { buildQuery } from "@/lib/query-builder"
import { User } from "@/types/auth";

export const getTransparencias = async (params: PaginationParams): Promise<Page<TransparenciaResponseDTO>> => {
  const query = buildQuery(params)
  return await fetcher<Page<TransparenciaResponseDTO>>(`/transparencia?${query}`)
}

export const criarTransparencia = async (data: TransparenciaRequestDTO): Promise<TransparenciaResponseDTO> => {
  return fetcher<TransparenciaResponseDTO>("/transparencia", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getTransparenciaById = async (id: string): Promise<TransparenciaResponseDTO> => {
  return await fetcher<TransparenciaResponseDTO>(`/transparencia/${id}`)
}

export const uploadTransparencia = async (file: File): Promise<TransparenciaResponseDTO> => {
  const formData = new FormData()
  formData.append("file", file)

  return fetcher<TransparenciaResponseDTO>("/transparencia/upload", {
    method: "POST",
    body: formData,
  })
}

export const atualizarTransparencia = async (
  id: string,
  data: TransparenciaRequestDTO,
): Promise<TransparenciaResponseDTO> => {
  return fetcher<TransparenciaResponseDTO>(`/transparencia/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const excluirTransparencia = async (id: string): Promise<void> => {
  return fetcher<void>(`/transparencia/${id}`, {
    method: "DELETE",
  })
}

const formatDate = (date?: string | null) => (date ? new Date(date).toLocaleDateString("pt-BR") : "-")

export const downloadTransparenciaPDF = async (
    filters: PaginationParams["filters"],
    user: User
  ): Promise<void> => {
  try {
    if (typeof window === "undefined") {
      return
    }

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")])

    const params: PaginationParams = {
      page: 0,
      size: 999999,
      sort: [],
      filters: {
        ...filters,
        download: true,
      },
    }

    const response = await getTransparencias(params)
    const data: TransparenciaResponseDTO[] = response || []

    if (!data.length) {
      throw new Error("Nenhum registro encontrado para gerar o PDF.")
    }

    // Criar nova instância do PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Cores da OAB
    const oabBlue = [0, 51, 153] // Azul OAB
    const oabRed = [204, 0, 0] // Vermelho OAB
    const lightGray = [245, 245, 245]

    // === CABEÇALHO ===
    // Fundo azul do cabeçalho
    doc.setFillColor(...oabBlue)
    doc.rect(0, 0, pageWidth, 35, "F")

    // Logo OAB (simulada com texto estilizado)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("OAB", 15, 15)

    // Texto "ORDEM DOS ADVOGADOS DO BRASIL"
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("ORDEM DOS ADVOGADOS DO BRASIL", 15, 25)

    // Logo "EM DEFESA DA ADVOCACIA" (lado direito)
    doc.setFillColor(...oabRed)
    doc.rect(pageWidth - 60, 8, 50, 20, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont("helvetica", "bold")
    doc.text("EM DEFESA DA", pageWidth - 55, 15)
    doc.text("ADVOCACIA", pageWidth - 55, 22)

    // === TÍTULO PRINCIPAL ===
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    const title = "Relatório de Transparência"
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, 50)

    // Linha decorativa abaixo do título
    doc.setDrawColor(...oabBlue)
    doc.setLineWidth(1)
    doc.line(20, 55, pageWidth - 20, 55)

    // === INFORMAÇÕES DO RELATÓRIO ===
    let currentY = 70

    // Data de geração
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80, 80, 80)
    doc.text(
      `Data de Geração: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
      20,
      currentY,
    )
    currentY += 8

    // Usuário responsável
    if (user?.sub) {
      doc.text(`Emitido por: ${user.sub}`, 20, currentY)
      currentY += 8
    }

    // Filtros aplicados
    const appliedFilters = Object.entries(filters)
      .filter(([key, value]) => value && key !== "download")
      .map(([key, value]) => {
        // Traduzir nomes dos filtros para português
        const filterNames: Record<string, string> = {
          nomeDemonstrativo: "Demonstrativo",
          referencia: "Referência",
          periodicidade: "Periodicidade",
          status: "Status",
          dtPrevEntr: "Data Prev. Entrega",
          dtEntrega: "Data Entrega",
        }
        return `${filterNames[key] || key}: ${value}`
      })

    if (appliedFilters.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("Filtros Aplicados:", 20, currentY)
      currentY += 6

      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      appliedFilters.forEach((filter) => {
        doc.text(`• ${filter}`, 25, currentY)
        currentY += 5
      })
      currentY += 5
    }

    // === RESUMO ESTATÍSTICO ===
    const totalRegistros = data.length
    const entregues = data.filter((item) => item.dtEntrega).length
    const pendentes = data.filter((item) => !item.dtEntrega && new Date(item.dtPrevEntr) >= new Date()).length
    const atrasados = data.filter((item) => !item.dtEntrega && new Date(item.dtPrevEntr) < new Date()).length

    // Caixa de resumo
    doc.setFillColor(...lightGray)
    doc.rect(20, currentY, pageWidth - 40, 25, "F")
    doc.setDrawColor(...oabBlue)
    doc.rect(20, currentY, pageWidth - 40, 25, "S")

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text("RESUMO ESTATÍSTICO", 25, currentY + 8)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Total: ${totalRegistros}`, 25, currentY + 15)
    doc.text(`Entregues: ${entregues}`, 70, currentY + 15)
    doc.text(`Pendentes: ${pendentes}`, 120, currentY + 15)
    doc.text(`Atrasados: ${atrasados}`, 170, currentY + 15)

    currentY += 35

    // === TABELA DE DADOS ===
    const tableData = data.map((item) => [
      item.nomeDemonstrativo || "-",
      `${item.referencia}/${item.ano}`,
      item.periodicidade || "-",
      formatDate(item.dtPrevEntr),
      formatDate(item.dtEntrega),
      getStatusText(item),
    ])

    autoTable(doc, {
      head: [["Demonstrativo", "Referência", "Periodicidade", "Prev. Entrega", "Entrega", "Status"]],
      body: tableData,
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: oabBlue,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 45, halign: "left" }, // Demonstrativo
        1: { cellWidth: 25, halign: "center" }, // Referência
        2: { cellWidth: 30, halign: "center" }, // Periodicidade
        3: { cellWidth: 25, halign: "center" }, // Prev. Entrega
        4: { cellWidth: 25, halign: "center" }, // Entrega
        5: {
          cellWidth: 20,
          halign: "center",
          // Colorir status
          didParseCell: (data: any) => {
            if (data.row.index >= 0) {
              // Não é cabeçalho
              const status = data.cell.text[0]
              if (status === "Entregue") {
                data.cell.styles.textColor = [0, 128, 0] // Verde
                data.cell.styles.fontStyle = "bold"
              } else if (status === "Atrasado") {
                data.cell.styles.textColor = [204, 0, 0] // Vermelho
                data.cell.styles.fontStyle = "bold"
              } else if (status === "Pendente") {
                data.cell.styles.textColor = [255, 140, 0] // Laranja
                data.cell.styles.fontStyle = "bold"
              }
            }
          },
        },
      },
      margin: { top: 10, right: 20, bottom: 20, left: 20 },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.5,
    })

    // === RODAPÉ ===
    const finalY = (doc as any).lastAutoTable.finalY || currentY + 50

    // Linha separadora
    doc.setDrawColor(...oabBlue)
    doc.setLineWidth(0.5)
    doc.line(20, finalY + 10, pageWidth - 20, finalY + 10)

    // Informações do rodapé
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)

    const footerY = finalY + 18
    doc.text(`Total de registros: ${totalRegistros}`, 20, footerY)
    doc.text(`Página 1 de 1`, pageWidth - 40, footerY)

    // Texto de confidencialidade (inspirado na imagem)
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    const confidentialText =
      "CONFIDENCIAL - Dados para fins exclusivos e estritamente institucionais, de acordo com Art. 7º da Lei 13.709 (Lei Geral de Proteção de Dados Pessoais)"
    const textWidth = doc.getTextWidth(confidentialText)
    doc.text(confidentialText, (pageWidth - textWidth) / 2, footerY + 8)

    // Fazer download do PDF
    const fileName = `relatorio-transparencia-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    throw error
  }
}

export function getStatusText(item: TransparenciaResponseDTO): string {
  if (!item.dtEntrega) {
    const prevDate = new Date(item.dtPrevEntr)
    const today = new Date()
    return today > prevDate ? "Atrasado" : "Pendente"
  }
  return "Entregue"
}
