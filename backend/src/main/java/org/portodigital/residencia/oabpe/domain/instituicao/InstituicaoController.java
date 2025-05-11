package org.portodigital.residencia.oabpe.domain.instituicao;

import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoRequestDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoResponseDTO;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/instituicoes")
@RequiredArgsConstructor
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
