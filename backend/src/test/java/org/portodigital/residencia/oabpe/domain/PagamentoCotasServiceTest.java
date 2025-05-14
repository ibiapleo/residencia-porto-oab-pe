package org.portodigital.residencia.oabpe.domain;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.instituicao.Instituicao;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotas;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotasRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotasService;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDesconto;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PagamentoCotasServiceTest {
    @Mock
    private PagamentoCotasRepository pagamentoCotasRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private PagamentoCotasService pagamentoCotasService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // getAll
    // Scenario 1: retorna todos os pagamentos de cotas paginados
    @Test
    void getAll_givenPageable_whenExistsPagamentos_thenReturnPageOfDTOs() {

        Pageable pageable = PageRequest.of(0, 10);
        PagamentoCotas pagamentoCotas = new PagamentoCotas();
        Page<PagamentoCotas> mockPage = new PageImpl<>(List.of(pagamentoCotas));
        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();

        when(pagamentoCotasRepository.findAll(pageable)).thenReturn(mockPage);
        when(modelMapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);


        Page<PagamentoCotasResponseDTO> result = pagamentoCotasService.getAll(pageable);


        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(pagamentoCotasRepository, times(1)).findAll(pageable);
    }

    // getById
    // Scenario 1: ID existente
    @Test
    void getById_givenValidId_whenPagamentoExists_thenReturnDTO() {

        Long id = 1L;
        PagamentoCotas pagamentoCotas = new PagamentoCotas();
        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(pagamentoCotas));
        when(modelMapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);


        PagamentoCotasResponseDTO result = pagamentoCotasService.getById(id);


        assertThat(result).isEqualTo(responseDTO);
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // Scenario 2: ID inexistente
    @Test
    void getById_givenInvalidId_whenPagamentoNotFound_thenThrowException() {

        Long id = 999L;
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());


        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.getById(id));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // create
    // Scenario 1: usuário não autenticado
    @Test
    void create_givenNoAuthentication_whenCalled_thenThrowException() {

        SecurityContextHolder.clearContext();
        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();


        assertThrows(SecurityException.class, () -> pagamentoCotasService.create(requestDTO));
    }

    // Scenario 2: erro ao salvar no repositório
    @Test
    void create_givenRepositoryError_whenSaving_thenPropagateException() {

        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();
        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(modelMapper.map(requestDTO, PagamentoCotas.class)).thenReturn(new PagamentoCotas());
        when(pagamentoCotasRepository.save(any())).thenThrow(new DataAccessException("Database error") {});


        assertThrows(DataAccessException.class, () -> pagamentoCotasService.create(requestDTO));
    }

    // Scenario 3: criação de pagamento de cotas com sucesso
    @Test
    void create_givenValidRequest_whenSaved_thenReturnDTO() {

        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();
        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        PagamentoCotas savedPagamento = new PagamentoCotas();
        savedPagamento.setUser(mockUser);

        when(modelMapper.map(requestDTO, PagamentoCotas.class)).thenReturn(new PagamentoCotas());
        when(pagamentoCotasRepository.save(any())).thenReturn(savedPagamento);

        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();
        responseDTO.setUsuarioId(mockUser.getId());
        when(modelMapper.map(savedPagamento, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);


        PagamentoCotasResponseDTO result = pagamentoCotasService.create(requestDTO);

        // THEN
        assertThat(result.getUsuarioId()).isEqualTo(mockUser.getId());
        verify(pagamentoCotasRepository, times(1)).save(any());
    }

    // update
    // Scenario 1: Atualização de pagamento de cotas existente
    @Test
    void update_givenValidIdAndRequest_whenUpdated_thenReturnDTO() {

        Long id = 1L;
        PagamentoCotasRequestDTO request = new PagamentoCotasRequestDTO();
        PagamentoCotas existing = new PagamentoCotas();
        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        PagamentoCotas updatedEntity = new PagamentoCotas();
        updatedEntity.setUser(mockUser);

        PagamentoCotasResponseDTO expectedDTO = new PagamentoCotasResponseDTO();
        expectedDTO.setUsuarioId(mockUser.getId());

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(existing));
        when(pagamentoCotasRepository.save(existing)).thenReturn(updatedEntity);

        doAnswer(invocation -> {
            PagamentoCotasRequestDTO source = invocation.getArgument(0);
            PagamentoCotas destination = invocation.getArgument(1);

            // atribuição/ mapeamento do ID da instituição de forma manual.
            if (source.getInstituicaoId() != null) {
                Instituicao instituicao = new Instituicao();
                instituicao.setId(source.getInstituicaoId());
                destination.setInstituicao(instituicao);
            } else {
                destination.setInstituicao(null);
            }

            destination.setMesReferencia(source.getMesReferencia());
            destination.setAno(source.getAno());
            destination.setDtPrevEntr(source.getDtPrevEntr());
            destination.setValorDuodecimo(source.getValorDuodecimo());
            destination.setValorDesconto(source.getValorDesconto());

            // atribuiçao / mapeamento do ID do tipo de desconto
            if (source.getTipoDescontoId() != null) {
                TipoDesconto tipoDesconto = new TipoDesconto();
                tipoDesconto.setId(source.getTipoDescontoId());
                destination.setTipoDesconto(tipoDesconto);
            } else {
                destination.setTipoDesconto(null);
            }

            destination.setValorPago(source.getValorPago());
            destination.setDtPagto(source.getDtPagto());
            destination.setObservacao(source.getObservacao());
            return null;
        }).when(modelMapper).map(any(PagamentoCotasRequestDTO.class), any(PagamentoCotas.class));

        when(modelMapper.map(updatedEntity, PagamentoCotasResponseDTO.class)).thenReturn(expectedDTO);


        PagamentoCotasResponseDTO result = pagamentoCotasService.update(id, request);


        assertThat(result).isEqualTo(expectedDTO);
        assertThat(result.getUsuarioId()).isEqualTo(mockUser.getId());
        verify(modelMapper).map(request, existing);
        verify(modelMapper).map(updatedEntity, PagamentoCotasResponseDTO.class);
        verify(pagamentoCotasRepository).save(existing);
    }

    // Scenario 2: Campos realmente atualizados
    @Test
    void update_givenRequestWithFields_whenUpdated_thenEntityHasNewValues() {

        PagamentoCotasRequestDTO request = new PagamentoCotasRequestDTO();
        request.setMesReferencia("05");
        request.setAno("2024");

        PagamentoCotas existing = new PagamentoCotas();
        existing.setMesReferencia("04");
        existing.setAno("2023");

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(pagamentoCotasRepository.findById(1L)).thenReturn(Optional.of(existing));

        doAnswer(invocation -> {
            PagamentoCotasRequestDTO source = invocation.getArgument(0);
            PagamentoCotas destination = invocation.getArgument(1);

            // atribuição/ mapeamento do ID da instituição de forma manual.
            if (source.getInstituicaoId() != null) {
                Instituicao instituicao = new Instituicao();
                instituicao.setId(source.getInstituicaoId());
                destination.setInstituicao(instituicao);
            } else {
                destination.setInstituicao(null);
            }

            destination.setMesReferencia(source.getMesReferencia());
            destination.setAno(source.getAno());
            destination.setDtPrevEntr(source.getDtPrevEntr());
            destination.setValorDuodecimo(source.getValorDuodecimo());
            destination.setValorDesconto(source.getValorDesconto());

            // atribuiçao / mapeamento do ID do tipo de desconto
            if (source.getTipoDescontoId() != null) {
                TipoDesconto tipoDesconto = new TipoDesconto();
                tipoDesconto.setId(source.getTipoDescontoId());
                destination.setTipoDesconto(tipoDesconto);
            } else {
                destination.setTipoDesconto(null);
            }

            destination.setValorPago(source.getValorPago());
            destination.setDtPagto(source.getDtPagto());
            destination.setObservacao(source.getObservacao());
            return null;
        }).when(modelMapper).map(any(PagamentoCotasRequestDTO.class), any(PagamentoCotas.class));

        // Mock do retorno do modelMapper para evitar NPE ao setar usuarioId -> verificar
        when(modelMapper.map(any(), eq(PagamentoCotasResponseDTO.class)))
                .thenReturn(new PagamentoCotasResponseDTO());


        pagamentoCotasService.update(1L, request);


        assertThat(existing.getMesReferencia()).isEqualTo("05");
        assertThat(existing.getAno()).isEqualTo("2024");
        assertThat(existing.getUser()).isEqualTo(mockUser);
    }

    // Scenario 3: Atualização de pagamento de cotas inexistente
    @Test
    void update_givenInvalidId_whenPagamentoNotFound_thenThrowException() {

        Long id = 999L;
        PagamentoCotasRequestDTO request = new PagamentoCotasRequestDTO();
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());


        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.update(id, request));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // delete
    // Scenario 1: Inativação de pagamento de cotas existente
    @Test
    void delete_givenValidId_whenSoftDelete_thenUpdateStatusToIAndUser() {

        Long id = 1L;
        PagamentoCotas entity = new PagamentoCotas();
        entity.setStatus("A");

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(entity));


        pagamentoCotasService.delete(id);


        assertThat(entity.getStatus()).isEqualTo("I");
        assertThat(entity.getUser()).isEqualTo(mockUser);
        verify(pagamentoCotasRepository, times(1)).save(entity);
    }

    // Scenario 2: Inativação de pagamento de cotas inexistente
    @Test
    void delete_givenInvalidId_whenPagamentoNotFound_thenThrowException() {

        Long id = 999L;
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());


        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.delete(id));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }
}