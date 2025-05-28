package org.portodigital.residencia.oabpe.domain.identidade.repository;

import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    @Query("""
        SELECT u FROM User u
         LEFT JOIN FETCH u.roles roles
         LEFT JOIN FETCH roles.permissions permissions
         LEFT JOIN FETCH permissions.module module
        WHERE u.username = :username
     """)
    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findByRefreshToken(String refreshToken);

}
