package org.portodigital.residencia.oabpe.domain.transparencia;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.demonstrativo.DemonstrativoRepository;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaRequestDTO;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransparenciaService {

    private final TransparenciaRepository transparenciaRepository;
    private final DemonstrativoRepository demonstrativoRepository;
    private final ModelMapper mapper;

    public Page<TransparenciaResponseDTO> getAll(Pageable pageable) {
        return transparenciaRepository.findAll(pageable)
                .map(t -> {
                    TransparenciaResponseDTO dto = mapper.map(t, TransparenciaResponseDTO.class);
                    dto.setNomeDemonstrativo(t.getDemonstrativo().getNome()); // adapte conforme a entidade
                    return dto;
                });
    }

    public TransparenciaResponseDTO getById(Long id) {
        Transparencia transparencia = transparenciaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada"));
        TransparenciaResponseDTO dto = mapper.map(transparencia, TransparenciaResponseDTO.class);
        dto.setNomeDemonstrativo(transparencia.getDemonstrativo().getNome());
        return dto;
    }

    public TransparenciaResponseDTO create(TransparenciaRequestDTO request) {
        Transparencia transparencia = new Transparencia();
        transparencia.setReferencia(request.getReferencia());
        transparencia.setAno(request.getAno());
        transparencia.setPeriodicidade(request.getPeriodicidade());
        transparencia.setDtPrevEntr(request.getDtPrevEntr());
        transparencia.setDtEntrega(request.getDtEntrega());
        transparencia.setDemonstrativo(demonstrativoRepository.findById(request.getIdDemonst())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado")));

        Transparencia saved = transparenciaRepository.save(transparencia);
        TransparenciaResponseDTO dto = mapper.map(saved, TransparenciaResponseDTO.class);
        dto.setNomeDemonstrativo(saved.getDemonstrativo().getNome());
        return dto;
    }

    public TransparenciaResponseDTO update(Long id, TransparenciaRequestDTO request) {
        Transparencia transparencia = transparenciaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada"));

        transparencia.setReferencia(request.getReferencia());
        transparencia.setAno(request.getAno());
        transparencia.setPeriodicidade(request.getPeriodicidade());
        transparencia.setDtPrevEntr(request.getDtPrevEntr());
        transparencia.setDtEntrega(request.getDtEntrega());
        transparencia.setDemonstrativo(demonstrativoRepository.findById(request.getIdDemonst())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado")));

        Transparencia updated = transparenciaRepository.save(transparencia);
        TransparenciaResponseDTO dto = mapper.map(updated, TransparenciaResponseDTO.class);
        dto.setNomeDemonstrativo(updated.getDemonstrativo().getNome());
        return dto;
    }

    public void delete(Long id) {
        Transparencia transparencia = transparenciaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Transparência não encontrada"));
        transparenciaRepository.delete(transparencia);
    }
}
