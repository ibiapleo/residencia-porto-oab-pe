package org.portodigital.residencia.oabpe.domain.audit_log;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


import java.time.LocalDateTime;


@Getter
@Setter
@Entity
@Table(name = "AuditLog")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Id_Usuario", nullable = false)
    private String idUsuario;

    @Column(name = "Tabela", length = 100, nullable = false)
    private String tabela;

    @Column(name = "Id_Registro", nullable = false)
    private String idRegistro;

    @Column(name = "Acao", length = 10, nullable = false)
    private String acao;

    @Lob
    @Column(name = "Dados_Anteriores")
    private String dadosAnteriores;

    @Lob
    @Column(name = "Dados_Novos")
    private String dadosNovos;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;

}
