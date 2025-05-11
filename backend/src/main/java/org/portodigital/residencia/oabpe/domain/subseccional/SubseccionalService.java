package org.portodigital.residencia.oabpe.domain.subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalRequest;
import org.portodigital.residencia.oabpe.domain.subseccional.dto.SubseccionalResponse;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
                .filter(Subseccional::getStatus)
                .map(subseccional -> modelMapper.map(subseccional, SubseccionalResponse.class))
                .toList();
    }
    public SubseccionalResponse getById(Long id) {
        Subseccional subseccional = subseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subseccional não encontrada com id: " + id));
        return modelMapper.map(subseccional, SubseccionalResponse.class);
    }

    public SubseccionalResponse create(SubseccionalRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Subseccional subseccional = modelMapper.map(request, Subseccional.class);
        subseccional.setUsuario(user);
        Subseccional saved = subseccionalRepository.save(subseccional);
        return modelMapper.map(saved, SubseccionalResponse.class);
    }

    public SubseccionalResponse update(Long id, SubseccionalRequest request) {
        Subseccional existing = subseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subseccional não encontrada com id: " + id));

        modelMapper.map(request, existing);
        Subseccional updated = subseccionalRepository.save(existing);
        return modelMapper.map(updated, SubseccionalResponse.class);
    }

    public void softDelete(Long id) {
        Subseccional existing = subseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Subseccional não encontrada com id: " + id));
        existing.setStatus(false);
        subseccionalRepository.save(existing);
    }
}