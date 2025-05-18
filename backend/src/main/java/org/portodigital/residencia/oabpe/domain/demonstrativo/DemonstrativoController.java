package org.portodigital.residencia.oabpe.domain.demonstrativo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoRequestDTO;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/demonstrativos")
@RequiredArgsConstructor
@Tag(name = "Demonstrativos", description = "Gerencia registros dos demonstrativos")
public class DemonstrativoController {

    private final DemonstrativoService demonstrativoService;

    @Operation(
            summary = "Listar Demonstrativos",
            description = "Retorna uma lista paginada de todos os demonstrativos cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_demonstrativos', 'LEITURA')")
    public ResponseEntity<Page<DemonstrativoResponseDTO>> getAll(
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(demonstrativoService.getAll(pageable));
    }

    @Operation(
            summary = "Buscar Demonstrativo por ID",
            description = "Retorna os detalhes de um demonstrativo específico"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Demonstrativo encontrado"),
            @ApiResponse(responseCode = "404", description = "Demonstrativo não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_demonstrativos', 'LEITURA')")
    public ResponseEntity<DemonstrativoResponseDTO> getById(
            @Parameter(description = "ID do demonstrativo", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(demonstrativoService.getById(id));
    }

    @Operation(
            summary = "Criar novo demonstrativo",
            description = "Cadastra um novo registro de demonstrativo"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Demonstrativo criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_demonstrativos', 'ESCRITA')")
    public ResponseEntity<DemonstrativoResponseDTO> create(
            @Parameter(description = "Dados do balancete para criação")
            @RequestBody DemonstrativoRequestDTO request) {
        DemonstrativoResponseDTO response = demonstrativoService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Excluir demonstrativo (soft delete)",
            description = "Deixar o status de um demonstrativo inativo"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Demonstrativo excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Demonstrativo não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_demonstrativos', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do demonstrativo a ser excluído", example = "1")
            @PathVariable Long id) {
        demonstrativoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar Demonstrativo",
            description = "Atualiza os dados de um demonstrativo existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Demonstrativo atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Demonstrativo não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_demonstrativos', 'ESCRITA')")
    public ResponseEntity<DemonstrativoResponseDTO> update(
            @Parameter(description = "ID do demonstrativo a ser atualizado", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Novos dados do demonstrativo")
            @RequestBody DemonstrativoRequestDTO request) {
        return ResponseEntity.ok(demonstrativoService.update(id, request));
    }
}
