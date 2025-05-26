package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TipoDescontoRepository extends JpaRepository<TipoDesconto, Long> {
    @Query("SELECT t FROM TipoDesconto t WHERE t.status = true")
    Page<TipoDesconto> findAllAtivos(Pageable pageable);

    @Query("SELECT t FROM TipoDesconto t WHERE t.status = true AND t.id = :id")
    Optional<TipoDesconto> findByIdAtivo(Long id);

    @Query("SELECT t FROM TipoDesconto t WHERE t.status = true AND t.nome = :nome")
    Optional<TipoDesconto> findByNomeAtivo(String nome);
}