package org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceteCFOABRequestDTO {

    @NotNull(message = "Id do demonstrativo é obrigatório")
    private Long demonstrativoId;

    @NotBlank(message = "Referência é obrigatória")
    private String referencia;

    @NotBlank(message = "Ano é obrigatório")
    private String ano;

    @NotBlank(message = "Periodicidade é obrigatória")
    private String periodicidade;

    @NotNull(message = "Data de Previsão de Entrega é obrigatória")
    private LocalDate dtPrevEntr;

    private LocalDate dtEntr;

}
