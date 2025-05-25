package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Subseccional")
public class Subseccional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SubSeccional", nullable = false, length = 100)
    private String subSeccional;

    @Column(name = "Status", nullable = false)
    private Boolean status = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User usuario;

}