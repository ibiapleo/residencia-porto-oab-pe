package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BalanceteCFOABService {

    private final BalanceteCFOABRepository balanceteCFOABRepository;
    private final ModelMapper mapper;

    public Page<BalanceteCFOABResponseDTO> getAll(Pageable pageable) {
        return balanceteCFOABRepository.findAllAtivos(pageable)
                .map(balancete -> mapper.map(balancete, BalanceteCFOABResponseDTO.class));
    }

    public BalanceteCFOABResponseDTO getById(Long id) {
        return balanceteCFOABRepository.findById(id)
                .map(balancete -> mapper.map(balancete, BalanceteCFOABResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado."));
    }

    public BalanceteCFOABResponseDTO create(BalanceteCFOABRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        BalanceteCFOAB balancete = mapper.map(request, BalanceteCFOAB.class);
        balancete.setUser(user);
        BalanceteCFOAB savedBalancete = balanceteCFOABRepository.save(balancete);
        BalanceteCFOABResponseDTO dto = mapper.map(savedBalancete, BalanceteCFOABResponseDTO.class);
        dto.setUsuarioId(balancete.getUser().getId());
        return dto;
    }

    public void delete(Long id) {
        var existingBalancete = balanceteCFOABRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado."));
        existingBalancete.setStatus(false);
        balanceteCFOABRepository.save(existingBalancete);
    }

    public BalanceteCFOABResponseDTO update(Long id, BalanceteCFOABRequestDTO request) {
        BalanceteCFOAB existing = balanceteCFOABRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado com id: " + id));

        mapper.map(request, existing);
        BalanceteCFOAB updated = balanceteCFOABRepository.save(existing);
        return mapper.map(updated, BalanceteCFOABResponseDTO.class);
    }

}
