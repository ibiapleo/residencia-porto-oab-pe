export type CargoResponseDTO = {
    id: number;
    name: string;
}

export type Permission = {
  moduleName: string;
  permissionName: "ADMIN" | "LEITURA" | "ESCRITA"
};

export type CargoRequestDTO = {
  name: string;
  permissions: Permission[];
};