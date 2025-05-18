package org.portodigital.residencia.oabpe.domain.identidade.service;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.dto.CreateRoleWithPermissionsDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.RoleDetailsDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.RoleResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.Module;
import org.portodigital.residencia.oabpe.domain.identidade.model.Permission;
import org.portodigital.residencia.oabpe.domain.identidade.model.Role;
import org.portodigital.residencia.oabpe.domain.identidade.repository.ModuleRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.PermissionRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.RoleRepository;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final ModuleRepository moduleRepository;
    private final PermissionRepository permissionRepository;
    private final ModelMapper modelMapper;

    public RoleDetailsDTO createWithPermissions(CreateRoleWithPermissionsDTO dto) {
        Set<Permission> permissions = new HashSet<>();

        for (CreateRoleWithPermissionsDTO.PermissionEntry entry : dto.getPermissions()) {
            Module module = moduleRepository.findByName(entry.getModuleName())
                    .orElseGet(() -> {
                        Module newModule = new Module();
                        newModule.setName(entry.getModuleName());
                        return moduleRepository.save(newModule);
                    });

            Permission permission = permissionRepository
                    .findByNameAndModule(entry.getPermissionName(), module)
                    .orElseGet(() -> {
                        Permission newPermission = new Permission();
                        newPermission.setName(entry.getPermissionName());
                        newPermission.setModule(module);
                        return permissionRepository.save(newPermission);
                    });

            permissions.add(permission);
        }

        Role role = new Role();
        role.setName(dto.getName());
        role.setPermissions(permissions);
        Role saved = roleRepository.save(role);

        return buildRoleDetailsDTO(saved);
    }

    public Page<RoleResponseDTO> getAll(Pageable pageable) {
        return roleRepository.findAll(pageable)
                .map(role -> modelMapper.map(role, RoleResponseDTO.class));
    }

    public RoleDetailsDTO getById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Role não encontrada"));

        return buildRoleDetailsDTO(role);
    }

    private RoleDetailsDTO buildRoleDetailsDTO(Role role) {
        RoleDetailsDTO dto = new RoleDetailsDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());

        Map<String, List<String>> grouped = role.getPermissions().stream()
                .collect(Collectors.groupingBy(
                        p -> p.getModule().getName(),
                        Collectors.mapping(p -> p.getName().name(), Collectors.toList())
                ));

        dto.setPermissions(grouped);
        return dto;
    }
}
