package org.portodigital.residencia.oabpe.domain.transparencia.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransparenciaResponseDTO {

    private Long id;
    private Long demonstrativoId;
    private String nomeDemonstrativo;
    private String referencia;
    private String ano;
    private String periodicidade;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dtPrevEntr;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dtEntrega;
    private Long eficiencia;
    private boolean status;
}
