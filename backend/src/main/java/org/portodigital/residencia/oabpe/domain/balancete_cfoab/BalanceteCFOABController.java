package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABFilteredRequest;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springdoc.core.annotations.ParameterObject;
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
@RequestMapping("/v1/balancete-cfoab")
@RequiredArgsConstructor
@Tag(name = "Balancete CFOAB", description = "Gerencia registros do balancete CFOAB")
public class BalanceteCFOABController {

    private final BalanceteCFOABService balanceteCFOABService;

    @Operation(
            summary = "Listar Balancetes",
            description = "Retorna uma lista paginada de todos os balancetes cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'LEITURA')")
    public ResponseEntity<Page<BalanceteCFOABResponseDTO>> getAllFiltered(
            @Parameter(description = "Parâmetros de filtragem")
            @Valid @ParameterObject BalanceteCFOABFilteredRequest filter,
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(balanceteCFOABService.getAllFiltered(filter, pageable));
    }

    @Operation(
            summary = "Buscar Balancete por ID",
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
            summary = "Criar novo Balancete",
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
            @Valid @RequestBody BalanceteCFOABRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(balanceteCFOABService.create(request));
    }

    @Operation(
            summary = "Excluir balancete (soft delete)",
            description = "Deixar o status de um Balancete inativo"
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
            summary = "Atualizar Balancete",
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

    @Operation(
            summary = "Faz o upload de um balancete",
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
            @ApiResponse(responseCode = "201", description = "Balancete criado com sucesso",
                    content = @Content(schema = @Schema(implementation = BalanceteCFOABResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasPermission('modulo_balancetes_cfoab', 'ESCRITA')")
    public void uploadFile(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) throws IOException {
        User user = (User) authentication.getPrincipal();
        balanceteCFOABService.importarArquivo(file, user);
    }
}
