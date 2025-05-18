package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrestacaoContasSubseccionalRequestDTO {

    @NotNull
    private Long subseccionalId;
    @NotBlank
    private String mesReferencia;
    @NotBlank
    private String ano;
    @NotNull
    private LocalDate dtPrevEntr;
    private LocalDate dtEntrega;
    private LocalDate dtPagto;
    private BigDecimal valorDuodecimo;
    private BigDecimal valorDesconto;
    private String protocoloSGD;
    private String observacao;
    private BigDecimal valorPago;
    private String subseccional;
    private Long tipoDescontoId;

}
