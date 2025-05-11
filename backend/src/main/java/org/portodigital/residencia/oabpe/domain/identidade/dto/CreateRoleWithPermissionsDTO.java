package org.portodigital.residencia.oabpe.domain.identidade.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateRoleWithPermissionsDTO {
    private String name;
    private List<PermissionEntry> permissions;

    @Data
    public static class PermissionEntry {
        private String moduleName;
        private PermissionName permissionName;
    }
}
