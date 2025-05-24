package org.portodigital.residencia.oabpe.domain.transparencia;

import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaFilteredRequest;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaRequestDTO;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaResponseDTO;
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
@RequestMapping("/v1/transparencia")
@RequiredArgsConstructor
@Tag(name = "Transparencia", description = "Gerencia registros de transparencia")
public class TransparenciaController {

    private final TransparenciaService transparenciaService;

    @Operation(
            summary = "Listar registros de transparência.",
            description = "Retornar uma lista paginada de todos os registros de transparência cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_transparencia', 'LEITURA')")
    public ResponseEntity<Page<TransparenciaResponseDTO>> getAllFiltered(
            @Parameter(description = "Parâmetros de filtragem")
            @Valid @ParameterObject TransparenciaFilteredRequest filter,
            @Parameter(description = "Parâmetros de paginação (page, size, sort)")
            Pageable pageable) {
        return ResponseEntity.ok(transparenciaService.getAllFiltered(filter, pageable));
    }

    @Operation(
            summary = "Buscar transparência pelo ID.",
            description = "Retornar uma lista paginada de todos os registros de transparência cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Balancete encontrado"),
            @ApiResponse(responseCode = "404", description = "Balancete não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_transparencia', 'LEITURA')")
    public ResponseEntity<TransparenciaResponseDTO> getById(
            @Parameter(description = "ID do balancete", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(transparenciaService.getById(id));
    }
    @Operation(
            summary = "Criar uma nova transparência",
            description = "Cadastrar uma nova transferência"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Balancete criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_transparencia', 'ESCRITA')")
    public ResponseEntity<TransparenciaResponseDTO> create(
            @Parameter(description = "Dados da transparência para criação")
            @RequestBody TransparenciaRequestDTO request){
        TransparenciaResponseDTO response = transparenciaService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Excluir transparência (soft delete)",
            description = "Deixar o status da transparência inativo."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transparência excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Transparência não encontrada"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_transparencia', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da transparência a ser excluída: ", example = "1")
            @PathVariable Long id){
        transparenciaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar Transparência",
            description = "Atualiza os dados de uma transparência existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transparência atualizada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Transparência não encontrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_transparencia', 'ESCRITA')")
    public ResponseEntity<TransparenciaResponseDTO> update(
            @Parameter(description = "ID da transparência a ser atualizada", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Novos dados da transparência")
            @RequestBody TransparenciaRequestDTO request) {
            return ResponseEntity.ok(transparenciaService.update(id, request));
    }

    @Operation(
            summary = "Faz o upload de uma transparência",
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
            @ApiResponse(responseCode = "201", description = "Transparência criada com sucesso",
                    content = @Content(schema = @Schema(implementation = TransparenciaResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasPermission('modulo_transparencia', 'ESCRITA')")
    public void uploadFile(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) throws IOException {
        User user = (User) authentication.getPrincipal();
        transparenciaService.importarArquivo(file, user);
    }

}
