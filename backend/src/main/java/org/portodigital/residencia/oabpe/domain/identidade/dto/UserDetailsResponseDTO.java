package org.portodigital.residencia.oabpe.domain.identidade.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UserDetailsResponseDTO {
    private String id;
    private String name;
    private String username;
    private List<String> roles;
    private Map<String, List<String>> permissions;
}
