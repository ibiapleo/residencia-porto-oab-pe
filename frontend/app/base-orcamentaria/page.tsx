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
import { BaseOrcamentariaResponseDTO } from "@/types/baseOrcamentaria";
import { useBaseOrcamentaria } from "@/hooks/useBaseOrcamentaria";
import { PaginationParams, Sort } from "@/types/paginacao";
import { excluirBaseOrcamentaria } from "@/services/baseOrcamentariaService";

export default function BaseOrcamentariaPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const { data, isLoading, error, isEmpty, refetch } = useBaseOrcamentaria({
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
      await excluirBaseOrcamentaria(id);
      toast({
        title: "Sucesso",
        description: "Base orçamentária excluída com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a base orçamentária",
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
    return date.toLocaleDateString("pt-BR", {
      timeZone: "UTC", // Força usar UTC
    });
  };

  const formatCurrency = (value: number) => {
    if (!value) return "-";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "true":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" /> Lançado
          </Badge>
        );
      case "inativo":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="h-3 w-3 mr-1" /> Inativo
          </Badge>
        );
      case "pendente":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <Clock className="h-3 w-3 mr-1" /> Desconhecido
          </Badge>
        );
    }
  };

  const columns: ColumnDef<BaseOrcamentariaResponseDTO>[] = [
    {
      accessorKey: "lancto",
      header: "Lançamento",
      enableSorting: true,
      enableFiltering: false,
      cell: ({ row }) => {
        return <span className="font-medium">{row.lancto}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por lançamento...",
      },
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => formatCurrency(row.valor),
      enableSorting: true,
      enableFiltering: false,
    },
    {
      accessorKey: "dtDocto",
      header: "Data Documento",
      cell: ({ row }) => formatDate(row.dtDocto),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtLancto",
      header: "Data Lançamento",
      cell: ({ row }) => formatDate(row.dtLancto),
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "ano",
      header: "Ano",
      enableSorting: true,
      enableFiltering: true,
      filter: {
        type: "text",
        placeholder: "Filtrar por ano...",
      },
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "text",
        placeholder: "Filtrar por tipo...",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.status),
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "select",
        options: [
          { label: "Ativo", value: "ativo" },
          { label: "Inativo", value: "inativo" },
          { label: "Pendente", value: "pendente" },
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
                  href={`/base-orcamentaria/${row.id.toString()}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/base-orcamentaria/edit/${row.id}`}
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
                      permanentemente a base orçamentária e removerá os dados de
                      nossos servidores.
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
            Bases Orçamentárias
          </h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/base-orcamentaria/new">
              <Plus className="mr-2 h-4 w-4" /> Nova Base
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar bases orçamentárias: {error.message}
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
          Bases Orçamentárias
        </h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/base-orcamentaria/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Base
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhuma base orçamentária encontrada
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhuma base orçamentária
          </p>
          <Button asChild>
            <Link href="/base-orcamentaria/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeira base
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Buscar bases orçamentárias..."
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
