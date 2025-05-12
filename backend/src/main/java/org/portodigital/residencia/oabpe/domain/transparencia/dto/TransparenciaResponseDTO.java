package org.portodigital.residencia.oabpe.domain.transparencia.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TransparenciaResponseDTO {
    private Long id;
    private String referencia;
    private String ano;
    private String periodicidade;
    private LocalDate dtPrevEntr;
    private LocalDate dtEntrega;
    private String nomeDemonstrativo; // Ou outro campo representativo do Demonstrativo
}
