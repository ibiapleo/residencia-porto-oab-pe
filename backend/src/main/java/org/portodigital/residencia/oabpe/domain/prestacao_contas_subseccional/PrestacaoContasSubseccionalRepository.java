package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PrestacaoContasSubseccionalRepository extends JpaRepository<PrestacaoContasSubseccional, Long> {

    @Query("""
           SELECT p FROM PrestacaoContasSubseccional p
           JOIN FETCH p.subseccional s
           WHERE p.status = true
    """)
    Page<PrestacaoContasSubseccional> findAllAtivos(Pageable pageable);
}