"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil, FileText, UserCog } from "lucide-react"; // Adicionei o ícone UserCog
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type ColumnDef,
  PaginationState,
} from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useUsuarios } from "@/hooks/useUsuario";
import { PaginationParams, Sort } from "@/types/paginacao";
import { UsuarioResponseDTO } from "@/types/usuario";

export default function UsuarioPage() {
  const { toast } = useToast();

  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
  });

  const [sort, setSort] = useState<Sort[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<PaginationParams["filters"]>({});

  const { data, isLoading, error, isEmpty, refetch } = useUsuarios({
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

  useEffect(() => {
    refetch();
  }, [pagination, refetch]);
  
  const columns: ColumnDef<UsuarioResponseDTO>[] = [
    {
      accessorKey: "name",
      header: "Nome",
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
                  href={`/usuarios/assign/${row?.id}`}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Atribuir</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/usuarios/edit/${row?.id}`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
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
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/usuarios/roles">
                <UserCog className="mr-2 h-4 w-4" />
                Gerenciar Cargos
              </Link>
            </Button>
            <Button asChild className="bg-secondary hover:bg-secondary/90">
              <Link href="/usuarios/new">
                <Plus className="mr-2 h-4 w-4" /> Novo Usuário
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Erro ao carregar usuários: {error.message}
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
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/usuarios/roles">
              <UserCog className="mr-2 h-4 w-4" />
              Gerenciar Cargos
            </Link>
          </Button>
          <Button asChild className="bg-secondary hover:bg-secondary/90">
            <Link href="/usuarios/new">
              <Plus className="mr-2 h-4 w-4" /> Novo Usuário
            </Link>
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-md border p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold">
            Nenhum usuário encontrado
          </h3>
          <p className="text-muted-foreground">
            Você ainda não cadastrou nenhum usuário
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/usuarios/roles">
                <UserCog className="mr-2 h-4 w-4" />
                Gerenciar Cargos
              </Link>
            </Button>
            <Button asChild>
              <Link href="/usuarios/new">
                <Plus className="mr-2 h-4 w-4" /> Criar primeiro usuário
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.content || []}
          loading={isLoading}
          searchPlaceholder="Buscar usuários..."
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