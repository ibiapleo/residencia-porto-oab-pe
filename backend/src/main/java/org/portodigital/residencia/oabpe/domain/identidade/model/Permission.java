package org.portodigital.residencia.oabpe.domain.identidade.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.portodigital.residencia.oabpe.domain.identidade.dto.PermissionName;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PermissionName name;

    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonBackReference(value = "module-permissions")
    private Module module;

    @ManyToMany(mappedBy = "permissions", fetch = FetchType.LAZY)
    @JsonBackReference(value = "roles-permissions")
    private Set<Role> roles = new HashSet<>();

}