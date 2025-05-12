package org.portodigital.residencia.oabpe.domain.transparencia;

import io.swagger.v3.oas.annotations.*;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaRequestDTO;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/transparencia")
@RequiredArgsConstructor
public class TransparenciaController {

    private final TransparenciaService transparenciaService;

    @GetMapping
    public ResponseEntity<Page<TransparenciaResponseDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(transparenciaService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransparenciaResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transparenciaService.getById(id));
    }

    @PostMapping
    public ResponseEntity<TransparenciaResponseDTO> create(@RequestBody TransparenciaRequestDTO request) {
        return ResponseEntity.status(201).body(transparenciaService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransparenciaResponseDTO> update(
            @PathVariable Long id, @RequestBody TransparenciaRequestDTO request) {
        return ResponseEntity.ok(transparenciaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transparenciaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
