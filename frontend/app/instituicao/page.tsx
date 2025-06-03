"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, FileText } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useSubseccionais } from "@/hooks/useSubseccionais";
import { PaginationParams, Sort } from "@/types/paginacao";
import { SubseccionalResponseDTO } from "@/types/subseccional";
import { excluirSubseccional } from "@/services/subseccionalService";
import { excluirInstituicao } from "@/services/instituicaoService";
import { InstituicaoResponseDTO } from "@/types/instituicao";
import { useInstituicoes } from "@/hooks/useInstituicoes";

export default function InstituicaoPage() {
  const { toast } = useToast();

  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const { data, isLoading, error, isEmpty, refetch } = useInstituicoes({
    page: pagination.page,
    size: pagination.pageSize,
    sort,
    filters,
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

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirInstituicao(id);
      toast({
        title: "Sucesso",
        description: "instituição excluída com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a instituição",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [pagination, refetch]);
  
  const columns: ColumnDef<InstituicaoResponseDTO>[] = [
    {
      accessorKey: "descricao",
      header: "Instituição",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => {
        return <span className="font-medium">{row.nome}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por instituição...",
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
                  href={`/instituicao/edit/${row.id}`}
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
                      permanentemente a instituição e removerá os dados de
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
          <h2 className="text-3xl font-bold tracking-tight">Instituições</h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/instituicao/new">
              <Plus className="mr-2 h-4 w-4" /> Nova Instituição
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar Instituições: {error.message}
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
        <h2 className="text-3xl font-bold tracking-tight">Instituições</h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/instituicao/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Instituição
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhuma Instituição encontrada
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhuma Instituição
          </p>
          <Button asChild>
            <Link href="/instituicao/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeira Instituição
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Cadastre ou atualize os dados das instituições participantes."
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
