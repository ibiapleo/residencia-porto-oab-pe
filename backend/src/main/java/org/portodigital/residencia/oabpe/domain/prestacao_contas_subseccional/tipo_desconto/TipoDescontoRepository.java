package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoDescontoRepository extends JpaRepository<TipoDesconto, Long> {
    Page<TipoDesconto> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}