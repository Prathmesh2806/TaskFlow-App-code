package com.taskmanager.controller;

import com.taskmanager.model.*;
import com.taskmanager.service.TaskService;
import com.taskmanager.service.UserService;
import com.taskmanager.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<Task> getAllTasks(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isEmpty()) {
            return taskService.searchTasks(search);
        }
        if (projectId != null) {
            return taskService.getTasksByProjectId(projectId);
        }
        if (assigneeId != null) {
            return taskService.getTasksByAssigneeId(assigneeId);
        }
        if (status != null) {
            return taskService.getTasksByStatus(status);
        }
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Map<String, Object> payload) {
        Task task = new Task();
        task.setTitle((String) payload.get("title"));
        task.setDescription((String) payload.get("description"));

        if (payload.get("status") != null) {
            task.setStatus(TaskStatus.valueOf((String) payload.get("status")));
        }
        if (payload.get("priority") != null) {
            task.setPriority(TaskPriority.valueOf((String) payload.get("priority")));
        }

        Long projectId = Long.valueOf(payload.get("projectId").toString());
        Project project = projectService.getProjectById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        task.setProject(project);

        if (payload.get("assigneeId") != null) {
            Long assigneeId = Long.valueOf(payload.get("assigneeId").toString());
            User assignee = userService.getUserById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            task.setAssignee(assignee);
        }

        if (payload.get("reporterId") != null) {
            Long reporterId = Long.valueOf(payload.get("reporterId").toString());
            User reporter = userService.getUserById(reporterId)
                    .orElseThrow(() -> new RuntimeException("Reporter not found"));
            task.setReporter(reporter);
        }

        try {
            if (payload.get("dueDate") != null && !payload.get("dueDate").toString().isEmpty()) {
                task.setDueDate(LocalDate.parse((String) payload.get("dueDate")));
            }
        } catch (Exception e) {
            System.err.println("Error parsing due date: " + payload.get("dueDate") + ". Cause: " + e.getMessage());
            throw new RuntimeException("Invalid date format. Expected YYYY-MM-DD.");
        }

        try {
            Task created = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            System.err.println("Error creating task: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Task taskDetails = new Task();

        if (payload.get("title") != null) taskDetails.setTitle((String) payload.get("title"));
        if (payload.get("description") != null) taskDetails.setDescription((String) payload.get("description"));
        if (payload.get("status") != null) taskDetails.setStatus(TaskStatus.valueOf((String) payload.get("status")));
        if (payload.get("priority") != null) taskDetails.setPriority(TaskPriority.valueOf((String) payload.get("priority")));
        if (payload.get("dueDate") != null) taskDetails.setDueDate(LocalDate.parse((String) payload.get("dueDate")));

        if (payload.get("assigneeId") != null) {
            Long assigneeId = Long.valueOf(payload.get("assigneeId").toString());
            User assignee = userService.getUserById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            taskDetails.setAssignee(assignee);
        }

        Task updated = taskService.updateTask(id, taskDetails);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        TaskStatus status = TaskStatus.valueOf(payload.get("status"));
        Task updated = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
