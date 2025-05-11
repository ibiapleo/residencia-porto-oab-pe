package org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagamentoCotasResponseDTO {

    private Long id;
    private Long instituicaoId;
    private String mesReferencia;
    private String ano;
    private LocalDate dtPrevEntr;
    private BigDecimal valorDuodecimo;
    private BigDecimal valorDesconto;
    private Long tipoDescontoId;
    private BigDecimal valorPago;
    private LocalDate dtPagto;
    private String observacao;
    private String status;

}
