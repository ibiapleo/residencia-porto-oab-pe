package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.demonstrativo.dto.DemonstrativoResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoResponse;
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
public class TipoDescontoService extends AbstractFileImportService<TipoDescontoRequest> {

    private final TipoDescontoRepository tipoDescontoRepository;
    private final TipoDescontoImportProcessor processor;
    private final ModelMapper modelMapper;

    public Page<TipoDescontoResponse> getAll(String nome, Pageable pageable) {
        return tipoDescontoRepository.findAllAtivos(pageable)
                .map(tipodesconto -> modelMapper.map(tipodesconto, TipoDescontoResponse.class));
    }

    public TipoDescontoResponse getById(Long id) {
        return tipoDescontoRepository.findByIdAtivo(id)
                .map(tipodesconto -> modelMapper.map(tipodesconto, TipoDescontoResponse.class))
                .orElseThrow(() -> new EntityNotFoundException("Tipo de Desconto não encontrado."));
    }

    public TipoDescontoResponse create(TipoDescontoRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new SecurityException("Acesso não autorizado");
        }
        User user = (User) authentication.getPrincipal();
        TipoDesconto tipodesconto = modelMapper.map(request, TipoDesconto.class);
        tipodesconto.setUser(user);
        TipoDesconto savedTipoDesconto = tipoDescontoRepository.save(tipodesconto);
        return modelMapper.map(savedTipoDesconto, TipoDescontoResponse.class);
    }

    public TipoDescontoResponse update(Long id, TipoDescontoRequest request) {
        TipoDesconto existing = tipoDescontoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tipo de Desconto não encontrado com id: " + id));

        modelMapper.map(request, existing);
        TipoDesconto updated = tipoDescontoRepository.save(existing);
        return modelMapper.map(updated, TipoDescontoResponse.class);
    }

    public void delete(Long id) {
        TipoDesconto existing = tipoDescontoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tipo de Desconto encontrado com id: " + id));
        existing.setStatus(false);
        tipoDescontoRepository.save(existing);
    }

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
        List<Object> entidades = importFile(file, user, processor);
        tipoDescontoRepository.saveAll(entidades.stream().map(e -> modelMapper.map(e, TipoDesconto.class)).toList());
    }
}