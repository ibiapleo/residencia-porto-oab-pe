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
import { PaginationParams, Sort } from "@/types/paginacao";
import { DescontoResponseDTO } from "@/types/tipoDesconto";
import { excluirDesconto } from "@/services/tipoDescontoService";
import { useTiposDesconto } from "@/hooks/useTiposDesconto";

export default function DescontoPage() {
  const { toast } = useToast();

  // Estado da paginação
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  // Estados para ordenação, loading e modais
  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  // Hook personalizado para buscar descontos
  const { data, isLoading, error, isEmpty, refetch } = useTiposDesconto({
    page: pagination.page,
    size: pagination.pageSize,
    sort,
    filters,
  });

  // Handler para mudança de paginação
  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPagination(prev => {
      if (prev.page !== newPagination.page || prev.pageSize !== newPagination.pageSize) {
        return newPagination;
      }
      return prev;
    });
  }, []);

  // Handler para deletar desconto
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await excluirDesconto(id);
      toast({
        title: "Sucesso",
        description: "Desconto excluído com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir o desconto",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  // Atualiza os dados quando a paginação muda
  useEffect(() => {
    refetch();
  }, [pagination, refetch]);

  // Definição das colunas da tabela
  const columns: ColumnDef<DescontoResponseDTO>[] = [
    {
      accessorKey: "nome",
      header: "Desconto",
      enableSorting: true,
      enableFiltering: true,
      cell: ({ row }) => {
        return <span className="font-medium">{row.nome}</span>;
      },
      filter: {
        type: "text",
        placeholder: "Filtrar por desconto...",
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
                <Link href={`/tipos-desconto/edit/${row.id}`} className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Essa ação não pode ser desfeita. Isso excluirá permanentemente
                      o desconto e removerá os dados de nossos servidores.
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

  // Tratamento de erro
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Descontos</h2>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/descontos/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Desconto
            </Link>
          </Button>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar descontos: {error.message}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Descontos</h2>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link href="/tipos-desconto/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Desconto
          </Link>
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Nenhum desconto encontrado</h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhum desconto
          </p>
          <Button asChild>
            <Link href="/descontos/new">
              <Plus className="mr-2 h-4 w-4" /> Criar primeiro desconto
            </Link>
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Visualize os tipos de desconto aplicáveis nos registros financeiros."
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