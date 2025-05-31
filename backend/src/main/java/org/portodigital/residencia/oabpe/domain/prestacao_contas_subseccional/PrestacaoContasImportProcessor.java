package org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.commons.imports.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.dto.PrestacaoContasSubseccionalRequestDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.Subseccional;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.subseccional.SubseccionalRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class PrestacaoContasImportProcessor implements ImportProcessor<PrestacaoContasSubseccionalRequestDTO> {

    private final Validator validator;
    private final SubseccionalRepository subseccionalRepository;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{
                "SUBSECCIONAL", "Referencia", "ANO",
                "PRAZO DE ENTREGA", "DATA DE ENTREGA",
                "DATA DE PAGAMENTO", "VALOR PAGO", "OBSERVAÇÃO"
        };
    }

    @Override
    public PrestacaoContasSubseccionalRequestDTO parse(Map<String, String> rowData) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("M/d/yyyy");

        PrestacaoContasSubseccionalRequestDTO dto = new PrestacaoContasSubseccionalRequestDTO();
        dto.setSubseccional(rowData.get("SUBSECCIONAL"));
        dto.setMesReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("ANO"));

        dto.setDtPrevEntr(parseDate(rowData.get("PRAZO DE ENTREGA"), dateFormatter));
        dto.setDtEntrega(parseDate(rowData.get("DATA DE ENTREGA"), dateFormatter));
        dto.setDtPagto(parseDate(rowData.get("DATA DE PAGAMENTO"), dateFormatter));
        dto.setValorPago(parseBigDecimal(rowData.get("VALOR PAGO")));
        dto.setObservacao(rowData.get("OBSERVAÇÃO"));

        return dto;
    }

    @Override
    public void validate(PrestacaoContasSubseccionalRequestDTO dto) {
        Set<ConstraintViolation<PrestacaoContasSubseccionalRequestDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(PrestacaoContasSubseccionalRequestDTO dto, User user) {
        PrestacaoContasSubseccional entity = new PrestacaoContasSubseccional();

        Subseccional subseccional = subseccionalRepository
                .findBySubSeccionalIgnoreCase(dto.getSubseccional())
                .orElseThrow(() -> new IllegalArgumentException("Subseccional não encontrada: " + dto.getSubseccional()));

        entity.setSubseccional(subseccional);
        entity.setMesReferencia(dto.getMesReferencia());
        entity.setAno(dto.getAno());
        entity.setDtPrevEntr(dto.getDtPrevEntr());
        entity.setDtEntrega(dto.getDtEntrega());
        entity.setDtPagto(dto.getDtPagto());
        entity.setValorPago(dto.getValorPago());
        entity.setObservacao(dto.getObservacao());
        entity.setStatus(true);
        entity.setUser(user);

        return entity;
    }

    private LocalDate parseDate(String raw, DateTimeFormatter formatter) {
        if (raw == null || raw.isBlank()) return null;
        return LocalDate.parse(raw.trim(), formatter);
    }

    private BigDecimal parseBigDecimal(String raw) {
        if (raw == null || raw.isBlank()) return null;
        return new BigDecimal(raw.replace(",", ".").trim());
    }
}
