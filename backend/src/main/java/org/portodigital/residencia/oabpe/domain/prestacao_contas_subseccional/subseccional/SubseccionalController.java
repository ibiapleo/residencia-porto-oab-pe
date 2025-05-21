package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.dto.SubseccionalResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/v1/subseccionais")
@RequiredArgsConstructor
@Tag(name = "Subseccionais", description = "Operações relacionadas às Subseccionais")
public class SubseccionalController {

    private final SubseccionalService subseccionalService;

    @Operation(summary = "Listar todas as subseccionais")
    @GetMapping
    @PreAuthorize("hasPermission('modulo_subseccional', 'LEITURA')")
    public ResponseEntity<Page<SubseccionalResponse>> getAll(
            @RequestParam(required = false) String nome,
            Pageable pageable) {
        return ResponseEntity.ok(subseccionalService.getAll(nome, pageable));
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

    @Operation(
            summary = "Faz o upload de um subseccional",
            description = "Permite que um usuário envie um arquivo",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Dados do arquivo a ser enviado",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE
                    )
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Subseccional criado com sucesso",
                    content = @Content(schema = @Schema(implementation = BalanceteCFOABResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadFile(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) throws IOException {
        User user = (User) authentication.getPrincipal();
        subseccionalService.importarArquivo(file, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
