package org.portodigital.residencia.oabpe.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.dto.PermissionName;
import org.portodigital.residencia.oabpe.domain.identidade.model.Module;
import org.portodigital.residencia.oabpe.domain.identidade.model.Permission;
import org.portodigital.residencia.oabpe.domain.identidade.model.Role;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.identidade.repository.ModuleRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.PermissionRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.RoleRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void createDefaultAdmin() {
        if (userRepository.findByUsername("admin").isPresent()) return;

        Module subseccionalModule = moduleRepository.findByName("modulo_subseccional")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_subseccional", new HashSet<>())));

        Module demonstrativoModule = moduleRepository.findByName("modulo_demonstrativos")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_demonstrativos", new HashSet<>())));

        Module instituicaoModule = moduleRepository.findByName("modulo_instituicoes")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_instituicoes", new HashSet<>())));

        Module baseOrcamentariaModule = moduleRepository.findByName("modulo_base_orcamentaria")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_base_orcamentaria", new HashSet<>())));

        Module transparenciaModule = moduleRepository.findByName("modulo_transparencia")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_transparencia", new HashSet<>())));

        Module balancetesCfoabModule = moduleRepository.findByName("modulo_balancetes_cfoab")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_balancetes_cfoab", new HashSet<>())));

        Module pagamentoCotasModule = moduleRepository.findByName("modulo_pagamento_cotas")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_pagamento_cotas", new HashSet<>())));

        Module prestacaoContasSubseccionalModule = moduleRepository.findByName("modulo_prestacao_contas_subseccional")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_prestacao_contas_subseccional", new HashSet<>())));

        Module gestaoUsuarios = moduleRepository.findByName("modulo_gestao_usuarios")
                .orElseGet(() -> moduleRepository.save(new Module(null, "modulo_gestao_usuarios", new HashSet<>())));

        Set<Permission> permissions = new HashSet<>();

        permissions.addAll(createPermissionsForModule(subseccionalModule));
        permissions.addAll(createPermissionsForModule(gestaoUsuarios));
        permissions.addAll(createPermissionsForModule(demonstrativoModule));
        permissions.addAll(createPermissionsForModule(instituicaoModule));
        permissions.addAll(createPermissionsForModule(baseOrcamentariaModule));
        permissions.addAll(createPermissionsForModule(transparenciaModule));
        permissions.addAll(createPermissionsForModule(balancetesCfoabModule));
        permissions.addAll(createPermissionsForModule(pagamentoCotasModule));
        permissions.addAll(createPermissionsForModule(prestacaoContasSubseccionalModule));

        Role adminRole = roleRepository.findByName("ADMINISTRADOR")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ADMINISTRADOR");
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                });

        User admin = new User();
        admin.setName("Administrador do Sistema");
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.getRoles().add(adminRole);
        userRepository.save(admin);
    }

    private Set<Permission> createPermissionsForModule(Module module) {
        Set<Permission> permissions = new HashSet<>();

        Permission adminPermission = permissionRepository.findByNameAndModule(PermissionName.ADMIN, module)
                .orElseGet(() -> {
                    Permission p = new Permission();
                    p.setName(PermissionName.ADMIN);
                    p.setModule(module);
                    return permissionRepository.save(p);
                });

        permissions.add(adminPermission);
        return permissions;
    }
}
