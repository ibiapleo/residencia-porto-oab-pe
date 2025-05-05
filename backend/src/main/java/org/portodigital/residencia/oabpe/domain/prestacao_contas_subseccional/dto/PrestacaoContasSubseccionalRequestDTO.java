package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrestacaoContasSubseccionalRequestDTO {

    private Long subseccionalId;
    private String mesReferencia;
    private String ano;
    private LocalDate dtPrevEntr;
    private LocalDate dtEntrega;
    private LocalDate dtPagto;
    private BigDecimal valorDuodecimo;
    private BigDecimal valorDesconto;
    private String protocoloSGD;
    private String observacao;
    private Long tipoDescontoId;

}
