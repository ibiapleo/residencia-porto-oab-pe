package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.commons.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class BalanceteImportProcessor implements ImportProcessor<BalanceteCFOABRequestDTO> {

    private final Validator validator;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Demonstrativo", "Referencia", "Ano", "Periodicidade", "PrevisaoEntrega"};
    }

    @Override
    public BalanceteCFOABRequestDTO parse(Map<String, String> rowData) {
        BalanceteCFOABRequestDTO dto = new BalanceteCFOABRequestDTO();
        dto.setDemonstracao(rowData.get("Demonstrativo"));
        dto.setReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setPeriodicidade(rowData.get("Periodicidade"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("PrevisaoEntrega"), DateTimeFormatter.ofPattern("M/d/yyyy")));
        dto.setDtEntr(Optional.ofNullable(rowData.get("DataEntrega"))
                .filter(s -> !s.isBlank())
                .map(d -> LocalDate.parse(d, DateTimeFormatter.ofPattern("M/d/yyyy")))
                .orElse(null));
        return dto;
    }

    @Override
    public void validate(BalanceteCFOABRequestDTO dto) {
        Set<ConstraintViolation<BalanceteCFOABRequestDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(BalanceteCFOABRequestDTO dto, User user) {
        BalanceteCFOAB entity = new BalanceteCFOAB();
        entity.setDemonstracao(dto.getDemonstracao());
        entity.setReferencia(dto.getReferencia());
        entity.setAno(dto.getAno());
        entity.setPeriodicidade(dto.getPeriodicidade());
        entity.setDtPrevEntr(dto.getDtPrevEntr());
        entity.setDtEntr(dto.getDtEntr());
        entity.setUser(user);
        entity.setStatus(true);
        entity.setEficiencia(entity.getEficiencia());
        return entity;
    }
}