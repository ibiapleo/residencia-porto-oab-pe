package org.portodigital.residencia.oabpe.infra.security;

import org.portodigital.residencia.oabpe.domain.user.User;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication auth, Object targetModule, Object permissionName) {
        if (auth == null || targetModule == null || permissionName == null) return false;

        String module = targetModule.toString();
        String action = permissionName.toString();

        User user = (User) auth.getPrincipal();

        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .anyMatch(permission ->
                        permission.getName().name().equalsIgnoreCase("ADMIN") ||
                        (
                                permission.getModule().getName().equalsIgnoreCase(module) &&
                                permission.getName().name().equalsIgnoreCase(action)
                        )
                );
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return false;
    }
}
