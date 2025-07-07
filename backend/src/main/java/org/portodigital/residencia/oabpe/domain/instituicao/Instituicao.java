package org.portodigital.residencia.oabpe.domain.instituicao;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Instituicao")
public class Instituicao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Nome", length = 100, nullable = false)
    private String nome;

    @Column(name = "Status", nullable = false)
    private boolean status = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User user;

    @Column(name = "DAT_CRIACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime dataCriacaoRegistro;

    @Column(name = "DAT_ALTERACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private LocalDateTime dataAlteracaoRegistro;
}
