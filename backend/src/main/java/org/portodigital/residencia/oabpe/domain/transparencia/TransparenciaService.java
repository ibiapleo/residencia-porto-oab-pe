package org.portodigital.residencia.oabpe.domain.transparencia;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.BalanceteCFOAB;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
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

    public Page<TransparenciaResponseDTO> getAllFiltered(TransparenciaFilteredRequest filter, Pageable pageable) {
        return transparenciaRepository.findAllActiveByFilter(filter, pageable).map(transparencia ->{
            TransparenciaResponseDTO dto = mapper.map(transparencia, TransparenciaResponseDTO.class);
            dto.setDemonstrativoId(transparencia.getDemonstrativo().getId());
            dto.setNomeDemonstrativo(transparencia.getDemonstrativo().getNome());
            return dto;
        });
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
         transparencia.setEficiencia(transparencia.getEficiencia());
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

         mapper.map(request, existing);
         Transparencia updated = transparenciaRepository.save(existing);
         return mapper.map(updated, TransparenciaResponseDTO.class);
     }
 }
