package org.portodigital.residencia.oabpe.domain.audit_log;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import org.portodigital.residencia.oabpe.domain.identidade.model.User;
import org.portodigital.residencia.oabpe.domain.identidade.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AuditLogListener {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserService userService;

    @PrePersist
    public void onCreate(Object entity) {
        saveAuditLog(entity, "CREATE", null, entity);
    }

    @PreUpdate
    public void onUpdate(Object entity) {
        saveAuditLog(entity, "UPDATE", null, entity);
    }

    @PreRemove
    public void onDelete(Object entity) {
        saveAuditLog(entity, "DELETE", entity, null);
    }

    private void saveAuditLog(Object entity, String acao, Object antigo, Object novo) {
        AuditLog log = new AuditLog();
        log.setTabela(entity.getClass().getSimpleName());
        log.setAcao(acao);
        log.setDataHora(LocalDateTime.now());

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

            if (antigo != null)
                log.setDadosAnteriores(objectMapper.writeValueAsString(antigo));

            if (novo != null)
                log.setDadosNovos(objectMapper.writeValueAsString(novo));
        } catch (JsonProcessingException e) {
            log.setDadosNovos("Erro ao serializar");
        }

        for (Field field : entity.getClass().getDeclaredFields()) {
            if (field.getType().equals(User.class)) {
                field.setAccessible(true);
                try {
                    User user = (User) field.get(entity);
                    if (user != null) {
                        log.setIdUsuario(user.getId());
                        break;
                    }
                } catch (IllegalAccessException e) {
                    System.out.println("Não foi possível acessar o campo do tipo User em " + entity.getClass().getSimpleName());

                }
            }
        }

        auditLogRepository.save(log);
    }

}

