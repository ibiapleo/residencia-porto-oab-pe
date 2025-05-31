package org.portodigital.residencia.oabpe.domain.transparencia;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.commons.imports.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.demonstrativo.DemonstrativoRepository;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaFilteredRequest;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaRequestDTO;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaResponseDTO;
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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransparenciaService extends AbstractFileImportService<TransparenciaRequestDTO> {

    private final TransparenciaImportProcessor processor;
    private final TransparenciaRepository transparenciaRepository;
    private final DemonstrativoRepository demonstrativoRepository;
    private final ModelMapper mapper;

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
            List<Object> entidades = importFile(file, user, processor);
            transparenciaRepository.saveAll(entidades.stream().map(e -> (Transparencia) e).toList());
    }

    public Object getAllFiltered(TransparenciaFilteredRequest filter, Pageable pageable, boolean download) {
        if (download) {
            List<Transparencia> transparencias = transparenciaRepository.findAllActiveByFilter(filter);
            return transparencias.stream()
                    .map(transparencia -> {
                        TransparenciaResponseDTO dto = mapper.map(transparencia, TransparenciaResponseDTO.class);
                        dto.setDemonstrativoId(transparencia.getDemonstrativo().getId());
                        dto.setNomeDemonstrativo(transparencia.getDemonstrativo().getNome());
                        return dto;
                    })
                    .collect(Collectors.toList());
        } else {
            return transparenciaRepository.findAllActiveByFilter(filter, pageable).map(transparencia -> {
                TransparenciaResponseDTO dto = mapper.map(transparencia, TransparenciaResponseDTO.class);
                dto.setDemonstrativoId(transparencia.getDemonstrativo().getId());
                dto.setNomeDemonstrativo(transparencia.getDemonstrativo().getNome());
                return dto;
            });
        }
    }

     public TransparenciaResponseDTO getById(Long id) {
         return transparenciaRepository.findById(id)
                 .map(transparencia -> mapper.map(transparencia, TransparenciaResponseDTO.class))
                 .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada."));
     }

     public TransparenciaResponseDTO create(TransparenciaRequestDTO request) {
         Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
         if (authentication == null || authentication.getPrincipal() == null) {
             throw new SecurityException("Acesso não autorizado");
         }

         Demonstrativo demonstrativo = demonstrativoRepository.findByNomeAtivo(request.getDemonstrativoNome())
                 .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Demonstrativo não encontrado com nome: " + request.getDemonstrativoNome()));

         User user = (User) authentication.getPrincipal();
         Transparencia transparencia = mapper.map(request, Transparencia.class);
         transparencia.setUser(user);
         transparencia.setDemonstrativo(demonstrativo);
         Transparencia savedTransparencia = transparenciaRepository.save(transparencia);
         TransparenciaResponseDTO dto = mapper.map(savedTransparencia, TransparenciaResponseDTO.class);
         dto.setNomeDemonstrativo(savedTransparencia.getDemonstrativo().getNome());
         return dto;
     }

     public void delete(Long id) {
         var existingTransparencia = transparenciaRepository.findById(id)
                 .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada."));
         existingTransparencia.setStatus(false);
         transparenciaRepository.save(existingTransparencia);
     }


     public TransparenciaResponseDTO update(Long id, TransparenciaRequestDTO request) {
         Transparencia existing = transparenciaRepository.findById(id)
                 .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada com o id: " + id));

         applyUpdates(request, existing);

         Transparencia updated = transparenciaRepository.save(existing);
         return mapper.map(updated, TransparenciaResponseDTO.class);
     }

    private void applyUpdates(TransparenciaRequestDTO request, Transparencia existing) {
        Optional.ofNullable(request.getReferencia()).ifPresent(existing::setReferencia);
        Optional.ofNullable(request.getAno()).ifPresent(existing::setAno);
        Optional.ofNullable(request.getDtPrevEntr()).ifPresent(existing::setDtPrevEntr);
        Optional.ofNullable(request.getDtEntrega()).ifPresent(existing::setDtEntrega);
        Optional.ofNullable(request.getPeriodicidade()).ifPresent(existing::setPeriodicidade);

        if (request.getDemonstrativoNome() != null) {
            Demonstrativo demonstrativo = demonstrativoRepository.findByNomeAtivo(request.getDemonstrativoNome())
                    .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com nome: " + request.getDemonstrativoNome()));
            existing.setDemonstrativo(demonstrativo);
        }

    }
 }
