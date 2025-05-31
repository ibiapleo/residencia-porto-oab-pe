package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABFilteredRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BalanceteCFOABRepository extends JpaRepository<BalanceteCFOAB, Long> {

    @Query("SELECT b FROM BalanceteCFOAB b WHERE b.status = true")
    Page<BalanceteCFOAB> findAllActive(Pageable pageable);

    @Query("""
    SELECT b
    FROM BalanceteCFOAB b
    LEFT JOIN FETCH b.demonstrativo d
    WHERE b.status = true
    AND (:#{#filter.demonstrativo} IS NULL OR LOWER(d.nome) LIKE LOWER(CONCAT('%', :#{#filter.demonstrativo}, '%')))
    AND (:#{#filter.referencia} IS NULL OR LOWER(b.referencia) LIKE LOWER(CONCAT('%', :#{#filter.referencia}, '%')))
    AND (:#{#filter.ano} IS NULL OR LOWER(b.ano) LIKE LOWER(CONCAT('%', :#{#filter.ano}, '%')))
    AND (:#{#filter.periodicidade} IS NULL OR LOWER(b.periodicidade) LIKE LOWER(CONCAT('%', :#{#filter.periodicidade}, '%')))
    AND (:#{#filter.dtPrevEntr} IS NULL OR b.dtPrevEntr = :#{#filter.dtPrevEntr})
    AND (:#{#filter.dtEntr} IS NULL OR b.dtEntr = :#{#filter.dtEntr})
    """)
    Page<BalanceteCFOAB> findAllActiveByFilter(@Param("filter")BalanceteCFOABFilteredRequest filter, Pageable pageable);

    @Query("""
    SELECT b
    FROM BalanceteCFOAB b
    LEFT JOIN FETCH b.demonstrativo d
    WHERE b.status = true
    AND (:#{#filter.demonstrativo} IS NULL OR LOWER(d.nome) LIKE LOWER(CONCAT('%', :#{#filter.demonstrativo}, '%')))
    AND (:#{#filter.referencia} IS NULL OR LOWER(b.referencia) LIKE LOWER(CONCAT('%', :#{#filter.referencia}, '%')))
    AND (:#{#filter.ano} IS NULL OR LOWER(b.ano) LIKE LOWER(CONCAT('%', :#{#filter.ano}, '%')))
    AND (:#{#filter.periodicidade} IS NULL OR LOWER(b.periodicidade) LIKE LOWER(CONCAT('%', :#{#filter.periodicidade}, '%')))
    AND (:#{#filter.dtPrevEntr} IS NULL OR b.dtPrevEntr = :#{#filter.dtPrevEntr})
    AND (:#{#filter.dtEntr} IS NULL OR b.dtEntr = :#{#filter.dtEntr})
    """)
    List<BalanceteCFOAB> findAllActiveByFilter(@Param("filter")BalanceteCFOABFilteredRequest filter);
}
