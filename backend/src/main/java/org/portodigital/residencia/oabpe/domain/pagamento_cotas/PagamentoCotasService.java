package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
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
    private final ModelMapper mapper;

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if(authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new SecurityException("usuário não autenticado");
        }

        return (User) authentication.getPrincipal();

    }

    public Page<PagamentoCotasResponseDTO> getAll(Pageable pageable) {
        return pagamentoCotasRepository.findAll(pageable)
                .map(pagamentoCotas -> {
                    PagamentoCotasResponseDTO dto = mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class);
                    if (pagamentoCotas.getUser() != null) {
                        dto.setUsuarioId(pagamentoCotas.getUser().getId());
                    }
                    return dto;
                });
    }

    public PagamentoCotasResponseDTO getById(Long id) {
        PagamentoCotas pagamentoCotas = pagamentoCotasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cota não encontrado."));
        PagamentoCotasResponseDTO dto = mapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class);
        if (pagamentoCotas.getUser() != null) {
            dto.setUsuarioId(pagamentoCotas.getUser().getId());
        }
        return dto;
    }

    public PagamentoCotasResponseDTO create(PagamentoCotasRequestDTO request) {
        User user = getAuthenticatedUser();
        PagamentoCotas pagamentoCotas = mapper.map(request, PagamentoCotas.class);
        pagamentoCotas.setStatus("A");
        pagamentoCotas.setUser(user);
        PagamentoCotas savedPagamentoCotas = pagamentoCotasRepository.save(pagamentoCotas);
        PagamentoCotasResponseDTO dto = mapper.map(savedPagamentoCotas, PagamentoCotasResponseDTO.class);
        dto.setUsuarioId(user.getId());
        return dto;
    }

    public void delete(Long id) {
        var existingPagamento = pagamentoCotasRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado."));

        existingPagamento.setStatus("I");

        // "rastreia" o usuário que fez a inativação.
        User user = getAuthenticatedUser();
        existingPagamento.setUser(user);

        pagamentoCotasRepository.save(existingPagamento);
    }

    public PagamentoCotasResponseDTO update(Long id, PagamentoCotasRequestDTO request) {
        PagamentoCotas existingPagamentoCotas = pagamentoCotasRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Pagamento de Cotas não encontrado com o id" + id));

        mapper.map(request, existingPagamentoCotas);
        existingPagamentoCotas.setUser(getAuthenticatedUser());

        PagamentoCotas updatedPagamentoCotas = pagamentoCotasRepository.save(existingPagamentoCotas);
        PagamentoCotasResponseDTO dto = mapper.map(updatedPagamentoCotas, PagamentoCotasResponseDTO.class);
        dto.setUsuarioId(getAuthenticatedUser().getId());
        return dto;
    }
}
