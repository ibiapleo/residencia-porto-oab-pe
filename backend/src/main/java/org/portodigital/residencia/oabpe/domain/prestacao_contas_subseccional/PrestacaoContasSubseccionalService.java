package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PrestacaoContasSubseccionalService {

    private final PrestacaoContasSubseccionalRepository prestacaoContasSubseccionalRepository;

    private final ModelMapper mapper;

    public Page<PrestacaoContasSubseccionalResponseDTO> getAll(Pageable pageable) {
        return prestacaoContasSubseccionalRepository.findAllAtivos(pageable)
                .map(prestacao -> {
                    PrestacaoContasSubseccionalResponseDTO dto = mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class);
                    dto.setSubseccional(prestacao.getSubseccional().getSubSeccional());
                    return dto;
                });
    }

    public PrestacaoContasSubseccionalResponseDTO getById(Long id) {
        return prestacaoContasSubseccionalRepository.findById(id)
                .map(prestacao -> mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
    }

    public PrestacaoContasSubseccionalResponseDTO create(PrestacaoContasSubseccionalRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        PrestacaoContasSubseccional prestacao = mapper.map(request, PrestacaoContasSubseccional.class);
        prestacao.setUser(user);
        PrestacaoContasSubseccional savedPrestacao = prestacaoContasSubseccionalRepository.save(prestacao);
        PrestacaoContasSubseccionalResponseDTO dto = mapper.map(savedPrestacao, PrestacaoContasSubseccionalResponseDTO.class);
        dto.setUsuarioId(prestacao.getUser().getId());
        return dto;
    }

    public PrestacaoContasSubseccionalResponseDTO update(Long id, PrestacaoContasSubseccionalRequestDTO request) {
        PrestacaoContasSubseccional existing = prestacaoContasSubseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrada com id: " + id));

        mapper.map(request, existing);
        PrestacaoContasSubseccional updated = prestacaoContasSubseccionalRepository.save(existing);
        return mapper.map(updated, PrestacaoContasSubseccionalResponseDTO.class);
    }

    public void delete(Long id) {
        var existingPrestacao = prestacaoContasSubseccionalRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
        existingPrestacao.setStatus(false);
        prestacaoContasSubseccionalRepository.save(existingPrestacao);
    }
}
