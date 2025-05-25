// hooks/usePermissions.ts
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type Permissions = {
  [modulo: string]: string[];
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permissions>({});

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ permissions: Permissions }>(token);
        setPermissions(decoded.permissions || {});
      } catch (err) {
        console.error("Erro ao decodificar token", err);
      }
    }
  }, []);

  const hasPermission = (modulo: string, role?: string) => {
    if (!permissions[modulo]) return false;
    if (role) return permissions[modulo].includes(role);
    return true;
  };

  return { permissions, hasPermission };
};
