package org.portodigital.residencia.oabpe.domain.identidade.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AssignRolesToUserRequestDTO {

    @NotNull
    private String userId;

    @NotEmpty
    private List<Long> roleIds;
}