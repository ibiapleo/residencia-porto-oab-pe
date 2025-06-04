package org.portodigital.residencia.oabpe.domain.instituicao;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InstituicaoRepository  extends JpaRepository<Instituicao,Long> {
    @Query("SELECT i FROM Instituicao i WHERE i.status = true")
    Page<Instituicao> findAllAtivos(Pageable pageable);

    @Query("SELECT i FROM Instituicao i WHERE i.status = true AND i.id = :id")
    Optional<Instituicao> findByIdAtivo(Long id);

    @Query("SELECT i FROM Instituicao i WHERE i.status = true AND i.nome = :nome")
    Optional<Instituicao> findByNomeAtivo(String nome);
}
