package org.portodigital.residencia.oabpe.domain.transparencia;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Transparencia")
public class Transparencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_Demonstrativo", referencedColumnName = "id")
    private Demonstrativo demonstrativo;

    @Column(name = "Referencia", length = 80, nullable = false)
    private String referencia;

    @Column(name = "Ano", length = 4, nullable = false)
    private String ano;

    @Column(name = "Periodicidade", length = 80, nullable = false)
    private String periodicidade;

    @Column(name = "DtPrevEntr", nullable = false)
    private LocalDate dtPrevEntr;

    @Column(name = "DtEntrega")
    private LocalDate dtEntrega;

    @Column(name = "Status", nullable = false)
    private boolean status = true;

    @Column(name = "Eficiencia")
    private Long eficiencia;

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

    public Long getEficiencia() {
        if (dtEntrega == null || dtPrevEntr == null) {
            return null;
        }
        long diasAtraso = ChronoUnit.DAYS.between(dtPrevEntr, dtEntrega);
        return diasAtraso > 0 ? diasAtraso : 0L;
    }
}
