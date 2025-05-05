package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/prestacao-contas")
@RequiredArgsConstructor
public class PrestacaoContasSubseccionalController {

    private final PrestacaoContasSubseccionalService prestacaoContasSubseccionalService;

    @GetMapping
    @PreAuthorize("hasPermission('PrestacaoContas', 'LEITURA')")
    public ResponseEntity<Page<PrestacaoContasSubseccionalResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission('PrestacaoContas', 'LEITURA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasPermission('PrestacaoContas', 'ESCRITA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> create(@RequestBody PrestacaoContasSubseccionalRequestDTO request) {
        PrestacaoContasSubseccionalResponseDTO response = prestacaoContasSubseccionalService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('PrestacaoContas', 'ESCRITA')")
    public ResponseEntity<PrestacaoContasSubseccionalResponseDTO> update(@PathVariable Long id,
                                                                         @RequestBody PrestacaoContasSubseccionalRequestDTO request) {
        return ResponseEntity.ok(prestacaoContasSubseccionalService.update(id, request));
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('PrestacaoContas', 'ESCRITA')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        prestacaoContasSubseccionalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}