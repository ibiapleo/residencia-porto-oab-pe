package org.portodigital.residencia.oabpe.domain.identidade.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.dto.CreateRoleWithPermissionsDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.RoleDetailsDTO;
import org.portodigital.residencia.oabpe.domain.identidade.dto.RoleResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.service.RoleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Role", description = "Gerencia registros de roles")
public class RoleController {

    private final RoleService roleService;

    @Operation(
            summary = "Criar Role com Permissões",
            description = "Cria uma Role e associa permissões, criando módulos/permissões se necessário"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Role criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_usuario', 'ADMIN')")
    public ResponseEntity<RoleDetailsDTO> create(
            @Valid @RequestBody CreateRoleWithPermissionsDTO dto) {
        RoleDetailsDTO role = roleService.createWithPermissions(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(role);
    }

    @Operation(
            summary = "Listar Roles",
            description = "Retorna uma lista paginada de Roles"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_usuario', 'ADMIN')")
    public ResponseEntity<Page<RoleResponseDTO>> getAll(
            @Parameter(description = "Parâmetros de paginação") Pageable pageable) {
        return ResponseEntity.ok(roleService.getAll(pageable));
    }

    @Operation(
            summary = "Buscar Role por ID",
            description = "Retorna os detalhes de uma Role específica"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role encontrada"),
            @ApiResponse(responseCode = "404", description = "Role não encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_usuario', 'ADMIN')")
    public ResponseEntity<RoleDetailsDTO> getById(
            @Parameter(description = "ID da Role", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(roleService.getById(id));
    }
}
