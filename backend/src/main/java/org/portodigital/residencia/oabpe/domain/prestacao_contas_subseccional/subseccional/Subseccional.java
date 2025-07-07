package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;

import java.time.LocalDateTime;

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
    private boolean status = true;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_usuario", referencedColumnName = "id")
    private User usuario;

    @Column(name = "DAT_CRIACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime dataCriacaoRegistro;

    @Column(name = "DAT_ALTERACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private LocalDateTime dataAlteracaoRegistro;

}