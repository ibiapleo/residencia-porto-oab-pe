package org.portodigital.residencia.oabpe.domain.identidade.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class RoleDetailsDTO {
    private Long id;
    private String name;
    private Map<String, List<String>> permissions;
}