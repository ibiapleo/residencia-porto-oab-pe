package org.portodigital.residencia.oabpe.domain.instituicao;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoRequestDTO;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoResponseDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoRequestDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/instituicoes")
@RequiredArgsConstructor
@Tag(name = "Instituição", description = "Gerencia registros do instituições")
public class InstituicaoController {

    private final InstituicaoService instituicaoService;

    @Operation(
            summary = "Listar Instituições",
            description = "Retorna uma lista paginada de todos as Instituições cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_instituicao', 'LEITURA')")
    public ResponseEntity<Page<InstituicaoResponseDTO>> getAll(
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(instituicaoService.getAll(pageable));
    }

    @Operation(
            summary = "Buscar Instituição por ID",
            description = "Retorna os detalhes de uma Instituição específico"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Instituição encontrado"),
            @ApiResponse(responseCode = "404", description = "Instituição não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_instituicao', 'LEITURA')")
    public ResponseEntity<InstituicaoResponseDTO> getById(
            @Parameter(description = "ID da Instituição", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(instituicaoService.getById(id));
    }

    @Operation(
            summary = "Excluir Instituição (soft delete)",
            description = "Deixar o status de uma Instituição inativo"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Instituição excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Instituição não encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_instituicao', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da Instituição a ser excluído", example = "1")
            @PathVariable Long id) {
        instituicaoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar Instituição",
            description = "Atualiza os dados de uma Instituição existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Instituição atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Instituição não encontrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_instituicao', 'ESCRITA')")
    public ResponseEntity<InstituicaoResponseDTO> update(
            @Parameter(description = "ID da Instituição a ser atualizado", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Novos dados do demonstrativo")
            @RequestBody InstituicaoRequestDTO request) {
        return ResponseEntity.ok(instituicaoService.update(id, request));
    }

}
