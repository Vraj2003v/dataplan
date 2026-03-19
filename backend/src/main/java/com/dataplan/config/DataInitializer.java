package com.dataplan.config;

import com.dataplan.model.User;
import com.dataplan.repository.PlanRepository;
import com.dataplan.repository.UserRepository;
import com.dataplan.scraper.ScraperService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository  userRepository;
    private final PlanRepository  planRepository;
    private final ScraperService  scraperService;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PlanRepository planRepository,
                           ScraperService scraperService, PasswordEncoder passwordEncoder) {
        this.userRepository  = userRepository;
        this.planRepository  = planRepository;
        this.scraperService  = scraperService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createUser("admin@dataplan.com", "admin123", "ADMIN");
        createUser("user@dataplan.com",  "user123",  "USER");

        if (planRepository.count() == 0) {
            System.out.println("Seeding plans for all 5 carriers...");
            List.of("BELL","ROGERS","FREEDOM","FIDO","TELUS").forEach(carrier -> {
                var plans = scraperService.getMockPlans(carrier);
                if (!plans.isEmpty()) {
                    plans.get(plans.size() - 1).setIsFeatured(true);
                }
                planRepository.saveAll(plans);
                System.out.println("Seeded " + plans.size() + " plans for " + carrier);
            });
            System.out.println("Total plans: " + planRepository.count());
        }
    }

    private void createUser(String email, String password, String role) {
        if (!userRepository.existsByEmail(email)) {
            User u = new User();
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode(password));
            u.setRole(role);
            userRepository.save(u);
            System.out.println("Created " + role + " user: " + email);
        }
    }
}
