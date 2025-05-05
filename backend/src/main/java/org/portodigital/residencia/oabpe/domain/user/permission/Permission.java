package org.portodigital.residencia.oabpe.domain.user.permission;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.portodigital.residencia.oabpe.domain.user.module.Module;
import org.portodigital.residencia.oabpe.domain.user.role.Role;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PermissionName name;

    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;

    @ManyToMany(mappedBy = "permissions")
    @JsonBackReference
    private Set<Role> roles = new HashSet<>();

}