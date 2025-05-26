package org.portodigital.residencia.oabpe.domain.identidade.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.dto.*;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.identidade.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Operações relacionadas à autenticação de um usuário")
public class AuthController {

    private final UserService userService;

    @Operation(
            summary = "Login de usuário",
            description = "Realiza o login e retorna o token JWT",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = LoginRequestDTO.class),
                            examples = @ExampleObject(
                                    value = "{\"username\": \"joao.silva\", \"password\": \"senha@123\"}"
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Login bem sucedido!"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request
    ) {
        TokenResponseDTO jwtToken = userService.login(request);
        return ResponseEntity.ok(jwtToken);
    }

    @Operation(
            summary = "Registro de novo usuário",
            description = "Registra um novo usuário no sistema",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = RegisterRequestDTO.class),
                            examples = @ExampleObject(
                                    value = "{\"nome\": \"João Ribeiro da Silva\", \"username\": \"joao.silva\", \"password\": \"senha@123\"}"
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou usuário já existe")
    })
    @PostMapping(value = "/register")
    public ResponseEntity<UserResponseDTO> register(
            @RequestBody RegisterRequestDTO registerRequestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(registerRequestDTO));
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
