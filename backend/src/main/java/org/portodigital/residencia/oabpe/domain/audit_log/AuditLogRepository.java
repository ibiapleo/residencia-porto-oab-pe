package org.portodigital.residencia.oabpe.domain.audit_log;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Você pode adicionar métodos personalizados se quiser, por exemplo:

    // Buscar logs por tabela
    List<AuditLog> findByTabela(String tabela);

    // Buscar logs por usuário
    List<AuditLog> findByIdUsuario(Long idUsuario);

    // Buscar logs por ação
    List<AuditLog> findByAcao(String acao);
}
