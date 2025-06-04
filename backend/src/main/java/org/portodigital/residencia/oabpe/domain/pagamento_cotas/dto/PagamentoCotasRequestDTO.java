package org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagamentoCotasRequestDTO {

    @NotBlank(message = "Instituição é obrigatório")
    private String instituicao;
    @NotBlank(message = "Mês de referência é obrigatório")
    private String mesReferencia;
    @NotBlank(message = "Ano é obrigatório")
    private String ano;
    @NotNull(message = "Data de Previsão de Entrega é obrigatória")
    private LocalDate dtPrevEntr;
    private BigDecimal valorDuodecimo;
    private BigDecimal valorDesconto;
    @NotBlank(message = "Tipo de Desconto é obrigatório.")
    private String tipoDesconto;
    private BigDecimal valorPago;
    private LocalDate dtPagto;
    private String observacao;

}
