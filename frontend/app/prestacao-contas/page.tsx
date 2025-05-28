"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Pencil,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
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
import { PrestacaoContasSubseccionalResponseDTO } from "@/types/prestacaoContas";
import { usePrestacaoContas } from "@/hooks/usePrestacaoContas";
import { PaginationParams, Sort } from "@/types/paginacao";
import { excluirPrestacaoContas } from "@/services/prestacaoContasService";

export default function PrestacaoContasPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: 10,
  });

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
      setPage(newPagination.page);
    },
    []
  );
  
  const { data, isLoading, error, isEmpty, refetch } = usePrestacaoContas({
    page: pagination.page,
    size: pagination.pageSize,
    sort,
    filters,
  });

  

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirPrestacaoContas(id);
      toast({
        title: "Sucesso",
        description: "Prestação de contas excluída com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a prestação de contas",
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

  const getStatusBadge = (
    prestacao: PrestacaoContasSubseccionalResponseDTO
  ) => {
    if (!prestacao.dtEntrega) {
      const prevDate = new Date(prestacao.dtPrevEntr);
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

    if (!prestacao.dtPagto) {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-3 w-3 mr-1" /> Entregue
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-3 w-3 mr-1" /> Concluído
      </Badge>
    );
  };

  const columns: ColumnDef<PrestacaoContasSubseccionalResponseDTO>[] = [
    {
      accessorKey: "subseccional",
      header: "Subseccional",
      enableSorting: true,
      enableFiltering: false,
      cell: ({ row }) => {
        return <span className="font-medium">{row.subseccional}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por subseccional...",
      },
    },
    {
      accessorKey: "tipoDesconto",
      header: "Tipo de Desconto",
      cell: ({ row }) =>
        row?.tipoDesconto ? (
          <span className="font-medium">{row.tipoDesconto}</span>
        ) : (
          "-"
        ),
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "text",
        placeholder: "Filtrar por desconto...",
      },
    },
    {
      accessorKey: "referencia",
      header: "Referência",
      cell: ({ row }) => `${row.mesReferencia}/${row.ano}`,
      enableSorting: false,
      enableFiltering: false,
      filter: {
        type: "text",
        placeholder: "Filtrar por referência...",
      },
    },
    {
      accessorKey: "dtPrevEntr",
      header: "Prev. Entrega",
      cell: ({ row }) => formatDate(row.dtPrevEntr),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtEntrega",
      header: "Entrega",
      cell: ({ row }) => formatDate(row.dtEntrega),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtPagto",
      header: "Pagamento",
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
      accessorKey: "protocoloSGD",
      header: "Protocolo",
      cell: ({ row }) => row.protocoloSGD || "-",
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "text",
        placeholder: "Filtrar por protocolo...",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row),
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "select",
        options: [
          { label: "Concluído", value: "concluido" },
          { label: "Pendente", value: "pendente" },
          { label: "Atrasado", value: "atrasado" },
          { label: "Entregue", value: "entregue" },
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
                  href={`/prestacao-contas/${row.id.toString()}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/prestacao-contas/edit/${row.id}`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive "
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
                      permanentemente a prestação de contas e removerá os dados
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
            Prestações de Contas
          </h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/prestacao-contas/new">
              <Plus className="mr-2 h-4 w-4" /> Nova Prestação
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar prestações de contas: {error.message}
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
          Prestações de Contas
        </h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/prestacao-contas/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Prestação
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhuma prestação encontrada
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhuma prestação de contas
          </p>
          <Button asChild>
            <Link href="/prestacao-contas/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeira prestação
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
        columns={columns}
        data={data?.content || []}
        loading={isLoading}
        searchPlaceholder="Buscar Prestações..."
        enableServerSidePagination
        totalCount={data?.totalElements}
        onSortChange={setSort}
        onFilterChange={setFilters}
        onPaginationChange={handlePaginationChange} // Adicione esta linha
        controlledPaginationState={pagination} // Adicione esta linha
        pageSizeOptions={[10, 20, 50]}
        refetch={refetch} // Adicione esta linha para garantir atualizações
      />
      )}
    </div>
  );
}
