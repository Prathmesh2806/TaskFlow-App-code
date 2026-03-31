package com.taskmanager.repository;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    Long countByProjectId(Long projectId);

    Long countByStatus(TaskStatus status);

    Long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId ORDER BY t.updatedAt DESC")
    List<Task> findByProjectIdOrderByUpdatedAtDesc(@Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t ORDER BY t.updatedAt DESC")
    List<Task> findAllOrderByUpdatedAtDesc();

    @Query("SELECT t FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Task> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT MAX(CAST(SUBSTRING(t.taskKey, LENGTH(p.projectKey) + 2) AS Long)) " +
           "FROM Task t JOIN t.project p WHERE p.id = :projectId")
    Long findMaxTaskNumberByProjectId(@Param("projectId") Long projectId);
}
