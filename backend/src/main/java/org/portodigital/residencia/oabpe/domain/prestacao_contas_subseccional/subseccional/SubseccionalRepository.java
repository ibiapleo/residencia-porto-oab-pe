package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SubseccionalRepository extends JpaRepository<Subseccional, Long> {
    Page<Subseccional> findBySubSeccionalContainingIgnoreCaseAndStatusTrue(String subSeccional, Pageable pageable);

    Optional<Subseccional> findBySubSeccionalIgnoreCase(String subSeccional);

    @Query("SELECT s FROM Subseccional s WHERE s.status = true AND s.subSeccional = :subseccional")
    Optional<Subseccional> findByNomeAtivo(String subseccional);
}