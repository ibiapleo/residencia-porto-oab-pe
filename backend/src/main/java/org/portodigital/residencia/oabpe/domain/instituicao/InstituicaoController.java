package org.portodigital.residencia.oabpe.domain.instituicao;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoRequestDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/instituicoes")
@RequiredArgsConstructor
@Tag(name = "Instituição", description = "Gerencia registros do instituições")
public class InstituicaoController {

    private final InstituicaoService instituicaoService;

    @GetMapping
    public ResponseEntity<List<InstituicaoResponseDTO>> getAll() {
        return ResponseEntity.ok(instituicaoService.getAll());
    }

    @PostMapping
    public ResponseEntity<InstituicaoResponseDTO> createSubseccional(@RequestBody InstituicaoRequestDTO request) {
        InstituicaoResponseDTO newInstituicao = instituicaoService.create(request);
        return new ResponseEntity<>(newInstituicao, HttpStatus.CREATED);
    }
}
