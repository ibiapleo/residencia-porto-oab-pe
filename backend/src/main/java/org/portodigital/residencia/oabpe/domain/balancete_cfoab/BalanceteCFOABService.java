package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABFilteredRequest;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.demonstrativo.DemonstrativoRepository;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BalanceteCFOABService extends AbstractFileImportService<BalanceteCFOABRequestDTO> {

    private final BalanceteImportProcessor processor;
    private final BalanceteCFOABRepository balanceteCFOABRepository;
    private final DemonstrativoRepository demonstrativoRepository;
    private final ModelMapper mapper;

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
        List<Object> entidades = importFile(file, user, processor);
        balanceteCFOABRepository.saveAll(entidades.stream().map(e -> (BalanceteCFOAB) e).toList());
    }

    public Page<BalanceteCFOABResponseDTO> getAllFiltered(BalanceteCFOABFilteredRequest filter, Pageable pageable) {
        return balanceteCFOABRepository.findAllActiveByFilter(filter, pageable)
                .map(balancete -> {
                    BalanceteCFOABResponseDTO dto = mapper.map(balancete, BalanceteCFOABResponseDTO.class);
                    dto.setDemonstrativoId(balancete.getDemonstrativo().getId());
                    dto.setNomeDemonstrativo(balancete.getDemonstrativo().getNome());
                    return dto;
                });
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

        Demonstrativo demonstrativo = demonstrativoRepository.findByNomeAtivo(request.getDemonstrativoNome())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demonstrativo não encontrado com nome: " + request.getDemonstrativoNome()));

        User user = (User) authentication.getPrincipal();
        BalanceteCFOAB balancete = mapper.map(request, BalanceteCFOAB.class);
        balancete.setUser(user);
        balancete.setDemonstrativo(demonstrativo);
        balancete.setEficiencia(balancete.getEficiencia());
        BalanceteCFOAB savedBalancete = balanceteCFOABRepository.save(balancete);
        BalanceteCFOABResponseDTO dto = mapper.map(savedBalancete, BalanceteCFOABResponseDTO.class);
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
