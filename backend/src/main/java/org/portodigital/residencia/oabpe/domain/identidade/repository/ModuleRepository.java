package org.portodigital.residencia.oabpe.domain.identidade.repository;

import org.portodigital.residencia.oabpe.domain.identidade.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ModuleRepository extends JpaRepository<org.portodigital.residencia.oabpe.domain.identidade.model.Module, Long> {
    Optional<Module> findByName(String name);
}
