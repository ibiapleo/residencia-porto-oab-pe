package org.portodigital.residencia.oabpe.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração da documentação OpenAPI (Swagger) para o Portal Científico.
 * Inclui informações da API e definição de autenticação via JWT.
 */
@Configuration
public class OpenApiConfigs {

    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Insira um token JWT no formato: Bearer {seu_token}");
    }

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${openapi.service.title}") String serviceTitle,
            @Value("${openapi.service.version}") String serviceVersion,
            @Value("${openapi.service.url}") String url
    ) {
        return new OpenAPI()
                .info(new Info()
                        .title(serviceTitle)
                        .description("Documentação da API do Projeto OAB-PE")
                        .version(serviceVersion)
                        .contact(new Contact()
                                .name("Equipe de Desenvolvimento")
                                .email("suporte@cesarschool.com.br"))
                        .license(new License()
                                .name("Licença da API")
                                .url("https://www.cesarschool.com.br")))
                .servers(List.of(new Server().url(url)))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", createAPIKeyScheme()));
    }
}
