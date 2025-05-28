package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasFilteredRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PagamentoCotasRepository extends JpaRepository<PagamentoCotas,Long> {

    @Query("SELECT p FROM PagamentoCotas p WHERE p.status = true")
    Page<PagamentoCotas> findAllActive(Pageable pageable);

    @Query("""
    SELECT p
    FROM PagamentoCotas p
    LEFT JOIN FETCH p.instituicao i
    LEFT JOIN FETCH p.tipoDesconto td
    WHERE (:#{#filter.instituicaoId} IS NULL OR i.id = :#{#filter.instituicaoId})
      AND (:#{#filter.mesReferencia} IS NULL OR LOWER(p.mesReferencia) LIKE LOWER(CONCAT('%', :#{#filter.mesReferencia}, '%')))
      AND (:#{#filter.ano} IS NULL OR p.ano = :#{#filter.ano})
      AND (:#{#filter.status} IS NULL OR p.status = :#{#filter.status})
      AND (:#{#filter.tipoDescontoId} IS NULL OR td.id = :#{#filter.tipoDescontoId})
      AND (:#{#filter.dtPrevEntr} IS NULL OR p.dtPrevEntr = :#{#filter.dtPrevEntr})
      AND (:#{#filter.dtPagto} IS NULL OR p.dtPagto = :#{#filter.dtPagto})
      AND (:#{#filter.valorPago} IS NULL OR p.valorPago = :#{#filter.valorPago})
    """)
    Page<PagamentoCotas> findAllActiveByFilter(@Param("filter") PagamentoCotasFilteredRequest filter, Pageable pageable);
}
