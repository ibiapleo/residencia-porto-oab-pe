package org.portodigital.residencia.oabpe.domain.base_orcamentaria;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaRequestDTO;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaResponseDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotas;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotasRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BaseOrcamentariaService {

    private final BaseOrcamentariaRepository baseOrcamentariaRepository;
    private final ModelMapper mapper;

    public Page<BaseOrcamentariaResponseDTO> getAll(Pageable pageable) {
        return baseOrcamentariaRepository.findAll(pageable)
                .map(baseOrcamentaria -> mapper.map(baseOrcamentaria, BaseOrcamentariaResponseDTO.class));
    }

    public BaseOrcamentariaResponseDTO getById(Long id) {
        return baseOrcamentariaRepository.findById(id)
                .map(baseOrcamentaria -> mapper.map(baseOrcamentaria, BaseOrcamentariaResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Base Orçamentaria não encontrado."));
    }

    public BaseOrcamentariaResponseDTO create(BaseOrcamentariaRequestDTO request) {
        BaseOrcamentaria baseOrcamentaria = mapper.map(request, BaseOrcamentaria.class);

        baseOrcamentaria.setStatus("A");

        BaseOrcamentaria savedBaseOrcamentaria = baseOrcamentariaRepository.save(baseOrcamentaria);
        return mapper.map(savedBaseOrcamentaria, BaseOrcamentariaResponseDTO.class);
    }

    public void delete(Long id) {
        var existingBase = baseOrcamentariaRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Base Orçamentaria não encontrado."));

        existingBase.setStatus("I");

        baseOrcamentariaRepository.save(existingBase);
    }

    public BaseOrcamentariaResponseDTO update(Long id, BaseOrcamentariaRequestDTO request) {
        return baseOrcamentariaRepository.findById(id)
                .map(existingBaseOrcamentaria -> {
                    //existingBaseOrcamentaria.setLancto(request.getLancto());
                    existingBaseOrcamentaria.setValor(request.getValor());
                    existingBaseOrcamentaria.setDtDocto(request.getDtDocto());
                    existingBaseOrcamentaria.setDtLancto(request.getDtLancto());
                    existingBaseOrcamentaria.setAno(request.getAno());
                    existingBaseOrcamentaria.setTipo(request.getTipo());
                    BaseOrcamentaria updatedBaseOrcamentaria = baseOrcamentariaRepository.save(existingBaseOrcamentaria);
                    return mapper.map(updatedBaseOrcamentaria, BaseOrcamentariaResponseDTO.class);
                }).orElseThrow(() -> new EntityNotFoundException("Base Orçamentaria não encontrado."));
    }
}
