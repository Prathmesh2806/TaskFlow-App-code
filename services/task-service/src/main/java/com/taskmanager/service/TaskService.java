package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public List<Task> getAllTasks() {
        return taskRepository.findAllOrderByUpdatedAtDesc();
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId);
    }

    public List<Task> getTasksByAssigneeId(Long assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    public List<Task> searchTasks(String keyword) {
        return taskRepository.searchByKeyword(keyword);
    }

    public Task createTask(Task task) {
        // Auto-generate task key
        if (task.getTaskKey() == null || task.getTaskKey().isEmpty()) {
            String projectKey = task.getProject().getProjectKey();
            Long maxNum = taskRepository.findMaxTaskNumberByProjectId(task.getProject().getId());
            long nextNum = (maxNum == null) ? 1 : maxNum + 1;
            task.setTaskKey(projectKey + "-" + nextNum);
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
        if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
        if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
        if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
        if (taskDetails.getAssignee() != null) task.setAssignee(taskDetails.getAssignee());
        if (taskDetails.getDueDate() != null) task.setDueDate(taskDetails.getDueDate());

        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

    public long getTaskCount() {
        return taskRepository.count();
    }

    public Map<String, Long> getTaskCountsByStatus() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            counts.put(status.name(), taskRepository.countByStatus(status));
        }
        return counts;
    }

    public Map<String, Long> getTaskCountsByStatusForProject(Long projectId) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (TaskStatus status : TaskStatus.values()) {
            counts.put(status.name(), taskRepository.countByProjectIdAndStatus(projectId, status));
        }
        return counts;
    }
}
