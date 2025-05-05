package org.portodigital.residencia.oabpe.domain.subseccional;

import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/subseccionais")
@RequiredArgsConstructor
public class SubseccionalController  {

    private final SubseccionalService subseccionalService;

    @GetMapping
    public ResponseEntity<List<SubseccionalResponse>> getAll() {
        return ResponseEntity.ok(subseccionalService.getAll());
    }

    @PostMapping
    public ResponseEntity<SubseccionalResponse> createSubseccional(@RequestBody SubseccionalRequest subseccionalRequestDTO) {
        SubseccionalResponse newSubseccional = subseccionalService.create(subseccionalRequestDTO);
        return new ResponseEntity<>(newSubseccional, HttpStatus.CREATED);
    }
}