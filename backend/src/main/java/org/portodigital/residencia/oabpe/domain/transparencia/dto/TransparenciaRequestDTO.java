package org.portodigital.residencia.oabpe.domain.transparencia.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TransparenciaRequestDTO {
    private Long idDemonst;
    private String referencia;
    private String ano;
    private String periodicidade;
    private LocalDate dtPrevEntr;
    private LocalDate dtEntrega;
}
