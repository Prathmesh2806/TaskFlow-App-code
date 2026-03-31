package com.taskmanager.controller;

import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Map<String, Object> payload) {
        Project project = new Project();
        project.setName((String) payload.get("name"));
        project.setDescription((String) payload.get("description"));
        project.setProjectKey(((String) payload.get("projectKey")).toUpperCase());

        if (payload.get("ownerId") != null) {
            Long ownerId = Long.valueOf(payload.get("ownerId").toString());
            User owner = userService.getUserById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            project.setOwner(owner);
        }

        Project created = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Project project = new Project();
        project.setName((String) payload.get("name"));
        project.setDescription((String) payload.get("description"));

        if (payload.get("ownerId") != null) {
            Long ownerId = Long.valueOf(payload.get("ownerId").toString());
            User owner = userService.getUserById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            project.setOwner(owner);
        }

        Project updated = projectService.updateProject(id, project);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
