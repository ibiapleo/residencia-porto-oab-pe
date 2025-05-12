package org.portodigital.residencia.oabpe.domain.demonstrativo;

import lombok.*;
import jakarta.persistence.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Demonstrativo")
public class Demonstrativo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Nome", length = 100)
    private String nome;

}
