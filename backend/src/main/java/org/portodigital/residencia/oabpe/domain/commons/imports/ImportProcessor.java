package org.portodigital.residencia.oabpe.domain.commons.imports;

import org.portodigital.residencia.oabpe.domain.identidade.model.User;

import java.util.Map;

public interface ImportProcessor<T> {
    String[] getRequiredHeaders();
    T parse(Map<String, String> rowData);
    void validate(T dto);
    Object convertToEntity(T dto, User user);
}