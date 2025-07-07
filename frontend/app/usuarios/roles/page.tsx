"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type ColumnDef,
  PaginationState,
  SortingState,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useCargo } from "@/hooks/useCargos";
import { PaginationParams, Sort } from "@/types/paginacao";
import { CargoResponseDTO } from "@/types/cargo";
import { useRouter } from "next/navigation";

export default function CargoPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const { data, isLoading, error, isEmpty, refetch } = useCargo({
    page: pagination.page,
    size: pagination.pageSize,
    sort,
  });

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      setPagination((prev) => {
        if (
          prev.page !== newPagination.page ||
          prev.pageSize !== newPagination.pageSize
        ) {
          return newPagination;
        }
        return prev;
      });
    },
    []
  );

  useEffect(() => {
    refetch();
  }, [pagination, refetch]);

  const columns: ColumnDef<CargoResponseDTO>[] = [
    {
      accessorKey: "name",
      header: "Nome do Cargo",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => {
        return <span className="font-medium">{row?.name}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por nome...",
      },
    },
  ];

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Cargos</h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/cargos/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Cargo
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar cargos: {error.message}
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
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Cargos</h2>
        </div>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/usuarios/roles/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Cargo
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Nenhum cargo encontrado</h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhum cargo
          </p>
          <Button asChild>
            <Link href="/cargos/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeiro cargo
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Buscar cargos..."
          enableServerSidePagination
          totalCount={data?.totalElements}
          onSortChange={setSort}
          controlledPaginationState={pagination}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50]}
        />
      )}
    </div>
  );
}
