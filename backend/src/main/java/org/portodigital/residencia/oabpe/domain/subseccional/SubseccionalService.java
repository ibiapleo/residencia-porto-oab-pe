package org.portodigital.residencia.oabpe.domain.subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubseccionalService {

    private final SubseccionalRepository subseccionalRepository;
    private final ModelMapper modelMapper;

    public List<SubseccionalResponse> getAll() {
        return subseccionalRepository.findAll()
                .stream()
                .map(subseccional -> modelMapper.map(subseccional, SubseccionalResponse.class))
                .toList();
    }

    public SubseccionalResponse create(SubseccionalRequest subseccionalRequestDTO) {
        Subseccional subseccional = modelMapper.map(subseccionalRequestDTO, Subseccional.class);
        Subseccional savedSubseccional = subseccionalRepository.save(subseccional);
        return modelMapper.map(savedSubseccional, SubseccionalResponse.class);
    }
}