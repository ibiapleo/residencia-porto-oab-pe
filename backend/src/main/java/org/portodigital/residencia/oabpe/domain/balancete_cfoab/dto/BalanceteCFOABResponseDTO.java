package org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceteCFOABResponseDTO {

    private Long id;
    private String demonstracao;
    private String referencia;
    private String ano;
    private String periodicidade;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dtPrevEntr;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate dtEntr;
    private Long eficiencia;
    private String usuarioId;
    private boolean status;

}
