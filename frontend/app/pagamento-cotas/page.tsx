"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type ColumnDef,
  PaginationState,
  SortingState,
  FilterState,
} from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { PagamentoCotasResponseDTO } from "@/types/pagamentoCotas";
import { usePagamentoCotas } from "@/hooks/usePagamentoCotas";
import { PaginationParams, Sort } from "@/types/paginacao";
import { excluirPagamentoCotas } from "@/services/pagamentoCotasService";

export default function PagamentoCotasPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const { data, isLoading, error, isEmpty, refetch } = usePagamentoCotas({
    page: 0,
    size: 10,
    sort,
    filters,
  });

  const handlePaginationChange = (pagination: PaginationState) => {
    setPage(pagination.page);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirPagamentoCotas(id);
      toast({
        title: "Sucesso",
        description: "Pagamento de cotas excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o pagamento de cotas",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    if (!value) return "-";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (pagamento: PagamentoCotasResponseDTO) => {
    if (!pagamento.status) {
      const prevDate = new Date(pagamento.dtPrevEntr);
      const today = new Date();

      if (today > prevDate) {
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" /> Atrasado
          </Badge>
        );
      }
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="h-3 w-3 mr-1" /> Pendente
        </Badge>
      );
    }

    if (!pagamento.dtPagto) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-3 w-3 mr-1" /> Aguardando pagamento
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-3 w-3 mr-1" /> Concluído
      </Badge>
    );
  };

  const columns: ColumnDef<PagamentoCotasResponseDTO>[] = [
    {
      accessorKey: "instituicaoId",
      header: "Instituição",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => {
        return <span className="font-medium">Instituição {row.instituicaoId}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por instituição...",
      },
    },
    {
      accessorKey: "referencia",
      header: "Referência",
      cell: ({ row }) => `${row.mesReferencia}/${row.ano}`,
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "text",
        placeholder: "Filtrar por referência...",
      },
    },
    {
      accessorKey: "dtPrevEntr",
      header: "Prev. Pagamento",
      cell: ({ row }) => formatDate(row.dtPrevEntr),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtPagto",
      header: "Data Pagamento",
      cell: ({ row }) => formatDate(row.dtPagto),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "valorDuodecimo",
      header: "Valor Dúodecimo",
      cell: ({ row }) => formatCurrency(row.valorDuodecimo),
      enableSorting: true,
      enableFiltering: false,
    },
    {
      accessorKey: "valorDesconto",
      header: "Desconto",
      cell: ({ row }) => formatCurrency(row.valorDesconto),
      enableSorting: true,
      enableFiltering: false,
    },
    {
      accessorKey: "valorPago",
      header: "Valor Pago",
      cell: ({ row }) => formatCurrency(row.valorPago),
      enableSorting: true,
      enableFiltering: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "select",
        options: [
          { label: "Concluído", value: "concluido" },
          { label: "Pendente", value: "pendente" },
          { label: "Atrasado", value: "atrasado" },
          { label: "Aguardando pagamento", value: "aguardando" },
        ],
      },
    },
    {
      accessorKey: "actions",
      header: "Ações",
      enableSorting: false,
      enableFiltering: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/pagamento-cotas/${row.id.toString()}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/pagamento-cotas/edit/${row.id}`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Você tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser desfeita. Isso excluirá
                      permanentemente o pagamento de cotas e removerá os dados
                      de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isDeleting}
                      onClick={() => handleDelete(row.id.toString())}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Pagamentos de Cotas
          </h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/pagamento-cotas/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar pagamentos de cotas: {error.message}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Pagamentos de Cotas
        </h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/pagamento-cotas/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhum pagamento encontrado
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhum pagamento de cotas
          </p>
          <Button asChild>
            <Link href="/pagamento-cotas/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeiro pagamento
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Visualize os registros de pagamento de cotas pelas subseções."
          enableServerSidePagination
          totalCount={data?.totalElements}
          onSortChange={setSort}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
}