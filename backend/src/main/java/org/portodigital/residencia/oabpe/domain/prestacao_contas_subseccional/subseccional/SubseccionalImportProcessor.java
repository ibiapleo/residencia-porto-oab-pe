package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.BalanceteCFOAB;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.commons.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.dto.SubseccionalRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class SubseccionalImportProcessor implements ImportProcessor<SubseccionalRequest> {

    private final Validator validator;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"IdSeccional", "Seccional"};
    }

    @Override
    public SubseccionalRequest parse(Map<String, String> rowData) {
        SubseccionalRequest dto = new SubseccionalRequest();
        dto.setSubSeccional(rowData.get("Seccional"));
        dto.setId(Long.valueOf(rowData.get("IdSeccional")));
        return dto;
    }

    @Override
    public void validate(SubseccionalRequest dto) {
        Set<ConstraintViolation<SubseccionalRequest>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(SubseccionalRequest dto, User user) {
        Subseccional entity = new Subseccional();
        entity.setSubSeccional(dto.getSubSeccional());
        entity.setId(dto.getId());
        entity.setUsuario(user);
        return entity;
    }
}