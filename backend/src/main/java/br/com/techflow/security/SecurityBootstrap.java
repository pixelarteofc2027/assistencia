package br.com.techflow.security;

import br.com.techflow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class SecurityBootstrap {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminUsername;
    private final String adminPassword;

    public SecurityBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${techflow.security.admin.username:}") String adminUsername,
            @Value("${techflow.security.admin.password:}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    public void initializeAdmin() {
        if (!StringUtils.hasText(adminUsername) || !StringUtils.hasText(adminPassword)) {
            throw new IllegalStateException(
                    "Configuração obrigatória ausente. Defina TECHFLOW_ADMIN_USERNAME e TECHFLOW_ADMIN_PASSWORD antes de iniciar a aplicação."
            );
        }

        userRepository.findByUsername(adminUsername).ifPresentOrElse(
                user -> {
                    if (!"ROLE_ADMIN".equals("ROLE_" + user.getRole().name())) {
                        user.setRole(br.com.techflow.model.Role.ADMIN);
                        userRepository.save(user);
                    }
                },
                () -> userRepository.save(new br.com.techflow.model.User(
                        adminUsername,
                        passwordEncoder.encode(adminPassword),
                        "Administrador",
                        "admin@techflow.local",
                        br.com.techflow.model.Role.ADMIN
                ))
        );
    }
}
