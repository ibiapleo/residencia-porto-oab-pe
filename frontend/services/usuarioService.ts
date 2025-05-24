import { fetcher } from "@/lib/fetcher";
import {
  UsuarioResponseDTO,
  UsuarioRequestDTO,
  AtribuicaoRequestDTO,
  DetalhesUsuarioResponseDTO,
} from "@/types/usuario";
import { PaginationParams, Page } from "@/types/paginacao";
import { buildQuery } from "@/lib/query-builder";

export const getUsuarios = async (
  params: PaginationParams
): Promise<Page<UsuarioResponseDTO>> => {
  const query = buildQuery(params);
  return await fetcher<Page<UsuarioResponseDTO>>(`/users?${query}`);
};

export const registrarUsuario = async (
  data: UsuarioRequestDTO
): Promise<UsuarioResponseDTO> => {
  return fetcher<UsuarioResponseDTO>(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const atribuirCargoUsuario = async (
  data: AtribuicaoRequestDTO
): Promise<UsuarioResponseDTO> => {
  // Validação adicional antes de enviar
  if (
    !data.rolesId ||
    data.rolesId.length === 0 ||
    data.rolesId.some((id) => id <= 0)
  ) {
    throw new Error("IDs de cargo inválidos");
  }

  return fetcher<UsuarioResponseDTO>(`/users/assign-roles`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      roleIds: data.rolesId, // Ajuste para o campo que o backend espera
    }),
  });
};

export const getUsuarioById = async (
  id: string
): Promise<DetalhesUsuarioResponseDTO> => {
  return await fetcher<DetalhesUsuarioResponseDTO>(`/users/${id}`);
};
