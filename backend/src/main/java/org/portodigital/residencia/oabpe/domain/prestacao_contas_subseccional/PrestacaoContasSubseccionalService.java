package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalFiltroRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalResponseDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.Subseccional;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.dto.SubseccionalRequest;
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

@Service
@RequiredArgsConstructor
public class PrestacaoContasSubseccionalService extends AbstractFileImportService<PrestacaoContasSubseccionalRequestDTO> {

    private final PrestacaoContasSubseccionalRepository prestacaoContasSubseccionalRepository;
    private final PrestacaoContasImportProcessor processor;
    private final ModelMapper mapper;

    public Page<PrestacaoContasSubseccionalResponseDTO> getAllComFiltro(PrestacaoContasSubseccionalFiltroRequest filtro, Pageable pageable) {
        return prestacaoContasSubseccionalRepository.findAllByFiltros(filtro, pageable)
                .map(prestacao -> {
                    PrestacaoContasSubseccionalResponseDTO dto = mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class);
                    dto.setSubseccional(prestacao.getSubseccional().getSubSeccional());
                    dto.setTipoDesconto(prestacao.getTipoDesconto().getNome());
                    return dto;
                });
    }

    public PrestacaoContasSubseccionalResponseDTO getById(Long id) {
        return prestacaoContasSubseccionalRepository.findById(id)
                .map(prestacao -> mapper.map(prestacao, PrestacaoContasSubseccionalResponseDTO.class))
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

        prestacao.setUser(user);
        prestacao.setValorPago(prestacao.getValorPago());

        PrestacaoContasSubseccional savedPrestacao = prestacaoContasSubseccionalRepository.save(prestacao);
        PrestacaoContasSubseccionalResponseDTO dto = mapper.map(savedPrestacao, PrestacaoContasSubseccionalResponseDTO.class);
        dto.setUsuarioId(prestacao.getUser().getId());
    }

    public PrestacaoContasSubseccionalResponseDTO update(Long id, PrestacaoContasSubseccionalRequestDTO request) {
        PrestacaoContasSubseccional existing = prestacaoContasSubseccionalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Prestação de contas não encontrada com id: " + id));

        mapper.map(request, existing);
        PrestacaoContasSubseccional updated = prestacaoContasSubseccionalRepository.save(existing);
        return mapper.map(updated, PrestacaoContasSubseccionalResponseDTO.class);
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
