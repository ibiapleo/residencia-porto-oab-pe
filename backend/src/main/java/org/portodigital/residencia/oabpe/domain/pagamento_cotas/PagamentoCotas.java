package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.portodigital.residencia.oabpe.domain.instituicao.Instituicao;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.TipoDesconto;
import org.portodigital.residencia.oabpe.domain.subseccional.Subseccional;
import org.portodigital.residencia.oabpe.domain.user.User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PagamentoCotas")
public class PagamentoCotas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "Id_Instit", referencedColumnName = "id", nullable = false)
    private Instituicao instituicao;

    @Column(length = 10, name = "MesRef", nullable = false)
    private String mesReferencia;

    @Column(length = 4, name = "AnoRef", nullable = false)
    private String ano;

    @Column(name = "DtPrevEntr", nullable = false)
    private LocalDate dtPrevEntr;

    @Column(name = "ValorDuodecimo", precision = 19, scale = 2)
    private BigDecimal valorDuodecimo;

    @Column(name = "ValorDesconto", precision = 19, scale = 2)
    private BigDecimal valorDesconto;

    @ManyToOne
    @JoinColumn(name = "Id_TpDesc",  nullable = false)
    private TipoDesconto tipoDesconto;

    @Column(name = "ValorPago", precision = 19, scale = 2)
    private BigDecimal valorPago;

    @Column(name = "DtPagto")
    private LocalDate dtPagto;

    @Column(name = "Observacao", length = 255)
    private String observacao;

    @Column(name = "Status", length = 1)
    private String status;

    @Column(name = "DAT_CRIACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime dataCriacaoRegistro;

    @Column(name = "DAT_ALTERACAO_REGISTRO")
    @Temporal(TemporalType.TIMESTAMP)
    @UpdateTimestamp
    private LocalDateTime dataAlteracaoRegistro;

}
