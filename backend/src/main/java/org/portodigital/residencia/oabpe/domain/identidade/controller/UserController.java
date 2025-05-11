package org.portodigital.residencia.oabpe.domain.identidade.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.dto.AssignRolesToUserRequestDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.UserDetailsResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.UserResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "Gerencia registros de usuários")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Listar todos os usuários paginados")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_usuario', 'LEITURA')")
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(@Parameter(hidden = true) Pageable pageable) {
        Page<UserResponseDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(
            summary = "Atribuir Roles a um usuário",
            description = "Associa uma ou mais roles a um usuário existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Roles atribuídas com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida"),
            @ApiResponse(responseCode = "404", description = "Usuário ou role não encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping("/assign-roles")
    @PreAuthorize("hasPermission('modulo_usuario', 'ESCRITA')")
    public ResponseEntity<Void> assignRolesToUser(
            @Valid @RequestBody AssignRolesToUserRequestDTO dto) {
        userService.assignRolesToUser(dto.getUserId(), dto.getRoleIds());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Obter detalhes de um usuário por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_usuario', 'LEITURA')")
    public ResponseEntity<UserDetailsResponseDTO> getUserById(@PathVariable String id) {
        UserDetailsResponseDTO user = userService.getUserDetailsById(id);
        return ResponseEntity.ok(user);
    }

}
