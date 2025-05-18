package org.portodigital.residencia.oabpe.domain.base_orcamentaria;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaRequestDTO;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/base-orcamentaria")
@RequiredArgsConstructor
@Tag(name = "Base Orçamentaria", description = "Gerencia registros da base orçamentaria")
public class BaseOrcamentariaController {

    private final BaseOrcamentariaService baseOrcamentariaService;

    @Operation(
            summary = "Listar Bases Orçamentárias",
            description = "Retorna uma lista paginada de todos as Bases Orçamentárias cadastradas"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_base_orcamentaria', 'LEITURA')")
    public ResponseEntity<Page<BaseOrcamentariaResponseDTO>> getAll(
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(baseOrcamentariaService.getAll(pageable));
    }

    @Operation(
            summary = "Buscar Base Orçamentária por ID",
            description = "Retorna os detalhes de uma Base Orçamentária específica"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Base encontrado"),
            @ApiResponse(responseCode = "404", description = "Base não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_base_orcamentaria', 'LEITURA')")
    public ResponseEntity<BaseOrcamentariaResponseDTO> getById(
            @Parameter(description = "ID da Base", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(baseOrcamentariaService.getById(id));
    }

    @Operation(
            summary = "Criar nova Base Orçamentária",
            description = "Cadastra um novo registro de Base Orçamentária"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Base criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_base_orcamentaria', 'ESCRITA')")
    public ResponseEntity<BaseOrcamentariaResponseDTO> create(
            @Parameter(description = "Dados do pagamento para criação")
            @RequestBody BaseOrcamentariaRequestDTO request) {
        BaseOrcamentariaResponseDTO response = baseOrcamentariaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Excluir uma Base Orçamentária (soft delete)",
            description = "Deixar o status de uma Base Orçamentária inativo"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Base inativa com sucesso"),
            @ApiResponse(responseCode = "404", description = "Base não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_base_orcamentaria', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da Base a ser excluído", example = "1")
            @PathVariable Long id) {
        baseOrcamentariaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar a Base",
            description = "Atualiza os dados de um Base existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Base atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Base não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_base_orcamentaria', 'ESCRITA')")
    public ResponseEntity<BaseOrcamentariaResponseDTO> update(
            @Parameter(description = "ID da Base a ser atualizado", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Novos dados da Base")
            @RequestBody BaseOrcamentariaRequestDTO request) {
        return ResponseEntity.ok(baseOrcamentariaService.update(id, request));
    }
}
