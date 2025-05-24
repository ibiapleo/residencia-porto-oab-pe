package org.portodigital.residencia.oabpe.domain.transparencia;

import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaFilteredRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransparenciaRepository extends JpaRepository<Transparencia, Long> {


    @Query("SELECT b FROM  Transparencia b WHERE b.status = true")
    Page<Transparencia> findAllActive(Pageable pageable);

    @Query("""
    SELECT b
    FROM Transparencia b
    LEFT JOIN FETCH b.demonstrativo d
    WHERE b.status = true
    AND (:#{#filter.demonstrativo} IS NULL OR LOWER(d.nome) LIKE LOWER(CONCAT('%', :#{#filter.demonstrativo}, '%')))
    AND (:#{#filter.referencia} IS NULL OR LOWER(b.referencia) LIKE LOWER(CONCAT('%', :#{#filter.referencia}, '%')))
    AND (:#{#filter.ano} IS NULL OR LOWER(b.ano) LIKE LOWER(CONCAT('%', :#{#filter.ano}, '%')))
    AND (:#{#filter.periodicidade} IS NULL OR LOWER(b.periodicidade) LIKE LOWER(CONCAT('%', :#{#filter.periodicidade}, '%')))
    AND (:#{#filter.dtPrevEntr} IS NULL OR b.dtPrevEntr = :#{#filter.dtPrevEntr})
    AND (:#{#filter.dtEntrega} IS NULL OR b.dtEntrega = :#{#filter.dtEntrega})
    """)
    Page<Transparencia> findAllActiveByFilter(@Param("filter") TransparenciaFilteredRequest filter, Pageable pageable);

}
