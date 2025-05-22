package org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseOrcamentariaFilteredRequest {
    private Long idLancto;
    private String lancto;
    private BigDecimal valor;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtDocto;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtLancto;
    private BigDecimal ano;
    private String tipo;
}
