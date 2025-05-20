package org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagamentoCotasFilteredRequest {


    private Long instituicaoId;
    private String mesReferencia;
    private String ano;
    private String status;
    private Long tipoDescontoId;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtPrevEntr;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtPagto;
    private BigDecimal valorPago;
}