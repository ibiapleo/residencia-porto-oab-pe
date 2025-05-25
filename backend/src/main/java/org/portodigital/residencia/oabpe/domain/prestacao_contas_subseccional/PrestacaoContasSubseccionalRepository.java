package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalFiltroRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrestacaoContasSubseccionalRepository extends JpaRepository<PrestacaoContasSubseccional, Long> {

    @Query("""
           SELECT p FROM PrestacaoContasSubseccional p
           JOIN FETCH p.subseccional s
           JOIN FETCH p.tipoDesconto t
           WHERE p.status = true
    """)
    Page<PrestacaoContasSubseccional> findAllAtivos(Pageable pageable);

    @Query("""
    SELECT PCS
    FROM PrestacaoContasSubseccional PCS
    LEFT JOIN FETCH PCS.subseccional SUB
    LEFT JOIN FETCH PCS.tipoDesconto TD
    WHERE (:#{#filtro.mesReferencia} IS NULL OR LOWER(PCS.mesReferencia) LIKE LOWER(CONCAT('%', :#{#filtro.mesReferencia}, '%')))
      AND (:#{#filtro.ano} IS NULL OR LOWER(PCS.ano) LIKE LOWER(CONCAT('%', :#{#filtro.ano}, '%')))
      AND (:#{#filtro.dtPrevEntr} IS NULL OR PCS.dtPrevEntr = :#{#filtro.dtPrevEntr})
      AND (:#{#filtro.dtEntrega} IS NULL OR PCS.dtEntrega = :#{#filtro.dtEntrega})
      AND (:#{#filtro.dtPagto} IS NULL OR PCS.dtPagto = :#{#filtro.dtPagto})
      AND (:#{#filtro.valorDuodecimo} IS NULL OR PCS.valorDuodecimo = :#{#filtro.valorDuodecimo})
      AND (:#{#filtro.valorDesconto} IS NULL OR PCS.valorDesconto = :#{#filtro.valorDesconto})
      AND (:#{#filtro.valorPago} IS NULL OR PCS.valorPago = :#{#filtro.valorPago})
      AND (:#{#filtro.protocoloSGD} IS NULL OR LOWER(PCS.protocoloSGD) LIKE LOWER(CONCAT('%', :#{#filtro.protocoloSGD}, '%')))
      AND (:#{#filtro.observacao} IS NULL OR LOWER(PCS.observacao) LIKE LOWER(CONCAT('%', :#{#filtro.observacao}, '%')))
      AND (:#{#filtro.subseccional} IS NULL OR LOWER(SUB.subSeccional) LIKE LOWER(CONCAT('%', :#{#filtro.subseccional}, '%')))
      AND (:#{#filtro.tipoDesconto} IS NULL OR LOWER(TD.nome) LIKE LOWER(CONCAT('%', :#{#filtro.tipoDesconto}, '%')))
      AND PCS.status = true
    """)
    Page<PrestacaoContasSubseccional> findAllByFiltros(
            @Param("filtro") PrestacaoContasSubseccionalFiltroRequest filtro,
            Pageable pageable);
}