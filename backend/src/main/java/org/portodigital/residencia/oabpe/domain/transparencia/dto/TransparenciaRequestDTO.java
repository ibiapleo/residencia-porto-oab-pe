package org.portodigital.residencia.oabpe.domain.transparencia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class TransparenciaRequestDTO {

    @NotBlank(message = "Nome do Demonstrativo é obrigatório")
    private String demonstrativoNome;

    @NotBlank(message = "Referência é obrigatória")
    private String referencia;

    @NotBlank(message = "Ano é obrigatório")
    private String ano;

    @NotBlank(message = "Periodicidade é obrigatória")
    private String periodicidade;

    @NotBlank(message = "Data de previsão de entrega é obrigatória")
    private LocalDate dtPrevEntr;

    private LocalDate dtEntrega;
}
