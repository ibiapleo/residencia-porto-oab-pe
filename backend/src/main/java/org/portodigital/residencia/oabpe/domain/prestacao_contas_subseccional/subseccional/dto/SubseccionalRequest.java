package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubseccionalRequest {

    private Long id;
    @NotBlank
    private String subSeccional;
}