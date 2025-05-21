package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.commons.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.instituicao.Instituicao;
import org.portodigital.residencia.oabpe.domain.instituicao.InstituicaoRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Map;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static com.fasterxml.jackson.core.io.doubleparser.JavaBigDecimalParser.parseBigDecimal;
import static jakarta.xml.bind.DatatypeConverter.parseDate;


@Component
@RequiredArgsConstructor
public class PagamentoCotasImportProcessor implements ImportProcessor<PagamentoCotasRequestDTO> {

    private final Validator validator;
    private final InstituicaoRepository instituicaoRepository;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Id_Instituião", "Instituição", "Referencia", "Ano", "Prazo", "Valor Duodecimo", "Valor Desconto"};
    }

    @Override
    public PagamentoCotasRequestDTO parse(Map<String, String> rowData){
        PagamentoCotasRequestDTO dto = new PagamentoCotasRequestDTO();
        dto.setInstituicaoId(Long.valueOf(rowData.get("Id_Instituicao")));
        dto.setInstituicao(rowData.get("Instituicao"));
        dto.setMesReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("Prazo"), DateTimeFormatter.ofPattern("M/d/yyyy")));
        dto.setValorDuodecimo(parseBigDecimal(rowData.get("Valor Duodecimo")));
        dto.setValorDesconto(parseBigDecimal(rowData.get("Valor Desconto")));
        return dto;

    }

    @Override
    public void validate(PagamentoCotasRequestDTO dto) {
        Set<ConstraintViolation<PagamentoCotasRequestDTO>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (ConstraintViolation<?> violation : violations) {
                sb.append(violation.getMessage()).append("; ");
            }
            throw new IllegalArgumentException("Validação falhou: " + sb);
        }
    }

    @Override
    public Object convertToEntity(PagamentoCotasRequestDTO dto, User user){
        Instituicao instituicao = instituicaoRepository.findByIdAtivo(dto.getInstituicaoId())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com ID: " + dto.getInstituicaoId()));

        PagamentoCotas entity = new PagamentoCotas();
        entity.setInstituicao(instituicao);
        entity.setMesReferencia(dto.getMesReferencia());
        entity.setAno(dto.getAno());
        entity.setDtPrevEntr(dto.getDtPrevEntr());
        entity.setValorDuodecimo(dto.getValorDuodecimo());
        entity.setValorDesconto(dto.getValorDesconto());
        entity.setUser(user);
        entity.setValorPago(dto.getValorPago());
        entity.setObservacao(dto.getObservacao());
        entity.setStatus(true);
        return entity;
    }


}
