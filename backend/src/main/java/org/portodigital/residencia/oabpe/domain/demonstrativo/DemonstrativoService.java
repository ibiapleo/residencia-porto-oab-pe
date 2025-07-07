package org.portodigital.residencia.oabpe.domain.demonstrativo;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoRequestDTO;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class DemonstrativoService {

    private final DemonstrativoRepository demonstrativoRepository;
    private final ModelMapper modelMapper;

    public Page<DemonstrativoResponseDTO> getAll(Pageable pageable) {
        return demonstrativoRepository.findAllAtivos(pageable)
                .map(demonstrativo-> modelMapper.map(demonstrativo, DemonstrativoResponseDTO.class));
    }

    public DemonstrativoResponseDTO getById(Long id) {
        return demonstrativoRepository.findByIdAtivo(id)
                .map(balancete -> modelMapper.map(balancete, DemonstrativoResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado."));
    }

    public DemonstrativoResponseDTO create(DemonstrativoRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        Demonstrativo demonstrativo = modelMapper.map(request, Demonstrativo.class);
        demonstrativo.setUser(user);
        Demonstrativo savedDemonstrativo = demonstrativoRepository.save(demonstrativo);
        return modelMapper.map(savedDemonstrativo, DemonstrativoResponseDTO.class);
    }

    public DemonstrativoResponseDTO update(Long id, DemonstrativoRequestDTO request) {
        Demonstrativo existing = demonstrativoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com id: " + id));

        modelMapper.map(request, existing);
        Demonstrativo updated = demonstrativoRepository.save(existing);
        return modelMapper.map(updated, DemonstrativoResponseDTO.class);
    }

    public void delete(Long id) {
        Demonstrativo existing = demonstrativoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com id: " + id));
        existing.setStatus(false);
        demonstrativoRepository.save(existing);
    }
}