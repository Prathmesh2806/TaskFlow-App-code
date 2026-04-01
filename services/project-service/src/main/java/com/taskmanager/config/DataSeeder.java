package com.taskmanager.config;

import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public DataSeeder(UserRepository userRepository, ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        // Only seed if database is empty
        if (userRepository.count() > 0) return;

        // Create Users
        User alice = new User("Alice Johnson", "alice@company.com", "Admin");
        alice.setAvatarColor("#6366f1");
        alice = userRepository.save(alice);

        User bob = new User("Bob Smith", "bob@company.com", "Developer");
        bob.setAvatarColor("#8b5cf6");
        bob = userRepository.save(bob);

        User carol = new User("Carol Williams", "carol@company.com", "Developer");
        carol.setAvatarColor("#ec4899");
        carol = userRepository.save(carol);

        User david = new User("David Brown", "david@company.com", "Designer");
        david.setAvatarColor("#f97316");
        david = userRepository.save(david);

        User eve = new User("Eve Davis", "eve@company.com", "QA Lead");
        eve.setAvatarColor("#22c55e");
        eve = userRepository.save(eve);

        // Create Projects
        Project webApp = new Project("Web Platform", "Main web application platform with user-facing features", "WEB", alice);
        webApp = projectRepository.save(webApp);

        Project mobileApp = new Project("Mobile App", "iOS and Android mobile application", "MOB", bob);
        mobileApp = projectRepository.save(mobileApp);

        Project apiProject = new Project("API Services", "Backend API and microservices infrastructure", "API", carol);
        apiProject = projectRepository.save(apiProject);

        // Create Tasks for Web Platform
        taskRepository.save(new Task("Redesign landing page", "Update the landing page with new branding and improved UX. Include hero section, features grid, and testimonials.",
                TaskStatus.IN_PROGRESS, TaskPriority.HIGH, "WEB-1", webApp, david, alice, LocalDate.now().plusDays(5)));

        taskRepository.save(new Task("Implement user authentication", "Add OAuth2 login with Google and GitHub providers. Include JWT token management.",
                TaskStatus.TODO, TaskPriority.CRITICAL, "WEB-2", webApp, bob, alice, LocalDate.now().plusDays(10)));

        taskRepository.save(new Task("Fix navigation responsive bug", "Mobile hamburger menu not closing after link click on iOS Safari.",
                TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, "WEB-3", webApp, carol, david, LocalDate.now().plusDays(2)));

        taskRepository.save(new Task("Add dark mode support", "Implement system-preference-aware dark mode toggle with CSS custom properties.",
                TaskStatus.DONE, TaskPriority.LOW, "WEB-4", webApp, david, alice, LocalDate.now().minusDays(3)));

        taskRepository.save(new Task("Performance optimization", "Reduce initial bundle size by implementing code splitting and lazy loading.",
                TaskStatus.TODO, TaskPriority.HIGH, "WEB-5", webApp, bob, carol, LocalDate.now().plusDays(14)));

        taskRepository.save(new Task("Implement search functionality", "Full-text search across all content with filters and sorting options.",
                TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, "WEB-6", webApp, carol, alice, LocalDate.now().plusDays(7)));

        // Create Tasks for Mobile App
        taskRepository.save(new Task("Setup React Native project", "Initialize the React Native project with TypeScript, navigation, and state management.",
                TaskStatus.DONE, TaskPriority.HIGH, "MOB-1", mobileApp, bob, bob, LocalDate.now().minusDays(10)));

        taskRepository.save(new Task("Design app icons and splash screen", "Create app icons for all required sizes and animated splash screen.",
                TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, "MOB-2", mobileApp, david, bob, LocalDate.now().plusDays(3)));

        taskRepository.save(new Task("Push notification system", "Implement Firebase Cloud Messaging for both iOS and Android push notifications.",
                TaskStatus.TODO, TaskPriority.HIGH, "MOB-3", mobileApp, carol, bob, LocalDate.now().plusDays(12)));

        taskRepository.save(new Task("Offline data sync", "Implement local database with automatic sync when network becomes available.",
                TaskStatus.TODO, TaskPriority.CRITICAL, "MOB-4", mobileApp, bob, alice, LocalDate.now().plusDays(20)));

        // Create Tasks for API Services
        taskRepository.save(new Task("Design REST API endpoints", "Document all API endpoints with OpenAPI/Swagger specification.",
                TaskStatus.DONE, TaskPriority.HIGH, "API-1", apiProject, carol, carol, LocalDate.now().minusDays(7)));

        taskRepository.save(new Task("Implement rate limiting", "Add rate limiting middleware with configurable limits per endpoint.",
                TaskStatus.IN_PROGRESS, TaskPriority.HIGH, "API-2", apiProject, bob, carol, LocalDate.now().plusDays(4)));

        taskRepository.save(new Task("Database migration system", "Set up Flyway for versioned database migrations with rollback support.",
                TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, "API-3", apiProject, carol, alice, LocalDate.now().plusDays(1)));

        taskRepository.save(new Task("API monitoring dashboard", "Integrate Prometheus metrics and Grafana dashboards for API health monitoring.",
                TaskStatus.TODO, TaskPriority.LOW, "API-4", apiProject, eve, carol, LocalDate.now().plusDays(15)));

        taskRepository.save(new Task("Write integration tests", "Comprehensive integration test suite covering all API endpoints.",
                TaskStatus.TODO, TaskPriority.MEDIUM, "API-5", apiProject, eve, bob, LocalDate.now().plusDays(8)));

        System.out.println("✅ Demo data seeded successfully!");
    }
}
