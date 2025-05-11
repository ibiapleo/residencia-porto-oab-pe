package org.portodigital.residencia.oabpe.domain.user;

import lombok.RequiredArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.payload.LoginRequestDTO;
import org.portodigital.residencia.oabpe.domain.user.payload.RegisterRequestDTO;
import org.portodigital.residencia.oabpe.domain.user.payload.TokenResponseDTO;
import org.portodigital.residencia.oabpe.domain.user.role.Role;
import org.portodigital.residencia.oabpe.infra.security.TokenService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public void registerUser(RegisterRequestDTO registerRequestDTO) {
        User newUser = new User();
        newUser.setName(registerRequestDTO.getName());
        newUser.setUsername(registerRequestDTO.getUsername());
        newUser.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        userRepository.save(newUser);
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

    public void validateRefreshToken(String refreshToken, User user) {
        if (user.getRefreshToken() == null || !user.getRefreshToken().equals(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

}
