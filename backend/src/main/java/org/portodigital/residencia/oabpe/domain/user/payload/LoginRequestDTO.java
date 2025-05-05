package org.portodigital.residencia.oabpe.domain.user.payload;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDTO {

    @NotEmpty
    private String username;
    @NotEmpty
    private String password;
}
