package org.portodigital.residencia.oabpe.domain.user.module;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.permission.Permission;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
    private Set<Permission> permissions = new HashSet<>();

}
