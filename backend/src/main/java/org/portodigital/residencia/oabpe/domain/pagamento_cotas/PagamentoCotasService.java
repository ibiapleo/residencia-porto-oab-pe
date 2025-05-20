package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.instituicao.InstituicaoRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasFilteredRequest;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDescontoRepository;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagamentoCotasService {

    private final PagamentoCotasRepository pagamentoCotasRepository;
    private final InstituicaoRepository instituicaoRepository;
    private final TipoDescontoRepository tipoDescontoRepository;
    private final ModelMapper mapper;

    public Page<PagamentoCotasResponseDTO> getAllFiltered(PagamentoCotasFilteredRequest filter, Pageable pageable) {
        return pagamentoCotasRepository.findAllActiveByFilter(filter, pageable)
                .map(pagamentoCotas -> mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class));
    }

    public PagamentoCotasResponseDTO getById(Long id) {
        return pagamentoCotasRepository.findById(id)
                .map(pagamentoCotas -> mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cota não encontrado."));
    }

    public PagamentoCotasResponseDTO create(PagamentoCotasRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }

        // se necessário, busca as entidades relacionadas
        var instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada com ID: " + request.getInstituicaoId()));
        var tipoDesconto = tipoDescontoRepository.findById(request.getTipoDescontoId())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de desconto não encontrado com ID: " + request.getTipoDescontoId()));

        User user = (User) authentication.getPrincipal();
        PagamentoCotas pagamentoCotas = mapper.map(request, PagamentoCotas.class);
        pagamentoCotas.setStatus(true);
        pagamentoCotas.setUser(user);
        pagamentoCotas.setInstituicao(instituicao);
        pagamentoCotas.setTipoDesconto(tipoDesconto);

        PagamentoCotas savedPagamentoCotas = pagamentoCotasRepository.save(pagamentoCotas);
        return mapper.map(savedPagamentoCotas, PagamentoCotasResponseDTO.class);
    }

    public void delete(Long id) {
        var existingPagamento = pagamentoCotasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado."));
        existingPagamento.setStatus(false);

        // rastreia o usuário que fez a inativação
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        existingPagamento.setUser(user);

        pagamentoCotasRepository.save(existingPagamento);
    }

    public PagamentoCotasResponseDTO update(Long id, PagamentoCotasRequestDTO request) {
        PagamentoCotas existing = pagamentoCotasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado com id: " + id));


        if (request.getInstituicaoId() != null) {
            var instituicao = instituicaoRepository.findById(request.getInstituicaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Instituição não encontrada com ID: " + request.getInstituicaoId()));
            existing.setInstituicao(instituicao);
        }
        if (request.getTipoDescontoId() != null) {
            var tipoDesconto = tipoDescontoRepository.findById(request.getTipoDescontoId())
                    .orElseThrow(() -> new EntityNotFoundException("Tipo de desconto não encontrado com ID: " + request.getTipoDescontoId()));
            existing.setTipoDesconto(tipoDesconto);
        }

        mapper.map(request, existing);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        existing.setUser(user);

        PagamentoCotas updated = pagamentoCotasRepository.save(existing);
        return mapper.map(updated, PagamentoCotasResponseDTO.class);
    }
}