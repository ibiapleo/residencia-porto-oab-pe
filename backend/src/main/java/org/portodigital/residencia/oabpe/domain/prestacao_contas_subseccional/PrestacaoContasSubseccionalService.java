package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PrestacaoContasSubseccionalService {

    private final PrestacaoContasSubseccionalRepository prestacaoContasSubseccionalRepository;

    private final ModelMapper mapper;

    public Page<PrestacaoContasSubseccionalResponseDTO> getAll(Pageable pageable) {
        return prestacaoContasSubseccionalRepository.findAllAtivos(pageable)
                .map(prestacao -> mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class));
    }

    public PrestacaoContasSubseccionalResponseDTO getById(Long id) {
        return prestacaoContasSubseccionalRepository.findById(id)
                .map(prestacao -> mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
    }

    public PrestacaoContasSubseccionalResponseDTO create(PrestacaoContasSubseccionalRequestDTO request) {
        PrestacaoContasSubseccional prestacao = mapper.map(request, PrestacaoContasSubseccional.class);
        PrestacaoContasSubseccional savedPrestacao = prestacaoContasSubseccionalRepository.save(prestacao);
        return mapper.map(savedPrestacao, PrestacaoContasSubseccionalResponseDTO.class);
    }

    public PrestacaoContasSubseccionalResponseDTO update(Long id, PrestacaoContasSubseccionalRequestDTO request) {
        return prestacaoContasSubseccionalRepository.findById(id)
                .map(existingPrestacao -> {
                    existingPrestacao.setMesReferencia(request.getMesReferencia());
                    existingPrestacao.setAno(request.getAno());
                    existingPrestacao.setDtPrevEntr(request.getDtPrevEntr());
                    existingPrestacao.setDtEntrega(request.getDtEntrega());
                    existingPrestacao.setDtPagto(request.getDtPagto());
                    existingPrestacao.setValorDuodecimo(request.getValorDuodecimo());
                    existingPrestacao.setValorDesconto(request.getValorDesconto());
                    existingPrestacao.setProtocoloSGD(request.getProtocoloSGD());
                    existingPrestacao.setObservacao(request.getObservacao());
                    PrestacaoContasSubseccional updatedPrestacao = prestacaoContasSubseccionalRepository.save(existingPrestacao);
                    return mapper.map(updatedPrestacao, PrestacaoContasSubseccionalResponseDTO.class);
                }).orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
    }

    public void delete(Long id) {
        var existingPrestacao = prestacaoContasSubseccionalRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
        existingPrestacao.setStatus(false);
        prestacaoContasSubseccionalRepository.save(existingPrestacao);
    }
}
