package org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseOrcamentariaResponseDTO {
    private Long id;
    private Long lacntoId;
    private String lancto;
    private BigDecimal valor;
    private LocalDate dtDocto;
    private LocalDate dtLancto;
    private Integer ano;
    private String tipo;
    private String status;
}
