package org.portodigital.residencia.oabpe.domain.balancetecfoab;

import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.BalanceteCFOAB;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.BalanceteCFOABRepository;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.BalanceteCFOABService;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABRequestDTO;
import org.portodigital.residencia.oabpe.domain.balancete_cfoab.dto.BalanceteCFOABResponseDTO;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.SecurityException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BalanceteCFOABServiceTest {

    @Mock
    private BalanceteCFOABRepository balanceteCFOABRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private BalanceteCFOABService balanceteCFOABService;

    //getAll
    //Scenario: Retorna todos os balancetes ativos paginados
    @Test
    void getAll_givenPageable_whenExistsActiveBalancetes_thenReturnPageOfDTOs() {
        Pageable pageable = PageRequest.of(0, 10);
        BalanceteCFOAB balancete = new BalanceteCFOAB();
        Page<BalanceteCFOAB> mockPage = new PageImpl<>(List.of(balancete));

        when(balanceteCFOABRepository.findAllAtivos(pageable)).thenReturn(mockPage);
        when(modelMapper.map(balancete, BalanceteCFOABResponseDTO.class))
                .thenReturn(new BalanceteCFOABResponseDTO());

        Page<BalanceteCFOABResponseDTO> result = balanceteCFOABService.getAll(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(balanceteCFOABRepository, times(1)).findAllAtivos(pageable);
    }

    //getById
    //Scenario 1: ID existente
    @Test
    void getById_givenValidId_whenBalanceteExists_thenReturnDTO() {
        Long id = 1L;
        BalanceteCFOAB balancete = new BalanceteCFOAB();
        BalanceteCFOABResponseDTO mockDTO = new BalanceteCFOABResponseDTO();

        when(balanceteCFOABRepository.findById(id)).thenReturn(Optional.of(balancete));
        when(modelMapper.map(balancete, BalanceteCFOABResponseDTO.class)).thenReturn(mockDTO);

        BalanceteCFOABResponseDTO result = balanceteCFOABService.getById(id);

        assertThat(result).isEqualTo(mockDTO);
        verify(balanceteCFOABRepository, times(1)).findById(id);
    }

    //Scenario 2: ID inexistente
    @Test
    void getById_givenInvalidId_whenBalanceteNotFound_thenThrowException() {
        Long id = 999L;
        when(balanceteCFOABRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> balanceteCFOABService.getById(id));
        verify(balanceteCFOABRepository, times(1)).findById(id);
    }

    //create
    //Scenario 1: Usuário não autenticado
    @Test
    void create_givenNoAuthentication_whenCalled_thenThrowException() {
        SecurityContextHolder.clearContext();
        BalanceteCFOABRequestDTO request = new BalanceteCFOABRequestDTO();

        assertThrows(SecurityException.class, () -> balanceteCFOABService.create(request));
    }

    //Scenario 2: Erro ao salvar no repositório
    @Test
    void create_givenRepositoryError_whenSaving_thenPropagateException() {
        BalanceteCFOABRequestDTO request = new BalanceteCFOABRequestDTO();
        User user = new User();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(modelMapper.map(any(), any())).thenReturn(new BalanceteCFOAB());
        when(balanceteCFOABRepository.save(any())).thenThrow(new DataAccessException("Database error") {});

        assertThrows(DataAccessException.class, () -> balanceteCFOABService.create(request));
    }

    //Scenario 3: DTO correto e id do usuário que criou armazenado corretamente
    @Test
    void create_givenValidRequestAndAuthenticatedUser_whenSaved_thenReturnDTOWithUserId() {
        BalanceteCFOABRequestDTO request = new BalanceteCFOABRequestDTO();
        User mockUser = new User();
        mockUser.setId("123e4567-e89b-12d3-a456-426614174000");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        BalanceteCFOAB savedBalancete = new BalanceteCFOAB();
        savedBalancete.setUser(mockUser);

        when(modelMapper.map(request, BalanceteCFOAB.class)).thenReturn(new BalanceteCFOAB());
        when(balanceteCFOABRepository.save(any())).thenReturn(savedBalancete);
        when(modelMapper.map(savedBalancete, BalanceteCFOABResponseDTO.class))
                .thenReturn(new BalanceteCFOABResponseDTO());

        BalanceteCFOABResponseDTO result = balanceteCFOABService.create(request);

        assertThat(result.getUsuarioId()).isEqualTo(mockUser.getId());
        verify(balanceteCFOABRepository, times(1)).save(any());
    }

    //update
    //Scenario 1: Verificação se as interações críticas acontecem (repository, mapper, entity)
    @Test
    void update_givenValidIdAndRequest_whenUpdated_thenReturnDTO() {
        Long id = 1L;
        BalanceteCFOABRequestDTO request = new BalanceteCFOABRequestDTO();
        BalanceteCFOAB existing = new BalanceteCFOAB();
        BalanceteCFOAB updatedEntity = new BalanceteCFOAB();
        BalanceteCFOABResponseDTO expectedDTO = new BalanceteCFOABResponseDTO();

        when(balanceteCFOABRepository.findById(id)).thenReturn(Optional.of(existing));
        when(balanceteCFOABRepository.save(existing)).thenReturn(updatedEntity);

        doAnswer(invocation -> {
            BalanceteCFOABRequestDTO source = invocation.getArgument(0);
            BalanceteCFOAB destination = invocation.getArgument(1);
            destination.setDemonstracao(source.getDemonstracao());
            destination.setReferencia(source.getReferencia());
            destination.setPeriodicidade(source.getPeriodicidade());
            destination.setDtEntr(source.getDtEntr());
            destination.setDtPrevEntr(source.getDtPrevEntr());
            destination.setAno(source.getAno());
            return null;
        }).when(modelMapper).map(request, existing);

        when(modelMapper.map(updatedEntity, BalanceteCFOABResponseDTO.class)).thenReturn(expectedDTO);
        BalanceteCFOABResponseDTO result = balanceteCFOABService.update(id, request);

        assertThat(result).isEqualTo(expectedDTO);

        verify(modelMapper).map(request, existing);
        verify(modelMapper).map(updatedEntity, BalanceteCFOABResponseDTO.class);
        verify(balanceteCFOABRepository).save(existing);
    }

    //Scenario 2: Campos atualizados corretamente
    @Test
    void update_givenRequestWithFields_whenUpdated_thenEntityHasNewValues() {
        BalanceteCFOABRequestDTO request = new BalanceteCFOABRequestDTO();
        request.setDemonstracao("Nova Demonstração");
        request.setReferencia("JAN");

        BalanceteCFOAB existing = new BalanceteCFOAB();
        existing.setDemonstracao("Valor Antigo");
        existing.setReferencia("DEZ");

        when(balanceteCFOABRepository.findById(1L)).thenReturn(Optional.of(existing));

        doAnswer(invocation -> {
            BalanceteCFOABRequestDTO source = invocation.getArgument(0);
            BalanceteCFOAB destination = invocation.getArgument(1);
            destination.setDemonstracao(source.getDemonstracao());
            destination.setReferencia(source.getReferencia());
            return null;
        }).when(modelMapper).map(request, existing);

        balanceteCFOABService.update(1L, request);

        assertThat(existing.getDemonstracao()).isEqualTo("Nova Demonstração");
        assertThat(existing.getReferencia()).isEqualTo("JAN");
    }

    //delete
    @Test
    void delete_givenValidId_whenSoftDelete_thenUpdateStatusToFalse() {
        Long id = 1L;
        BalanceteCFOAB balancete = new BalanceteCFOAB();
        balancete.setStatus(true);

        when(balanceteCFOABRepository.findById(id)).thenReturn(Optional.of(balancete));

        balanceteCFOABService.delete(id);

        assertThat(balancete.getStatus()).isFalse();
        verify(balanceteCFOABRepository, times(1)).save(balancete);
    }
}
