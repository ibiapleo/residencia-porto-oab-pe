package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BalanceteCFOABService {

    private final BalanceteCFOABRepository balanceteCFOABRepository;
    private final ModelMapper mapper;

    public Page<BalanceteCFOABResponseDTO> getAll(Pageable pageable) {
        return balanceteCFOABRepository.findAll(pageable)
                .map(balancete -> mapper.map(balancete, BalanceteCFOABResponseDTO.class));
    }

    public BalanceteCFOABResponseDTO getById(Long id) {
        return balanceteCFOABRepository.findById(id)
                .map(balancete -> mapper.map(balancete, BalanceteCFOABResponseDTO.class))
                .orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado."));
    }

    public BalanceteCFOABResponseDTO create(BalanceteCFOABRequestDTO request) {
        BalanceteCFOAB balancete = mapper.map(request, BalanceteCFOAB.class);
        balancete.setStatus("A");
        BalanceteCFOAB savedBalancete = balanceteCFOABRepository.save(balancete);
        return mapper.map(savedBalancete, BalanceteCFOABResponseDTO.class);
    }

    public void delete(Long id) {
        var existingBalancete = balanceteCFOABRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado."));
        existingBalancete.setStatus("I");
        balanceteCFOABRepository.save(existingBalancete);
    }

    public BalanceteCFOABResponseDTO update(Long id, BalanceteCFOABRequestDTO request) {
        return balanceteCFOABRepository.findById(id)
                .map(existingBalancete -> {
                    existingBalancete.setDemonstracao(request.getDemonstracao());
                    existingBalancete.setReferencia(request.getReferencia());
                    existingBalancete.setAno(request.getAno());
                    existingBalancete.setPeriodicidade(request.getPeriodicidade());
                    existingBalancete.setDtPrevEntr(request.getDtPrevEntr());
                    existingBalancete.setDtEntr(request.getDtEntr());
                    BalanceteCFOAB updatedBalancete = balanceteCFOABRepository.save(existingBalancete);
                    return mapper.map(updatedBalancete, BalanceteCFOABResponseDTO.class);
                }).orElseThrow(() -> new EntityNotFoundException("Balancete não encontrado."));
    }

}
