package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrestacaoContasSubseccionalFiltroRequest {

    private String mesReferencia;
    private String ano;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtPrevEntr;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtEntrega;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtPagto;
    private BigDecimal valorDuodecimo;
    private BigDecimal valorDesconto;
    private BigDecimal valorPago;
    private String protocoloSGD;
    private String observacao;
    private String subseccional;
    private String tipoDesconto;
}