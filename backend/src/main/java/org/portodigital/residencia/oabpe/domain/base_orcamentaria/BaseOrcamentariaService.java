package org.portodigital.residencia.oabpe.domain.base_orcamentaria;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaFilteredRequest;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaRequestDTO;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaResponseDTO;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BaseOrcamentariaService extends AbstractFileImportService<BaseOrcamentariaRequestDTO> {

    private final BaseOrcamentariaRepository baseOrcamentariaRepository;
    private final BaseOrcamentariaImportProcessor processor;
    private final ModelMapper mapper;

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
        List<Object> entidades = importFile(file, user, processor);
        baseOrcamentariaRepository.saveAll(entidades.stream().map(e -> (BaseOrcamentaria) e).toList());
    }

    public Page<BaseOrcamentariaResponseDTO> getAllFiltered(BaseOrcamentariaFilteredRequest filter, Pageable pageable) {
        return baseOrcamentariaRepository.findAllActiveByFilter(filter, pageable)
                .map(baseOrcamentaria -> mapper.map(baseOrcamentaria, BaseOrcamentariaResponseDTO.class));
    }

    public BaseOrcamentariaResponseDTO getById(Long id) {
        return baseOrcamentariaRepository.findById(id)
                .map(baseOrcamentaria -> mapper.map(baseOrcamentaria, BaseOrcamentariaResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Base Orçamentaria não encontrado."));
    }

    public BaseOrcamentariaResponseDTO create(BaseOrcamentariaRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();

        BaseOrcamentaria baseOrcamentaria = mapper.map(request, BaseOrcamentaria.class);

        baseOrcamentaria.setUser(user);
        baseOrcamentaria.setStatus(true);

        BaseOrcamentaria savedBaseOrcamentaria = baseOrcamentariaRepository.save(baseOrcamentaria);
        return mapper.map(savedBaseOrcamentaria, BaseOrcamentariaResponseDTO.class);
    }

    public void delete(Long id) {
        var existingBase = baseOrcamentariaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Base Orçamentaria não encontrado."));
        existingBase.setStatus(false);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        existingBase.setUser(user);

        baseOrcamentariaRepository.save(existingBase);
    }

    public BaseOrcamentariaResponseDTO update(Long id, BaseOrcamentariaRequestDTO request) {
        BaseOrcamentaria existing = baseOrcamentariaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Base Orçamentária não encontrada com ID: " + id));

        mapper.map(request, existing);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        existing.setUser(user);

        BaseOrcamentaria updated = baseOrcamentariaRepository.save(existing);
        return mapper.map(updated, BaseOrcamentariaResponseDTO.class);
    }
}
