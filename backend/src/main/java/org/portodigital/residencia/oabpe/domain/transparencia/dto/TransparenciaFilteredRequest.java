package org.portodigital.residencia.oabpe.domain.transparencia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransparenciaFilteredRequest {
    private String demonstrativo;
    private String referencia;
    private String ano;
    private String periodicidade;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtPrevEntr;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate dtEntrega;
}