package org.portodigital.residencia.oabpe.domain.subseccional;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.User;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Subseccional")
public class Subseccional {

    @Id
    @Column(name = "Id")
    private Long id;

    @Column(name = "SubSeccional", nullable = false, length = 100)
    private String subSeccional;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User usuario;

}