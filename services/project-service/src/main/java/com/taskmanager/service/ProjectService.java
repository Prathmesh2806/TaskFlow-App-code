package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<Project> getAllProjects() {
        List<Project> projects = projectRepository.findAll();
        projects.forEach(p -> p.setTaskCount(taskRepository.countByProjectId(p.getId())));
        return projects;
    }

    public Optional<Project> getProjectById(Long id) {
        Optional<Project> project = projectRepository.findById(id);
        project.ifPresent(p -> p.setTaskCount(taskRepository.countByProjectId(p.getId())));
        return project;
    }

    public Project createProject(Project project) {
        if (projectRepository.existsByProjectKey(project.getProjectKey())) {
            throw new RuntimeException("Project key already exists: " + project.getProjectKey());
        }
        return projectRepository.save(project);
    }

    public Project updateProject(Long id, Project projectDetails) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setName(projectDetails.getName());
        project.setDescription(projectDetails.getDescription());
        if (projectDetails.getOwner() != null) {
            project.setOwner(projectDetails.getOwner());
        }
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    public long getProjectCount() {
        return projectRepository.count();
    }
}
