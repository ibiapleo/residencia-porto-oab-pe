package org.portodigital.residencia.oabpe.domain.transparencia;

import jakarta.persistence.*;
import lombok.*;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Transparencia")
public class Transparencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_Demonst", referencedColumnName = "id")
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
}
