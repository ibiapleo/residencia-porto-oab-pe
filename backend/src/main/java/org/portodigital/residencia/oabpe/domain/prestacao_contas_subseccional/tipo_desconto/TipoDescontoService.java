package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.commons.AbstractFileImportService;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoRequest;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoResponse;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        Page<TipoDesconto> page = tipoDescontoRepository.findByNomeContainingIgnoreCase(nome != null ? nome : "", pageable);
        return page.map(tipoDesconto -> modelMapper.map(tipoDesconto, TipoDescontoResponse.class));
    }

    public TipoDescontoResponse getById(Long id) {
        TipoDesconto tipoDesconto = tipoDescontoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TipoDesconto não encontrado com id: " + id));
        return modelMapper.map(tipoDesconto, TipoDescontoResponse.class);
    }

    public TipoDescontoResponse create(TipoDescontoRequest request) {
        TipoDesconto tipoDesconto = modelMapper.map(request, TipoDesconto.class);
        TipoDesconto saved = tipoDescontoRepository.save(tipoDesconto);
        return modelMapper.map(saved, TipoDescontoResponse.class);
    }

    public TipoDescontoResponse update(Long id, TipoDescontoRequest request) {
        TipoDesconto existing = tipoDescontoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TipoDesconto não encontrado com id: " + id));
        modelMapper.map(request, existing);
        TipoDesconto updated = tipoDescontoRepository.save(existing);
        return modelMapper.map(updated, TipoDescontoResponse.class);
    }

    public void delete(Long id) {
        TipoDesconto tipoDesconto = tipoDescontoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("TipoDesconto não encontrado com id: " + id));
        tipoDescontoRepository.delete(tipoDesconto);
    }

    @Transactional
    public void importarArquivo(MultipartFile file, User user) throws IOException {
        List<Object> entidades = importFile(file, user, processor);
        tipoDescontoRepository.saveAll(entidades.stream().map(e -> modelMapper.map(e, TipoDesconto.class)).toList());
    }
}