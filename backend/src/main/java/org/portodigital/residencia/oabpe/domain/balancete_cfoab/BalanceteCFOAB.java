package org.portodigital.residencia.oabpe.domain.balancete_cfoab;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.*;
import org.portodigital.residencia.oabpe.domain.user.User;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "BalanceteCFOAB")
public class BalanceteCFOAB {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Demonstracao", length = 80, nullable = false)
    private String demonstracao;

    @Column(name = "Referencia", length = 80, nullable = false)
    private String referencia;

    @Column(name = "Ano", nullable = false, length = 4)
    private String ano;

    @Column(name = "Periodicidade", length = 80, nullable = false)
    private String periodicidade;

    @Column(name = "DtPrevEntr", nullable = false)
    private LocalDate dtPrevEntr;

    @Column(name = "DtEntrega")
    private LocalDate dtEntr;

    @Column(name = "Status", length = 1)
    private String status;

    @Column(name = "Eficiencia", length = 1)
    private Long eficiencia;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User user;

    public Long getEficiencia() {
        if (dtEntr == null) {
            return null;
        }
        long diasAtraso = ChronoUnit.DAYS.between(dtPrevEntr, dtEntr);
        return diasAtraso > 0 ? diasAtraso : 0L;
    }
}
