package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagamentoCotasService {

    private final PagamentoCotasRepository pagamentoCotasRepository;
    private final ModelMapper mapper;

    public Page<PagamentoCotasResponseDTO> getAll(Pageable pageable) {
        return pagamentoCotasRepository.findAll(pageable)
                .map(pagamentoCotas -> mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class));
    }

    public PagamentoCotasResponseDTO getById(Long id) {
        return pagamentoCotasRepository.findById(id)
                .map(pagamentoCotas -> mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cota não encontrado."));
    }

    public PagamentoCotasResponseDTO create(PagamentoCotasRequestDTO request) {
        PagamentoCotas pagamentoCotas = mapper.map(request, PagamentoCotas.class);

        pagamentoCotas.setStatus("A");

        PagamentoCotas savedPagamentoCotas = pagamentoCotasRepository.save(pagamentoCotas);
        return mapper.map(savedPagamentoCotas, PagamentoCotasResponseDTO.class);
    }

    public void delete(Long id) {
        var existingPagamento = pagamentoCotasRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado."));

        existingPagamento.setStatus("I");

        pagamentoCotasRepository.save(existingPagamento);
    }

    public PagamentoCotasResponseDTO update(Long id, PagamentoCotasRequestDTO request) {
        return pagamentoCotasRepository.findById(id)
                .map(existingPagamentoCotas -> {
                    existingPagamentoCotas.setMesReferencia(request.getMesReferencia());
                    existingPagamentoCotas.setAno(request.getAno());
                    existingPagamentoCotas.setDtPrevEntr(request.getDtPrevEntr());
                    existingPagamentoCotas.setValorDuodecimo(request.getValorDuodecimo());
                    existingPagamentoCotas.setValorDesconto(request.getValorDesconto());
                    existingPagamentoCotas.setValorPago(request.getValorPago());
                    existingPagamentoCotas.setDtPagto(request.getDtPagto());
                    existingPagamentoCotas.setObservacao(request.getObservacao());
                    PagamentoCotas updatedPagamentoCotas = pagamentoCotasRepository.save(existingPagamentoCotas);
                    return mapper.map(updatedPagamentoCotas, PagamentoCotasResponseDTO.class);
                }).orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado."));
    }
}
