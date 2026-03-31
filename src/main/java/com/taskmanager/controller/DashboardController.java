package com.taskmanager.controller;

import com.taskmanager.service.TaskService;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @GetMapping
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", taskService.getTaskCount());
        stats.put("totalProjects", projectService.getProjectCount());
        stats.put("totalUsers", userService.getUserCount());
        stats.put("tasksByStatus", taskService.getTaskCountsByStatus());
        stats.put("recentTasks", taskService.getAllTasks().stream().limit(5).toList());
        return stats;
    }
}
