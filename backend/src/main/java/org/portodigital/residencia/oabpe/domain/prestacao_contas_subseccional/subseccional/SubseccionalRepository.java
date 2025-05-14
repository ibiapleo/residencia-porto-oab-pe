package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubseccionalRepository extends JpaRepository<Subseccional, Long> {
    Page<Subseccional> findBySubSeccionalContainingIgnoreCaseAndStatusTrue(String subSeccional, Pageable pageable);

    Optional<Subseccional> findBySubSeccionalIgnoreCase(String subSeccional);
}