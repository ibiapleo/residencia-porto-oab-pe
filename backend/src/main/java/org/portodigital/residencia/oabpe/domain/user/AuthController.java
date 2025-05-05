package org.portodigital.residencia.oabpe.domain.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.payload.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Operation(
            summary = "Login de usuário",
            description = "Realiza o login e retorna o token JWT"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login bem-sucedido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        TokenResponseDTO jwtToken = userService.login(loginRequestDTO);
        return ResponseEntity.ok(jwtToken);
    }

    @Operation(
            summary = "Registro de novo usuário",
            description = "Registra um novo usuário no sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou usuário já existe", content = @Content)
    })
    @PostMapping(value = "/register")
    public ResponseEntity<Void> register(
            @RequestBody RegisterRequestDTO registerRequestDTO) {

        userService.registerUser(registerRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(
            summary = "Refresh Token",
            description = "Gera um novo token JWT usando um refresh token válido"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token renovado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado", content = @Content)
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponseDTO> refreshToken(
            @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO) {
        TokenResponseDTO newToken = userService.refreshToken(refreshTokenRequestDTO.getRefreshToken());
        return ResponseEntity.ok(newToken);
    }

    @Operation(
            summary = "Logout do usuário",
            description = "Remove o refresh token do sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Logout realizado com sucesso", content = @Content),
            @ApiResponse(responseCode = "400", description = "Token inválido", content = @Content)
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO,
            @Parameter(hidden = true) Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        userService.logout(refreshTokenRequestDTO.getRefreshToken(), user);
        return ResponseEntity.noContent().build();
    }

}
