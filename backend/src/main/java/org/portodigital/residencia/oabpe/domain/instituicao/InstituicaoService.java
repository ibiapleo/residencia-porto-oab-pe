package org.portodigital.residencia.oabpe.domain.instituicao;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoRequestDTO;
import org.portodigital.residencia.oabpe.domain.instituicao.dto.InstituicaoResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstituicaoService {

    private final InstituicaoRepository instituicaoRepository;
    private final ModelMapper modelMapper;

    public Page<InstituicaoResponseDTO> getAll(Pageable pageable) {
        return instituicaoRepository.findAllAtivos(pageable)
                .map(instituicao -> modelMapper.map(instituicao, InstituicaoResponseDTO.class));

    }

    public InstituicaoResponseDTO getById(Long id) {
        return instituicaoRepository.findByIdAtivo(id)
                .map(pagamentoDeCotas -> modelMapper.map(pagamentoDeCotas, InstituicaoResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrado."));
    }

    public InstituicaoResponseDTO create(InstituicaoRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        Instituicao instituicao = modelMapper.map(request, Instituicao.class);
        instituicao.setUser(user);
        Instituicao saveInstituicao = instituicaoRepository.save(instituicao);
        return modelMapper.map(saveInstituicao, InstituicaoResponseDTO.class);
    }

    public InstituicaoResponseDTO update(Long id, InstituicaoRequestDTO request) {
        Instituicao existing = instituicaoRepository.findByIdAtivo(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição com id  " + id + " não encontrada"));

        modelMapper.map(request, existing);
        Instituicao updated = instituicaoRepository.save(existing);
        return modelMapper.map(updated, InstituicaoResponseDTO.class);
    }

    public void delete(Long id) {
        Instituicao existing = instituicaoRepository.findByIdAtivo(id)
                .orElseThrow(() -> new EntityNotFoundException("Instituição com id  " + id + " não encontrada"));
        existing.setStatus(false);
        instituicaoRepository.save(existing);
    }
}
