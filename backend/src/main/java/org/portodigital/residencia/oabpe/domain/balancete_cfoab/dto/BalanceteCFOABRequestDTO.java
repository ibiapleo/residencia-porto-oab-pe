package org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.User;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceteCFOABRequestDTO {

    private String demonstracao;
    private String referencia;
    private String ano;
    private String periodicidade;
    private LocalDate dtPrevEntr;
    private LocalDate dtEntr;

}
