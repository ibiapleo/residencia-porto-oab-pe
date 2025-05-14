package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.PrestacaoContasSubseccional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface BalanceteCFOABRepository extends JpaRepository<BalanceteCFOAB, Long> {

    @Query("SELECT b FROM BalanceteCFOAB b WHERE b.status = true")
    Page<BalanceteCFOAB> findAllAtivos(Pageable pageable);

}
