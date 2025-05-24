package org.portodigital.residencia.oabpe.domain.transparencia;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.commons.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.demonstrativo.DemonstrativoRepository;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.transparencia.dto.TransparenciaRequestDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class TransparenciaImportProcessor implements ImportProcessor<TransparenciaRequestDTO> {

    private final Validator validator;
    private final DemonstrativoRepository demonstrativoRepository;


    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Demonstrativo", "Referencia", "Ano", "Periodicidade", "Previsao", "DataEntrega" };
    }

    @Override
    public TransparenciaRequestDTO parse(Map<String, String> rowData) {
        TransparenciaRequestDTO dto = new TransparenciaRequestDTO();
        dto.setDemonstrativoNome(rowData.get("Demonstrativo"));
        dto.setReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setPeriodicidade(rowData.get("Periodicidade"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("Previsao"), DateTimeFormatter.ofPattern("dd/mm/yyyy")));
        dto.setDtEntrega(Optional.ofNullable(rowData.get("DataEntrega"))
                .filter(s -> !s.isBlank())
                .map(d -> LocalDate.parse(d, DateTimeFormatter.ofPattern("dd/mm/yyyy")))
                .orElse(null));


        return dto;
    }

    @Override
    public void validate(TransparenciaRequestDTO dto) {
        Set<ConstraintViolation<TransparenciaRequestDTO>> violations = validator.validate(dto);
        if(!violations.isEmpty()){
            StringBuilder sb = new StringBuilder();
            for(ConstraintViolation<?> violation : violations){
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(TransparenciaRequestDTO dto, User user) {

        Demonstrativo demonstrativo =
                demonstrativoRepository.findByNomeAtivo(dto.getDemonstrativoNome()).orElseThrow(() -> new EntityNotFoundException(
                        "Demonstrativo não encontrado com ID: " + dto.getDemonstrativoNome()));

        Transparencia entity = new Transparencia();
        entity.setDemonstrativo(demonstrativo);
        entity.setReferencia(dto.getReferencia());
        entity.setAno(dto.getAno());
        entity.setPeriodicidade(dto.getPeriodicidade());
        entity.setDtPrevEntr(dto.getDtPrevEntr());
        entity.setDtEntrega(dto.getDtEntrega());
        entity.setUser(user);
        entity.setStatus(true);
        entity.setEficiencia(entity.getEficiencia());
        return entity;
    }
}
