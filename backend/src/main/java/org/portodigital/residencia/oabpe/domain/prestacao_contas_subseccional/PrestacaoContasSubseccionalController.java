package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalFiltroRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/prestacao-contas")
@RequiredArgsConstructor
@Tag(name = "Prestação de Contas", description = "Gerencia registros de prestação de contas das subseccionais")
public class PrestacaoContasSubseccionalController {

    private final PrestacaoContasSubseccionalService prestacaoContasSubseccionalService;

    @Operation(summary = "Listar prestações de contas com filtros")
    @GetMapping
    @PreAuthorize("hasPermission('modulo_prestacao_contas_subseccional', 'LEITURA')")
    public ResponseEntity<Page<PrestacaoContasSubseccionalResponseDTO>> getAllComFiltro(
            @Valid @ParameterObject PrestacaoContasSubseccionalFiltroRequest filtro,
            Pageable pageable) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.getAllComFiltro(filtro, pageable));
    }
    @Operation(summary = "Buscar prestação de contas por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Prestação encontrada"),
            @ApiResponse(responseCode = "404", description = "Prestação não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_prestacao_contas_subseccional', 'LEITURA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.getById(id));
    }

    @Operation(summary = "Criar uma nova prestação de contas")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Prestação criada com sucesso")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_prestacao_contas_subseccional', 'ESCRITA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> create(@RequestBody PrestacaoContasSubseccionalRequestDTO request) {
        prestacaoContasSubseccionalService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "Atualizar uma prestação de contas existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_prestacao_contas_subseccional', 'ESCRITA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> update(@PathVariable Long id,
                                                                         @RequestBody PrestacaoContasSubseccionalRequestDTO request) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.update(id, request));
    }

    @Operation(summary = "Excluir uma prestação de contas (soft delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Prestação desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Prestação não encontrada")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_prestacao_contas_subseccional', 'ESCRITA')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        prestacaoContasSubseccionalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}