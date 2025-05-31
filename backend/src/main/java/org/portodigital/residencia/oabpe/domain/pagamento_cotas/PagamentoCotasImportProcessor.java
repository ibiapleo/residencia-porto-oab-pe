package org.portodigital.residencia.oabpe.domain.pagamento_cotas;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.commons.imports.ImportProcessor;
import org.portodigital.residencia.oabpe.domain.instituicao.Instituicao;
import org.portodigital.residencia.oabpe.domain.instituicao.InstituicaoRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Map;

import java.time.LocalDate;
import java.util.Set;

import static com.fasterxml.jackson.core.io.doubleparser.JavaBigDecimalParser.parseBigDecimal;


@Component
@RequiredArgsConstructor
public class PagamentoCotasImportProcessor implements ImportProcessor<PagamentoCotasRequestDTO> {

    private final Validator validator;
    private final InstituicaoRepository instituicaoRepository;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Instituição", "Referencia", "Ano", "Prazo", "Valor Duodecimo", "Valor Desconto"};
    }

    @Override
    public PagamentoCotasRequestDTO parse(Map<String, String> rowData){
        PagamentoCotasRequestDTO dto = new PagamentoCotasRequestDTO();
        dto.setInstituicaoNome(rowData.get("Instituição").trim());
        dto.setMesReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("Prazo"), DateTimeFormatter.ofPattern("M/d/yyyy")));
        dto.setValorDuodecimo(parseBigDecimal(rowData.get("Valor Duodecimo")));
        dto.setValorDesconto(parseBigDecimal(rowData.get("Valor Desconto")));
        dto.setTipoDesconto(rowData.get("Tipo Desconto").trim());
        dto.setValorPago(parseBigDecimal(rowData.get("Valor Pago")));
        dto.setDtPagto(LocalDate.parse(rowData.get("Data de pagamento"), DateTimeFormatter.ofPattern("M/d/yyyy")));
        dto.setObservacao(rowData.get("Observacao"));
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
        Instituicao instituicao = instituicaoRepository.findByNomeAtivo(dto.getInstituicaoNome())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com ID: " + dto.getInstituicaoNome()));

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
