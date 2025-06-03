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
import { BalanceteResponseDTO } from "@/types/balancete";
import { useBalancete } from "@/hooks/useBalancete";
import { PaginationParams, Sort } from "@/types/paginacao";
import { deleteBalancete, uploadBalancete } from "@/services/balanceteService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileImport } from "@/components/file-import";
import { BalanceteDownloadButton } from "@/components/BalanceteDownloadButton";

export default function BalancetePage() {
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort[]>([]); // { field, direction }
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

  const { data, isLoading, error, isEmpty, refetch } = useBalancete({
    page: pagination.page, // Use o estado controlado
    size: pagination.pageSize, // Adicione o pageSize
    sort,
    filters,
  });

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteBalancete(id);
      toast({
        title: "Sucesso",
        description: "Balancete excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o balancete",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  const getStatusBadge = (balancete: BalanceteResponseDTO) => {
    if (!balancete.dtEntr) {
      const prevDate = new Date(balancete.dtPrevEntr);
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

  const columns: ColumnDef<BalanceteResponseDTO>[] = [
    {
      accessorKey: "nomeDemonstrativo",
      header: "Demonstrativo",
      enableSorting: false,
      enableFiltering: false,
      filter: {
        type: "text",
        placeholder: "Filtrar por Demonstrativo...",
      },
    },
    {
      accessorKey: "ano",
      header: "Ano",
      enableSorting: ["ano"],
      enableFiltering: true,
      filter: {
        type: "select",
        options: [
          { label: "2022", value: "2022" },
          { label: "2023", value: "2023" },
          { label: "2024", value: "2024" },
          { label: "2025", value: "2025" },
        ],
      },
    },
    {
      accessorKey: "periodicidade",
      header: "Periodicidade",
      enableSorting: false,
      enableFiltering: true,
      cell: ({ row }) => {
        const periodicidade = row?.periodicidade;
        if (!periodicidade) return "-";

        const map: Record<string, string> = {
          MENSAL: "Mensal",
          TRIMESTRAL: "Trimestral",
          SEMESTRAL: "Semestral",
          ANUAL: "Anual",
        };

        return map[periodicidade] || periodicidade;
      },
    },
    {
      accessorKey: "dtPrevEntr",
      header: "Prev. Entrega",
      cell: ({ row }) => `${row?.dtPrevEntr ?? "-"}`,
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "dtEntr",
      header: "Entrega",
      cell: ({ row }) => `${row?.dtEntr ?? "-"}`,
      enableSorting: true,
      enableFiltering: false,
      filter: {
        type: "dateRange",
      },
    },
    {
      accessorKey: "eficiencia",
      header: "Atraso",
      cell: ({ row }) => `${row?.eficiencia ?? 0}`,
      enableSorting: true,
      enableFiltering: false,
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
          { label: "Entregue", value: "entregue" },
          { label: "Pendente", value: "pendente" },
          { label: "Atrasado", value: "atrasado" },
        ].filter((option) => option.value && option.value.trim() !== ""),
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
                  href={`/balancete/${row.id.toString()}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/balancete/edit/${row?.id}`}
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
                      permanentemente o balancete e removerá os dados de nossos
                      servidores.
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
          <h2 className="text-3xl font-bold tracking-tight">Balancetes</h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/balancete/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Balancete
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar balancetes: {error.message}
          </p>
          <Button variant="outline" className="mt-2">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Balancete CFOAB</h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/balancete/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Balancete
          </Link>
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data?.content || []}
        loading={isLoading}
        searchPlaceholder="Acompanhe os balancetes financeiros consolidados por período."
        enableServerSidePagination
        totalCount={data?.totalElements}
        onSortChange={setSort}
        onFilterChange={setFilters}
        onPaginationChange={handlePaginationChange} // Adicione esta linha
        controlledPaginationState={pagination} // Adicione esta linha
        pageSizeOptions={[10, 20, 50]}
        refetch={refetch} // Adicione esta linha para garantir atualizações
      />
    </div>
  );
}
