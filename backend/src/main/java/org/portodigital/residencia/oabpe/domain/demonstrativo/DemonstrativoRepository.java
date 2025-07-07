package org.portodigital.residencia.oabpe.domain.demonstrativo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DemonstrativoRepository extends JpaRepository<Demonstrativo, Long> {

    @Query("SELECT d FROM Demonstrativo d WHERE d.status = true")
    Page<Demonstrativo> findAllAtivos(Pageable pageable);

    @Query("SELECT d FROM Demonstrativo d WHERE d.status = true AND d.id = :id")
    Optional<Demonstrativo> findByIdAtivo(Long id);

    @Query("SELECT d FROM Demonstrativo d WHERE d.status = true AND d.nome = :nome")
    Optional<Demonstrativo> findByNomeAtivo(String nome);
}
