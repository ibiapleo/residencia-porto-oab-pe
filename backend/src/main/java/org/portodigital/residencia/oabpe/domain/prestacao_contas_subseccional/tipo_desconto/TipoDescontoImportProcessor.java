package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.commons.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.dto.TipoDescontoRequest;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class TipoDescontoImportProcessor implements ImportProcessor<TipoDescontoRequest> {

    private final Validator validator;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Nome"};
    }

    @Override
    public TipoDescontoRequest parse(Map<String, String> rowData) {
        TipoDescontoRequest dto = new TipoDescontoRequest();
        dto.setNome(rowData.get("Nome"));
        return dto;
    }

    @Override
    public void validate(TipoDescontoRequest dto) {
        Set<ConstraintViolation<TipoDescontoRequest>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(TipoDescontoRequest dto, User user) {
        TipoDesconto entity = new TipoDesconto();
        entity.setNome(dto.getNome());
        return entity;
    }
}