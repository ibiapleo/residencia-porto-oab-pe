package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/balancete-cfoab")
@RequiredArgsConstructor
@Tag(name = "Balancete CFOAB", description = "Gerencia registros do balancete CFOAB")
public class BalanceteCFOABController {

    private final BalanceteCFOABService balanceteCFOABService;

    @Operation(
            summary = "Listar balancetes",
            description = "Retorna uma lista paginada de todos os balancetes cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'LEITURA')")
    public ResponseEntity<Page<BalanceteCFOABResponseDTO>> getAll(
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(balanceteCFOABService.getAll(pageable));
    }

    @Operation(
            summary = "Buscar balancete por ID",
            description = "Retorna os detalhes de um balancete específico"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Balancete encontrado"),
            @ApiResponse(responseCode = "404", description = "Balancete não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'LEITURA')")
    public ResponseEntity<BalanceteCFOABResponseDTO> getById(
            @Parameter(description = "ID do balancete", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(balanceteCFOABService.getById(id));
    }

    @Operation(
            summary = "Criar novo balancete",
            description = "Cadastra um novo registro de balancete contábil"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Balancete criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'ESCRITA')")
    public ResponseEntity<BalanceteCFOABResponseDTO> create(
            @Parameter(description = "Dados do balancete para criação")
            @RequestBody BalanceteCFOABRequestDTO request) {
        BalanceteCFOABResponseDTO response = balanceteCFOABService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Excluir balancete",
            description = "Remove permanentemente um registro de balancete"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Balancete excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Balancete não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do balancete a ser excluído", example = "1")
            @PathVariable Long id) {
        balanceteCFOABService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar balancete",
            description = "Atualiza os dados de um balancete existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Balancete atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Balancete não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'ESCRITA')")
    public ResponseEntity<BalanceteCFOABResponseDTO> update(
        @Parameter(description = "ID do balancete a ser atualizado", example = "1")
        @PathVariable Long id,
        @Parameter(description = "Novos dados do balancete")
        @RequestBody BalanceteCFOABRequestDTO request) {
        return ResponseEntity.ok(balanceteCFOABService.update(id, request));
    }
}
