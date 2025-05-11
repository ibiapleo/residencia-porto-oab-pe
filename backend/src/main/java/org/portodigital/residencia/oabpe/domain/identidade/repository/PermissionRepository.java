package org.portodigital.residencia.oabpe.domain.identidade.repository;

import org.portodigital.residencia.oabpe.domain.identidade.dto.PermissionName;
import org.portodigital.residencia.oabpe.domain.identidade.model.Module;
import org.portodigital.residencia.oabpe.domain.identidade.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByNameAndModule(PermissionName name, Module module);
}