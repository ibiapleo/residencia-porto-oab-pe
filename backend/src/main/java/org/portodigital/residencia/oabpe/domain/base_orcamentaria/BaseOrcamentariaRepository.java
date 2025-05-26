package org.portodigital.residencia.oabpe.domain.base_orcamentaria;

import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaFilteredRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BaseOrcamentariaRepository extends JpaRepository<BaseOrcamentaria, Long> {

    @Query("SELECT b FROM BaseOrcamentaria b WHERE b.status = true")
    Page<BaseOrcamentaria> findAllActive(Pageable pageable);

    @Query("""
        SELECT b
        FROM BaseOrcamentaria b
        WHERE  (:#{#filter.lancto} IS NULL OR LOWER(b.lancto) LIKE LOWER(CONCAT('%', :#{#filter.lancto}, '%')))
          AND (:#{#filter.valor} IS NULL OR b.valor = :#{#filter.valor})
          AND (:#{#filter.dtDocto} IS NULL OR b.dtDocto = :#{#filter.dtDocto})
          AND (:#{#filter.dtLancto} IS NULL OR b.dtLancto = :#{#filter.dtLancto})
          AND (:#{#filter.ano} IS NULL OR b.ano = :#{#filter.ano})
          AND (:#{#filter.tipo} IS NULL OR LOWER(b.tipo) LIKE LOWER(CONCAT('%', :#{#filter.tipo}, '%')))
          AND b.status = true
    """)
    Page<BaseOrcamentaria> findAllActiveByFilter(@Param("filter") BaseOrcamentariaFilteredRequest filter, Pageable pageable);
}
