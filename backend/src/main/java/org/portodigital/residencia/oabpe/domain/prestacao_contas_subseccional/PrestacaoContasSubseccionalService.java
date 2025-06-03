package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.commons.imports.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalFiltroRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.Subseccional;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.SubseccionalRepository;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDesconto;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDescontoRepository;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrestacaoContasSubseccionalService extends AbstractFileImportService<PrestacaoContasSubseccionalRequestDTO> {

    private final PrestacaoContasSubseccionalRepository prestacaoContasSubseccionalRepository;
    private final SubseccionalRepository subseccionalRepository;
    private final TipoDescontoRepository tipoDescontoRepository;
    private final PrestacaoContasImportProcessor processor;
    private final ModelMapper mapper;

    public Object getAllFiltered(PrestacaoContasSubseccionalFiltroRequest filtro, Pageable pageable, boolean download) {
        if (download) {
            List<PrestacaoContasSubseccional> prestacoes = prestacaoContasSubseccionalRepository.findAllActiveByFilter(filtro);
            return prestacoes.stream()
                    .map(prestacao -> {
                        PrestacaoContasSubseccionalResponseDTO dto = mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class);
                        dto.setIdSubseccional(prestacao.getSubseccional().getId());
                        dto.setSubseccional(prestacao.getSubseccional().getSubSeccional());
                        dto.setIdTipoDesconto(prestacao.getTipoDesconto().getId());
                        dto.setTipoDesconto(prestacao.getTipoDesconto().getNome());
                        return dto;
                    })
                    .collect(Collectors.toList());
        } else {
            return prestacaoContasSubseccionalRepository.findAllActiveByFilter(filtro, pageable)
                    .map(prestacao -> {
                        PrestacaoContasSubseccionalResponseDTO dto = mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class);
                        dto.setSubseccional(prestacao.getSubseccional().getSubSeccional());
                        dto.setIdSubseccional(prestacao.getSubseccional().getId());

                        Optional.ofNullable(prestacao.getTipoDesconto()).ifPresent(tipoDesconto -> {
                            dto.setTipoDesconto(tipoDesconto.getNome());
                            dto.setIdTipoDesconto(tipoDesconto.getId());
                        });

                        return dto;
                    });
        }
    }

    public PrestacaoContasSubseccionalResponseDTO getById(Long id) {
        return prestacaoContasSubseccionalRepository.findById(id)
                .map(prestacao -> {
                    PrestacaoContasSubseccionalResponseDTO dto = mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class);
                    dto.setSubseccional(prestacao.getSubseccional().getSubSeccional());
                    dto.setIdSubseccional(prestacao.getSubseccional().getId());

                    Optional.ofNullable(prestacao.getTipoDesconto()).ifPresent(tipoDesconto -> {
                        dto.setTipoDesconto(tipoDesconto.getNome());
                        dto.setIdTipoDesconto(tipoDesconto.getId());
                    });

                    return dto;
                })
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
    }

    public void create(PrestacaoContasSubseccionalRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }

        User user = (User) authentication.getPrincipal();
        PrestacaoContasSubseccional prestacao = mapper.map(request, PrestacaoContasSubseccional.class);

        LocalDate dtPrevEntr = prestacao.getDtPrevEntr();
        LocalDate dtEntrega = prestacao.getDtEntrega();
        LocalDate dtPagto = prestacao.getDtPagto();

        if (dtEntrega != null && dtPrevEntr != null && dtEntrega.isAfter(dtPrevEntr)) {
            throw new IllegalArgumentException("A Data de Entrega não pode ser posterior à Data Prevista de Entrega.");
        }

        if (dtPagto != null && dtEntrega != null && dtPagto.isAfter(dtEntrega)) {
            throw new IllegalArgumentException("A Data de Pagamento não pode ser posterior à Data de Entrega.");
        }

        Subseccional subseccional = subseccionalRepository.findById(request.getIdSubseccional())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Subseccional não encontrada com nome: " + request.getIdSubseccional()));

        TipoDesconto tipoDesconto = null;

        if(request.getIdTipoDesconto() != null){
            tipoDesconto = tipoDescontoRepository.findById(request.getIdTipoDesconto())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Subseccional não encontrada com nome: " + request.getIdTipoDesconto()));
        }

        prestacao.setUser(user);
        prestacao.setValorPago(prestacao.getValorPago());
        prestacao.setSubseccional(subseccional);
        prestacao.setTipoDesconto(tipoDesconto);

        prestacaoContasSubseccionalRepository.save(prestacao);
    }

    public PrestacaoContasSubseccionalResponseDTO update(Long id, PrestacaoContasSubseccionalRequestDTO request) {
        PrestacaoContasSubseccional existing = prestacaoContasSubseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrada com id: " + id));

        applyUpdates(request, existing);

        PrestacaoContasSubseccional updated = prestacaoContasSubseccionalRepository.save(existing);
        return mapper.map(updated, PrestacaoContasSubseccionalResponseDTO.class);
    }

    private void applyUpdates(PrestacaoContasSubseccionalRequestDTO request, PrestacaoContasSubseccional existing) {
        Optional.ofNullable(request.getMesReferencia()).ifPresent(existing::setMesReferencia);
        Optional.ofNullable(request.getAno()).ifPresent(existing::setAno);
        Optional.ofNullable(request.getDtPrevEntr()).ifPresent(existing::setDtPrevEntr);
        Optional.ofNullable(request.getDtEntrega()).ifPresent(existing::setDtEntrega);
        Optional.ofNullable(request.getDtPagto()).ifPresent(existing::setDtPagto);
        Optional.ofNullable(request.getValorDuodecimo()).ifPresent(existing::setValorDuodecimo);
        Optional.ofNullable(request.getValorDesconto()).ifPresent(existing::setValorDesconto);
        Optional.ofNullable(request.getProtocoloSGD()).ifPresent(existing::setProtocoloSGD);
        Optional.ofNullable(request.getObservacao()).ifPresent(existing::setObservacao);

        if (request.getSubseccional() != null) {
            Subseccional subseccional = subseccionalRepository.findByNomeAtivo(request.getSubseccional())
                    .orElseThrow(() -> new EntityNotFoundException("Subseccional não encontrada com ID: " + request.getSubseccional()));
            existing.setSubseccional(subseccional);
        }

        if (request.getTipoDesconto() != null) {
            TipoDesconto tipoDesconto = tipoDescontoRepository.findByNomeAtivo(request.getTipoDesconto())
                    .orElseThrow(() -> new EntityNotFoundException("Tipo de desconto não encontrado com ID: " + request.getTipoDesconto()));
            existing.setTipoDesconto(tipoDesconto);
        }
    }

    public void delete(Long id) {
        var existingPrestacao = prestacaoContasSubseccionalRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrado."));
        existingPrestacao.setStatus(false);
        prestacaoContasSubseccionalRepository.save(existingPrestacao);
    }

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
        List<Object> entidades = importFile(file, user, processor);
        prestacaoContasSubseccionalRepository.saveAll(entidades.stream().map(e -> (PrestacaoContasSubseccional) e).toList());
    }
}
