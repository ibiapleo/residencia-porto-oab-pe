package org.portodigital.residencia.oabpe.domain.instituicao;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoRequestDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;
    private final ModelMapper modelMapper;

    public List<InstituicaoResponseDTO> getAll() {
        return instituicaoRepository.findAll()
                .stream()
                .map(instituicao -> modelMapper.map(instituicao, InstituicaoResponseDTO.class))
                .toList();
    }

    public InstituicaoResponseDTO create(InstituicaoRequestDTO request) {
        Instituicao instituicao = modelMapper.map(request, Instituicao.class);
        Instituicao saveInstituicao = instituicaoRepository.save(instituicao);
        return modelMapper.map(saveInstituicao, InstituicaoResponseDTO.class);
    }
}
