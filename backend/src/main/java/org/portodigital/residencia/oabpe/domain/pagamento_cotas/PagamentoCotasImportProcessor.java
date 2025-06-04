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
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDesconto;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDescontoRepository;
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
    private final TipoDescontoRepository tipoDescontoRepository;

    @Override
    public String[] getRequiredHeaders() {
        return new String[]{"Instituição", "Referencia", "Ano", "Prazo", "Valor Duodecimo", "Valor Desconto"};
    }

    @Override
    public PagamentoCotasRequestDTO parse(Map<String, String> rowData){
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");

        PagamentoCotasRequestDTO dto = new PagamentoCotasRequestDTO();
        dto.setInstituicao(rowData.get("Instituição").trim());
        dto.setMesReferencia(rowData.get("Referencia"));
        dto.setAno(rowData.get("Ano"));
        dto.setDtPrevEntr(LocalDate.parse(rowData.get("Prazo"), dateFormatter));
        dto.setValorDuodecimo(parseBigDecimal(rowData.get("Valor Duodecimo")));
        dto.setValorDesconto(parseBigDecimal(rowData.get("Valor Desconto")));
        dto.setTipoDesconto(rowData.get("Tipo Desconto").trim());
        dto.setValorPago(parseBigDecimal(rowData.get("Valor Pago")));
        dto.setDtPagto(LocalDate.parse(rowData.get("Data de pagamento"), dateFormatter));
        dto.setObservacao(rowData.get("Observação"));
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
        Instituicao instituicao = instituicaoRepository.findByNomeAtivo(dto.getInstituicao())
                .orElseThrow(() -> new EntityNotFoundException("Demonstrativo não encontrado com nome: " + dto.getInstituicao()));

        TipoDesconto tipoDesconto = tipoDescontoRepository.findByNomeAtivo(dto.getTipoDesconto())
                .orElseThrow(() -> new EntityNotFoundException("Tipo de Desconto não encontrado com nome: " + dto.getTipoDesconto()));

        PagamentoCotas entity = new PagamentoCotas();
        entity.setInstituicao(instituicao);
        entity.setTipoDesconto(tipoDesconto);
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
