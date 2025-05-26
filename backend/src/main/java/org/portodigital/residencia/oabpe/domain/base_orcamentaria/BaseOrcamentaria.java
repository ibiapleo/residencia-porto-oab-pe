package org.portodigital.residencia.oabpe.domain.base_orcamentaria;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "BaseOrcamentaria")
public class BaseOrcamentaria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, name = "Lancto", nullable = false)
    private String lancto;

    @Column(name = "Valor", precision = 19, scale = 2, nullable = false)
    private BigDecimal valor;

    @Column(name = "DtDocto", nullable = false)
    private LocalDate dtDocto;

    @Column(name = "DtLancto", nullable = false)
    private LocalDate dtLancto;

    @Column(name = "Ano", nullable = false)
    private String ano;

    @Column(name = "Tipo", length = 50, nullable = false)
    private String tipo;

    @Column(name = "Status", length = 1)
    private boolean status = true;

    @Column(name = "DAT_CRIACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime dataCriacaoRegistro;

    @Column(name = "DAT_ALTERACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private LocalDateTime dataAlteracaoRegistro;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User user;
}
