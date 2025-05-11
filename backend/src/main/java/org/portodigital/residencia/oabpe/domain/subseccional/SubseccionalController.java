package org.portodigital.residencia.oabpe.domain.subseccional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/subseccionais")
@RequiredArgsConstructor
@Tag(name = "Subseccionais", description = "Operações relacionadas às Subseccionais")
public class SubseccionalController {

    private final SubseccionalService subseccionalService;

    @Operation(summary = "Listar todas as subseccionais")
    @GetMapping
    @PreAuthorize("hasPermission('modulo_subseccional', 'LEITURA')")
    public ResponseEntity<List<SubseccionalResponse>> getAll() {
        return ResponseEntity.ok(subseccionalService.getAll());
    }

    @Operation(summary = "Buscar uma subseccional por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subseccional encontrada"),
            @ApiResponse(responseCode = "404", description = "Subseccional não encontrada")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_subseccional', 'LEITURA')")
    public ResponseEntity<SubseccionalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subseccionalService.getById(id));
    }

    @Operation(summary = "Criar uma nova subseccional")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Subseccional criada com sucesso")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_subseccional', 'ESCRITA')")
    public ResponseEntity<SubseccionalResponse> createSubseccional(@RequestBody SubseccionalRequest request) {
        SubseccionalResponse newSubseccional = subseccionalService.create(request);
        return new ResponseEntity<>(newSubseccional, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar uma subseccional existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_subseccional', 'ESCRITA')")
    public ResponseEntity<SubseccionalResponse> updateSubseccional(@PathVariable Long id,
                                                                   @RequestBody SubseccionalRequest request) {
        SubseccionalResponse updated = subseccionalService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Remover uma subseccional (soft delete)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Subseccional desativada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Subseccional não encontrada")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_subseccional', 'ESCRITA')")
    public ResponseEntity<Void> deleteSubseccional(@PathVariable Long id) {
        subseccionalService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
