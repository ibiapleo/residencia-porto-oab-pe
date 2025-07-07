package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasFilteredRequest;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
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
@RequestMapping("/v1/pagamento-cotas")
@RequiredArgsConstructor
@Tag(name = "Pagamento de cotas", description = "Gerencia registros de pagamento de cotas")
public class PagamentoCotasController {

    private final PagamentoCotasService pagamentoCotasService;

    @Operation(
            summary = "Listar Pagamentos de Cotas",
            description = "Retorna uma lista paginada e filtrada de todos os Pagamnetos de Cotas cadastrados"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping
    @PreAuthorize("hasPermission('modulo_pagamento_cotas', 'LEITURA')")
    public ResponseEntity<Page<PagamentoCotasResponseDTO>> getAllFiltered(
            PagamentoCotasFilteredRequest filter,
            Pageable pageable) {
        return ResponseEntity.ok(pagamentoCotasService.getAllFiltered(filter, pageable));
    }

    @Operation(
            summary = "Buscar Pagamento de Cota por ID",
            description = "Retorna os detalhes de um Pagamento de Cota específico"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento encontrado"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_pagamento_cotas', 'LEITURA')")
    public ResponseEntity<PagamentoCotasResponseDTO> getById(
            @Parameter(description = "ID do Pagamento", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(pagamentoCotasService.getById(id));
    }

    @Operation(
            summary = "Criar novo Pagamento de Cota",
            description = "Cadastra um novo registro de Pagamento de Cota"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pagamento criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_pagamento_cotas', 'ESCRITA')")
    public ResponseEntity<PagamentoCotasResponseDTO> create(
            @Parameter(description = "Dados do pagamento para criação")
            @RequestBody PagamentoCotasRequestDTO request) {
        PagamentoCotasResponseDTO response = pagamentoCotasService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Excluir Pagamento de Cota (soft delete)",
            description = "Deixar o status de um Pagamento de Cota inativo"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Pagamento inativo com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_pagamento_cotas', 'ESCRITA')")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID do pagamento a ser excluído", example = "1")
            @PathVariable Long id) {
        pagamentoCotasService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Atualizar Pagamento",
            description = "Atualiza os dados de um Pagamento existente"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento atualizado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pagamento não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso não autorizado")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_pagamento_cotas', 'ESCRITA')")
    public ResponseEntity<PagamentoCotasResponseDTO> update(
            @Parameter(description = "ID do Pagamento de Cota a ser atualizado", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Novos dados do Pagamento")
            @RequestBody PagamentoCotasRequestDTO request) {
        return ResponseEntity.ok(pagamentoCotasService.update(id, request));
    }

    @Operation(
            summary = "Faz o upload de um Pagamento de Cotas",
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
            @ApiResponse(responseCode = "201", description = "Pagamento criado com sucesso",
                    content = @Content(schema = @Schema(implementation = PagamentoCotasResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void uploadFile(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) throws IOException {
        User user = (User) authentication.getPrincipal();
        pagamentoCotasService.importarArquivo(file, user);
    }
}
