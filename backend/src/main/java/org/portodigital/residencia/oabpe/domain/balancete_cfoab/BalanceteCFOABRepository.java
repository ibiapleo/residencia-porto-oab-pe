package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BalanceteCFOABRepository extends JpaRepository<BalanceteCFOAB, Long> {

    @Query("SELECT b FROM BalanceteCFOAB b WHERE b.status = true")
    Page<BalanceteCFOAB> findAllAtivos(Pageable pageable);

}
