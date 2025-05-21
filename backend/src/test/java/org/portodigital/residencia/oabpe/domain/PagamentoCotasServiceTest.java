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
import org.portodigital.residencia.oabpe.domain.instituicao.InstituicaoRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotas;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotasRepository;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.PagamentoCotasService;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasFilteredRequest;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasRequestDTO;
import org.portodigital.residencia.oabpe.domain.pagamento_cotas.dto.PagamentoCotasResponseDTO;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDesconto;
import org.portodigital.residencia.oabpe.domain.prestacao_contas_subseccional.tipo_desconto.TipoDescontoRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PagamentoCotasServiceTest {

    @Mock
    private PagamentoCotasRepository pagamentoCotasRepository;

    @Mock
    private InstituicaoRepository instituicaoRepository;

    @Mock
    private TipoDescontoRepository tipoDescontoRepository;

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
    void getAllFiltered_givenFilterAndPageable_whenExistsPagamentos_thenReturnPageOfDTOs() {
        // GIVEN
        Pageable pageable = PageRequest.of(0, 10);
        PagamentoCotasFilteredRequest filter = new PagamentoCotasFilteredRequest();
        PagamentoCotas pagamentoCotas = new PagamentoCotas();
        Page<PagamentoCotas> mockPage = new PageImpl<>(List.of(pagamentoCotas));
        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();

        when(pagamentoCotasRepository.findAllActiveByFilter(filter, pageable)).thenReturn(mockPage);
        when(modelMapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);

        // WHEN
        Page<PagamentoCotasResponseDTO> result = pagamentoCotasService.getAllFiltered(filter, pageable);

        // THEN
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(pagamentoCotasRepository, times(1)).findAllActiveByFilter(filter, pageable);
    }

    // getById
    // Scenario 1: ID existente
    @Test
    void getById_givenValidId_whenPagamentoExists_thenReturnDTO() {
        // GIVEN
        Long id = 1L;
        PagamentoCotas pagamentoCotas = new PagamentoCotas();
        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(pagamentoCotas));
        when(modelMapper.map(pagamentoCotas, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);

        // WHEN
        PagamentoCotasResponseDTO result = pagamentoCotasService.getById(id);

        // THEN
        assertThat(result).isEqualTo(responseDTO);
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // Scenario 2: ID inexistente
    @Test
    void getById_givenInvalidId_whenPagamentoNotFound_thenThrowException() {
        // GIVEN
        Long id = 999L;
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.getById(id));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // create
    // Scenario 1: usuário não autenticado
    @Test
    void create_givenNoAuthentication_whenCalled_thenThrowException() {
        // GIVEN
        SecurityContextHolder.clearContext();
        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();

        // WHEN & THEN
        assertThrows(SecurityException.class, () -> pagamentoCotasService.create(requestDTO));
    }

    // Scenario 2: erro ao salvar no repositório
    @Test
    void create_givenRepositoryError_whenSaving_thenPropagateException() {
        // GIVEN
        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();
        requestDTO.setInstituicaoId(1L);
        requestDTO.setTipoDescontoId(2L);

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(instituicaoRepository.findById(1L)).thenReturn(Optional.of(new Instituicao()));
        when(tipoDescontoRepository.findById(2L)).thenReturn(Optional.of(new TipoDesconto()));
        when(modelMapper.map(requestDTO, PagamentoCotas.class)).thenReturn(new PagamentoCotas());
        when(pagamentoCotasRepository.save(any())).thenThrow(new DataAccessException("Database error") {});

        // WHEN & THEN
        assertThrows(DataAccessException.class, () -> pagamentoCotasService.create(requestDTO));
    }

    // Scenario 3: criação de pagamento de cotas com sucesso
    @Test
    void create_givenValidRequest_whenSaved_thenReturnDTO() {
        // GIVEN
        PagamentoCotasRequestDTO requestDTO = new PagamentoCotasRequestDTO();
        requestDTO.setInstituicaoId(1L);
        requestDTO.setTipoDescontoId(2L);

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Instituicao mockInstituicao = new Instituicao();
        mockInstituicao.setId(1L);

        TipoDesconto mockTipoDesconto = new TipoDesconto();
        mockTipoDesconto.setId(2L);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(instituicaoRepository.findById(1L)).thenReturn(Optional.of(mockInstituicao));
        when(tipoDescontoRepository.findById(2L)).thenReturn(Optional.of(mockTipoDesconto));
        PagamentoCotas mappedEntity = new PagamentoCotas();
        when(modelMapper.map(requestDTO, PagamentoCotas.class)).thenReturn(mappedEntity);

        PagamentoCotas savedPagamento = new PagamentoCotas();
        when(pagamentoCotasRepository.save(any())).thenReturn(savedPagamento);

        PagamentoCotasResponseDTO responseDTO = new PagamentoCotasResponseDTO();
        when(modelMapper.map(savedPagamento, PagamentoCotasResponseDTO.class)).thenReturn(responseDTO);

        // WHEN
        PagamentoCotasResponseDTO result = pagamentoCotasService.create(requestDTO);

        // THEN
        assertThat(result).isEqualTo(responseDTO);
        verify(pagamentoCotasRepository, times(1)).save(any());
        verify(instituicaoRepository).findById(1L);
        verify(tipoDescontoRepository).findById(2L);
    }

    // update
    // Scenario 1: Atualização de pagamento de cotas existente
    @Test
    void update_givenValidIdAndRequest_whenUpdated_thenReturnDTO() {
        // GIVEN
        Long id = 1L;
        PagamentoCotasRequestDTO request = new PagamentoCotasRequestDTO();
        request.setInstituicaoId(1L);
        request.setTipoDescontoId(2L);

        PagamentoCotas existing = new PagamentoCotas();

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Instituicao mockInstituicao = new Instituicao();
        mockInstituicao.setId(1L);

        TipoDesconto mockTipoDesconto = new TipoDesconto();
        mockTipoDesconto.setId(2L);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(existing));
        when(instituicaoRepository.findById(1L)).thenReturn(Optional.of(mockInstituicao));
        when(tipoDescontoRepository.findById(2L)).thenReturn(Optional.of(mockTipoDesconto));

        PagamentoCotas updatedEntity = new PagamentoCotas();
        when(pagamentoCotasRepository.save(existing)).thenReturn(updatedEntity);

        doNothing().when(modelMapper).map(request, existing);
        PagamentoCotasResponseDTO expectedDTO = new PagamentoCotasResponseDTO();
        when(modelMapper.map(updatedEntity, PagamentoCotasResponseDTO.class)).thenReturn(expectedDTO);

        // WHEN
        PagamentoCotasResponseDTO result = pagamentoCotasService.update(id, request);

        // THEN
        assertThat(result).isEqualTo(expectedDTO);
        verify(modelMapper).map(request, existing);
        verify(modelMapper).map(updatedEntity, PagamentoCotasResponseDTO.class);
        verify(pagamentoCotasRepository).save(existing);
        verify(instituicaoRepository).findById(1L);
        verify(tipoDescontoRepository).findById(2L);
    }

    // Scenario 2: Campos realmente atualizados
    @Test
    void update_givenRequestWithFields_whenUpdated_thenEntityHasNewValues() {
        // GIVEN
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
            destination.setMesReferencia(source.getMesReferencia());
            destination.setAno(source.getAno());
            return null;
        }).when(modelMapper).map(request, existing);

        when(pagamentoCotasRepository.save(existing)).thenReturn(existing);
        when(modelMapper.map(existing, PagamentoCotasResponseDTO.class)).thenReturn(new PagamentoCotasResponseDTO());

        // WHEN
        pagamentoCotasService.update(1L, request);

        // THEN
        assertThat(existing.getMesReferencia()).isEqualTo("05");
        assertThat(existing.getAno()).isEqualTo("2024");
        assertThat(existing.getUser()).isEqualTo(mockUser);
    }

    // Scenario 3: Atualização de pagamento de cotas inexistente
    @Test
    void update_givenInvalidId_whenPagamentoNotFound_thenThrowException() {
        // GIVEN
        Long id = 999L;
        PagamentoCotasRequestDTO request = new PagamentoCotasRequestDTO();
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.update(id, request));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }

    // delete
    // Scenario 1: Inativação de pagamento de cotas existente
    @Test
    void delete_givenValidId_whenSoftDelete_thenUpdateStatusToFalseAndUser() {
        // GIVEN
        Long id = 1L;
        PagamentoCotas entity = new PagamentoCotas();
        entity.setStatus(true);

        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.of(entity));

        // WHEN
        pagamentoCotasService.delete(id);

        // THEN
        assertThat(entity.getStatus()).isFalse();
        assertThat(entity.getUser()).isEqualTo(mockUser);
        verify(pagamentoCotasRepository, times(1)).save(entity);
    }

    // Scenario 2: Inativação de pagamento de cotas inexistente
    @Test
    void delete_givenInvalidId_whenPagamentoNotFound_thenThrowException() {
        // GIVEN
        Long id = 999L;
        when(pagamentoCotasRepository.findById(id)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(EntityNotFoundException.class, () -> pagamentoCotasService.delete(id));
        verify(pagamentoCotasRepository, times(1)).findById(id);
    }


}