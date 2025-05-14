package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoResponse;
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
@RequestMapping("/v1/tipos-desconto")
@RequiredArgsConstructor
@Tag(name = "Tipos de Desconto", description = "Operações relacionadas aos Tipos de Desconto")
public class TipoDescontoController {

    private final TipoDescontoService tipoDescontoService;

    @Operation(summary = "Listar todos os tipos de desconto")
    @GetMapping
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'LEITURA')")
    public ResponseEntity<Page<TipoDescontoResponse>> getAll(
            @RequestParam(required = false) String nome,
            Pageable pageable) {
        return ResponseEntity.ok(tipoDescontoService.getAll(nome, pageable));
    }

    @Operation(summary = "Buscar tipo de desconto por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tipo de desconto encontrado"),
            @ApiResponse(responseCode = "404", description = "Tipo de desconto não encontrado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'LEITURA')")
    public ResponseEntity<TipoDescontoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tipoDescontoService.getById(id));
    }

    @Operation(summary = "Criar um novo tipo de desconto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tipo de desconto criado com sucesso")
    })
    @PostMapping
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'ESCRITA')")
    public ResponseEntity<TipoDescontoResponse> create(@RequestBody TipoDescontoRequest request) {
        TipoDescontoResponse response = tipoDescontoService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Atualizar tipo de desconto existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'ESCRITA')")
    public ResponseEntity<TipoDescontoResponse> update(@PathVariable Long id,
                                                       @RequestBody TipoDescontoRequest request) {
        return ResponseEntity.ok(tipoDescontoService.update(id, request));
    }

    @Operation(summary = "Remover tipo de desconto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tipo de desconto removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Tipo de desconto não encontrado")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'ESCRITA')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tipoDescontoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Importar arquivo de tipos de desconto",
            description = "Permite que um usuário envie um arquivo para importar tipos de desconto",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Arquivo a ser importado",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Arquivo importado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasPermission('modulo_tipo_desconto', 'ESCRITA')")
    public ResponseEntity<Void> uploadFile(
            @RequestParam("file") MultipartFile file,
            @Parameter(hidden = true) Authentication authentication
    ) throws IOException {
        User user = (User) authentication.getPrincipal();
        tipoDescontoService.importarArquivo(file, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
