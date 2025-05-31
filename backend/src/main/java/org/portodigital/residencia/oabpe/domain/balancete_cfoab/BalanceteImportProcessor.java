package org.portodigital.residencia.oabpe.domain.balancete_cfoab;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.commons.imports.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.demonstrativo.Demonstrativo;
import org.portodigital.residencia.oabpe.domain.demonstrativo.DemonstrativoRepository;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class    BalanceteImportProcessor implements ImportProcessor<BalanceteCFOABRequestDTO> {

    private final Validator validator;
    private final DemonstrativoRepository demonstrativoRepository;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Demonstrativo", "Referencia", "Ano", "Periodicidade", "PrevisaoEntrega"};
    }

    @Override
    public BalanceteCFOABRequestDTO parse(Map<String, String> rowData) {
        BalanceteCFOABRequestDTO dto = new BalanceteCFOABRequestDTO();
        dto.setDemonstrativoNome(rowData.get("Demonstrativo").trim());
        dto.setReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setPeriodicidade(rowData.get("Periodicidade"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("PrevisaoEntrega"), DateTimeFormatter.ofPattern("d/M/yyyy")));
        dto.setDtEntr(Optional.ofNullable(rowData.get("DataEntrega"))
                .filter(s -> !s.isBlank())
                .map(d -> LocalDate.parse(d, DateTimeFormatter.ofPattern("d/M/yyyy")))
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

        Demonstrativo demonstrativo = demonstrativoRepository.findByNomeAtivo(dto.getDemonstrativoNome())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com nome: " + dto.getDemonstrativoNome()));

        BalanceteCFOAB entity = new BalanceteCFOAB();
        entity.setDemonstrativo(demonstrativo);
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