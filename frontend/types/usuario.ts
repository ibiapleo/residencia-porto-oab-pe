import { Permission } from "./cargo";


export type UsuarioRequestDTO = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type UsuarioResponseDTO = {
  id: string;
  name: string;
};
export type AtribuicaoRequestDTO = {
  userId: string;
  rolesId: number[];
};

export type DetalhesUsuarioResponseDTO = {
  id: string;
  name: string;
  username: string;
  roles: number[];
  permissions: Permission[];
};
