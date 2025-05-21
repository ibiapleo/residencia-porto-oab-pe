package org.portodigital.residencia.oabpe.domain.instituicao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.portodigital.residencia.oabpe.domain.audit_log.AuditLogListener;

@Getter
@Setter
@EntityListeners(AuditLogListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Instituicao")
public class Instituicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Descricao", length = 100, nullable = false)
    private String descricao;
}
