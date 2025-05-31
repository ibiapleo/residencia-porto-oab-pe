package org.portodigital.residencia.oabpe.domain.base_orcamentaria;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.base_orcamentaria.dto.BaseOrcamentariaRequestDTO;
import org.portodigital.residencia.oabpe.domain.commons.imports.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;

import static com.fasterxml.jackson.core.io.doubleparser.JavaBigDecimalParser.parseBigDecimal;

@Component
@RequiredArgsConstructor
public class BaseOrcamentariaImportProcessor implements ImportProcessor<BaseOrcamentariaRequestDTO> {
    private final Validator validator;
    private final BaseOrcamentariaRepository baseOrcamentariaRepository;

    @Override
    public String[] getRequiredHeaders(){
        return new String[]{"Lançamento", "Data Lançamento", "Valor", "Ano" };
    }

    @Override
    public BaseOrcamentariaRequestDTO parse(Map<String, String> rowData){
        BaseOrcamentariaRequestDTO dto = new BaseOrcamentariaRequestDTO();
        dto.setLancto(rowData.get("Lançamento"));
        dto.setDtLancto(LocalDate.parse(rowData.get("Data Lançamento"), DateTimeFormatter.ofPattern("M/d/yyyy")));
        dto.setValor(parseBigDecimal(rowData.get("Valor")));
        dto.setAno(rowData.get("Ano"));
        return dto;
    }

    @Override
    public void validate(BaseOrcamentariaRequestDTO dto) {
        Set<ConstraintViolation<BaseOrcamentariaRequestDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(BaseOrcamentariaRequestDTO dto, User user){

        BaseOrcamentaria entity = new BaseOrcamentaria();
        entity.setLancto(dto.getLancto());
        entity.setDtLancto(dto.getDtLancto());
        entity.setValor(dto.getValor());
        entity.setDtDocto(dto.getDtDocto());
        entity.setAno(dto.getAno());
        entity.setTipo(dto.getTipo());
        entity.setUser(user);
        entity.setStatus(true);
        return entity;
    }

}
