package org.portodigital.residencia.oabpe.domain.user.payload;

import lombok.Data;

@Data
public class RefreshTokenRequestDTO {
    private String refreshToken;
}
