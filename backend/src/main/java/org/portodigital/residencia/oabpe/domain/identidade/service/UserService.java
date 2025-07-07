package org.portodigital.residencia.oabpe.domain.identidade.service;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.portodigital.residencia.oabpe.domain.identidade.dto.*;
import org.portodigital.residencia.oabpe.domain.identidade.model.Role;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.identidade.repository.RoleRepository;
import org.portodigital.residencia.oabpe.domain.identidade.repository.UserRepository;
import org.portodigital.residencia.oabpe.exception.EntityNotFoundException;
import org.portodigital.residencia.oabpe.infra.security.TokenService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;

    public UserResponseDTO registerUser(RegisterRequestDTO registerRequestDTO) {
        User newUser = new User();
        newUser.setName(registerRequestDTO.getName());
        newUser.setUsername(registerRequestDTO.getUsername());
        newUser.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));

        User savedUser = userRepository.save(newUser);

        return UserResponseDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .build();
    }

    @Transactional
    public TokenResponseDTO login(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByUsername(loginRequestDTO.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Email ou senha incorretos"));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Email ou senha incorretos");
        }

        String accessToken = tokenService.generateAccessToken(user);
        String refreshToken = tokenService.generateRefreshToken(user);

        return new TokenResponseDTO(accessToken, refreshToken);
    }

    public TokenResponseDTO refreshToken(String refreshToken) {
        User user = tokenService.validateRefreshToken(refreshToken)
                .orElseThrow(() -> new BadCredentialsException("Refresh token é inválido"));
        String newAccessToken = tokenService.generateAccessToken(user);
        return TokenResponseDTO.builder().accessToken(newAccessToken).build();
    }

    public void logout(String refreshToken, User user) {
        validateRefreshToken(refreshToken, user);
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void assignRolesToUser(String userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        List<Role> roles = roleRepository.findAllById(roleIds);

        if (roles.size() != roleIds.size()) {
            throw new IllegalArgumentException("Uma ou mais roles não foram encontradas");
        }

        user.getRoles().addAll(roles);
        userRepository.save(user);
    }

    public void validateRefreshToken(String refreshToken, User user) {
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> modelMapper.map(user, UserResponseDTO.class));
    }

    public UserDetailsResponseDTO getUserDetailsById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        UserDetailsResponseDTO dto = new UserDetailsResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());

        dto.setRoles(
                user.getRoles().stream()
                        .map(Role::getName)
                        .toList()
        );

        dto.setPermissions(getGroupedPermissions(user));

        return dto;
    }

    private Map<String, List<String>> getGroupedPermissions(User user) {
        return user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .collect(Collectors.groupingBy(
                        permission -> permission.getModule().getName(),
                        Collectors.mapping(permission -> permission.getName().name(), Collectors.toList())
                ));
    }
}
