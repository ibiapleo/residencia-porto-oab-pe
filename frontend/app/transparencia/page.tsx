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
import { TransparenciaResponseDTO } from "@/types/transparencia";
import { useTransparencia } from "@/hooks/useTransparencia";
import { PaginationParams, Sort } from "@/types/paginacao";
import { excluirTransparencia } from "@/services/transparenciaService";

export default function TransparenciaPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const { data, isLoading, error, isEmpty, refetch } = useTransparencia({
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
      await excluirTransparencia(id);
      toast({
        title: "Sucesso",
        description: "Registro de transparência excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o registro de transparência",
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

  const getStatusBadge = (transparencia: TransparenciaResponseDTO) => {
    if (!transparencia.dtEntrega) {
      const prevDate = new Date(transparencia.dtPrevEntr);
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

    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="h-3 w-3 mr-1" /> Entregue
      </Badge>
    );
  };

  const columns: ColumnDef<TransparenciaResponseDTO>[] = [
    {
      accessorKey: "nomeDemonstrativo",
      header: "Demonstrativo",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => {
        return <span className="font-medium">{row.nomeDemonstrativo}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por demonstrativo...",
      },
    },
    {
      accessorKey: "referencia",
      header: "Referência",
      cell: ({ row }) => `${row.referencia}/${row.ano}`,
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "text",
        placeholder: "Filtrar por referência...",
      },
    },
    {
      accessorKey: "periodicidade",
      header: "Periodicidade",
      cell: ({ row }) => row.periodicidade,
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "select",
        options: [
          { label: "Mensal", value: "MENSAL" },
          { label: "Bimestral", value: "BIMESTRAL" },
          { label: "Trimestral", value: "TRIMESTRAL" },
          { label: "Semestral", value: "SEMESTRAL" },
          { label: "Anual", value: "ANUAL" },
        ],
      },
    },
    {
      accessorKey: "dtPrevEntr",
      header: "Prev. Entrega",
      cell: ({ row }) => row.dtPrevEntr,
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtEntrega",
      header: "Entrega",
      cell: ({ row }) => row.dtEntrega ?? null,
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
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
          { label: "Entregue", value: "entregue" },
          { label: "Pendente", value: "pendente" },
          { label: "Atrasado", value: "atrasado" },
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
                  href={`/transparencia/${row.id.toString()}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/transparencia/edit/${row.id}`}
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
                      permanentemente o registro de transparência e removerá os dados
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
            Transparência
          </h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/transparencia/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Registro
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar registros de transparência: {error.message}
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
          Transparência
        </h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/transparencia/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Registro
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhum registro encontrado
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhum demonstrativo de transparência
          </p>
          <Button asChild>
            <Link href="/transparencia/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeiro registro
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Buscar demonstrativos..."
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