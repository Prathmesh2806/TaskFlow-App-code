/* ============================================
   TaskFlow — Main Application Logic
   ============================================ */

// ==========================================
// State
// ==========================================
let currentPage = 'dashboard';
let allTasks = [];
let allProjects = [];
let allUsers = [];
let boardFilterProjectId = '';

// ==========================================
// API Helpers
// ==========================================
const API = {
    async get(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async post(url, data) {
        const res = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async put(url, data) {
        const res = await fetch(url, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async patch(url, data) {
        const res = await fetch(url, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    async delete(url) {
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
    }
};

// ==========================================
// Data Loading
// ==========================================
async function loadAllData() {
    try {
        [allTasks, allProjects, allUsers] = await Promise.all([
            API.get('/api/tasks'),
            API.get('/api/projects'),
            API.get('/api/users')
        ]);
    } catch (e) {
        console.error('Failed to load data:', e);
        showToast('Failed to load data', 'error');
    }
}

// ==========================================
// Navigation
// ==========================================
function navigateTo(page) {
    currentPage = page;

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Update page title
    const titles = { dashboard: 'Dashboard', board: 'Board', tasks: 'Tasks', projects: 'Projects', team: 'Team' };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Render page
    renderPage();
}

function renderPage() {
    const content = document.getElementById('pageContent');
    content.style.animation = 'none';
    content.offsetHeight; // trigger reflow
    content.style.animation = 'fadeIn 0.3s ease';

    switch (currentPage) {
        case 'dashboard': renderDashboard(); break;
        case 'board': renderBoard(); break;
        case 'tasks': renderTasksList(); break;
        case 'projects': renderProjects(); break;
        case 'team': renderTeam(); break;
    }
}

// ==========================================
// Dashboard
// ==========================================
async function renderDashboard() {
    await loadAllData();
    const content = document.getElementById('pageContent');

    const statusCounts = {
        TODO: allTasks.filter(t => t.status === 'TODO').length,
        IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
        IN_REVIEW: allTasks.filter(t => t.status === 'IN_REVIEW').length,
        DONE: allTasks.filter(t => t.status === 'DONE').length
    };
    const total = allTasks.length || 1;

    const recentTasks = [...allTasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

    content.innerHTML = `
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tasks</div>
                <div class="stat-value">${allTasks.length}</div>
                <div class="stat-detail">${statusCounts.IN_PROGRESS} in progress</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Projects</div>
                <div class="stat-value">${allProjects.length}</div>
                <div class="stat-detail">Active projects</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Team Members</div>
                <div class="stat-value">${allUsers.length}</div>
                <div class="stat-detail">Collaborators</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completed</div>
                <div class="stat-value">${statusCounts.DONE}</div>
                <div class="stat-detail">${Math.round((statusCounts.DONE / total) * 100)}% completion rate</div>
            </div>
        </div>

        <!-- Status Distribution -->
        <div class="status-bar-container">
            <div class="status-bar-title">Task Distribution</div>
            <div class="status-bar">
                <div class="status-bar-segment" style="width:${(statusCounts.TODO/total)*100}%;background:var(--status-todo)"></div>
                <div class="status-bar-segment" style="width:${(statusCounts.IN_PROGRESS/total)*100}%;background:var(--status-progress)"></div>
                <div class="status-bar-segment" style="width:${(statusCounts.IN_REVIEW/total)*100}%;background:var(--status-review)"></div>
                <div class="status-bar-segment" style="width:${(statusCounts.DONE/total)*100}%;background:var(--status-done)"></div>
            </div>
            <div class="status-bar-legend">
                <div class="legend-item"><div class="legend-dot" style="background:var(--status-todo)"></div>To Do (${statusCounts.TODO})</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--status-progress)"></div>In Progress (${statusCounts.IN_PROGRESS})</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--status-review)"></div>In Review (${statusCounts.IN_REVIEW})</div>
                <div class="legend-item"><div class="legend-dot" style="background:var(--status-done)"></div>Done (${statusCounts.DONE})</div>
            </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
            <div class="dashboard-section">
                <div class="section-header">
                    <h3 class="section-title">Recent Tasks</h3>
                    <button class="btn btn-ghost btn-sm" onclick="navigateTo('tasks')">View All</button>
                </div>
                <div class="section-body">
                    ${recentTasks.map(t => `
                        <div class="task-list-item" onclick="openTaskDetail(${t.id})">
                            <span class="task-list-key">${t.taskKey}</span>
                            <span class="task-list-title">${escapeHtml(t.title)}</span>
                            <span class="priority-badge priority-${t.priority.toLowerCase()}">${t.priority}</span>
                            <span class="status-badge status-${t.status.toLowerCase()}">${formatStatus(t.status)}</span>
                        </div>
                    `).join('')}
                    ${recentTasks.length === 0 ? '<div class="empty-state"><p>No tasks yet</p></div>' : ''}
                </div>
            </div>
            <div class="dashboard-section">
                <div class="section-header">
                    <h3 class="section-title">Projects Overview</h3>
                    <button class="btn btn-ghost btn-sm" onclick="navigateTo('projects')">View All</button>
                </div>
                <div class="section-body">
                    ${allProjects.map(p => `
                        <div class="task-list-item" onclick="navigateTo('board'); boardFilterProjectId='${p.id}'; renderBoard();">
                            <span class="project-key-badge">${p.projectKey}</span>
                            <span class="task-list-title">${escapeHtml(p.name)}</span>
                            <span style="font-size:0.78rem;color:var(--text-muted)">${p.taskCount || 0} tasks</span>
                        </div>
                    `).join('')}
                    ${allProjects.length === 0 ? '<div class="empty-state"><p>No projects yet</p></div>' : ''}
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// Kanban Board
// ==========================================
async function renderBoard() {
    await loadAllData();
    const content = document.getElementById('pageContent');

    let tasks = allTasks;
    if (boardFilterProjectId) {
        tasks = tasks.filter(t => t.project.id == boardFilterProjectId);
    }

    const columns = [
        { key: 'TODO', name: 'To Do', color: 'var(--status-todo)' },
        { key: 'IN_PROGRESS', name: 'In Progress', color: 'var(--status-progress)' },
        { key: 'IN_REVIEW', name: 'In Review', color: 'var(--status-review)' },
        { key: 'DONE', name: 'Done', color: 'var(--status-done)' }
    ];

    content.innerHTML = `
        <div class="board-controls">
            <select class="board-filter" id="boardProjectFilter" onchange="boardFilterProjectId=this.value; renderBoard();">
                <option value="">All Projects</option>
                ${allProjects.map(p => `<option value="${p.id}" ${boardFilterProjectId == p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
        </div>
        <div class="board">
            ${columns.map(col => {
                const colTasks = tasks.filter(t => t.status === col.key);
                return `
                    <div class="board-column" data-status="${col.key}">
                        <div class="column-header">
                            <div class="column-header-left">
                                <div class="column-dot" style="background:${col.color}"></div>
                                <span class="column-name">${col.name}</span>
                            </div>
                            <span class="column-count">${colTasks.length}</span>
                        </div>
                        <div class="column-body" data-status="${col.key}"
                             ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event)">
                            ${colTasks.map(t => renderTaskCard(t)).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderTaskCard(task) {
    const assigneeAvatar = task.assignee ?
        `<div class="card-avatar" style="background:${task.assignee.avatarColor || '#6366f1'}" title="${escapeHtml(task.assignee.name)}">${task.assignee.name.charAt(0)}</div>` :
        '';

    let dueDateHtml = '';
    if (task.dueDate) {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE';
        dueDateHtml = `<span class="card-due-date ${isOverdue ? 'overdue' : ''}">${formatDate(task.dueDate)}</span>`;
    }

    return `
        <div class="task-card" draggable="true" data-task-id="${task.id}"
             ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)"
             onclick="openTaskDetail(${task.id})">
            <div class="task-card-key">${task.taskKey}</div>
            <div class="task-card-title">${escapeHtml(task.title)}</div>
            <div class="task-card-footer">
                <div class="task-card-meta">
                    <span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    ${dueDateHtml}
                </div>
                ${assigneeAvatar}
            </div>
        </div>
    `;
}

// ==========================================
// Drag & Drop
// ==========================================
let draggedTaskId = null;

function handleDragStart(e) {
    draggedTaskId = e.currentTarget.dataset.taskId;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.column-body').forEach(col => col.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const newStatus = e.currentTarget.dataset.status;
    if (!draggedTaskId || !newStatus) return;

    try {
        await API.patch(`/api/tasks/${draggedTaskId}/status`, { status: newStatus });
        showToast('Task status updated!', 'success');
        await renderBoard();
    } catch (err) {
        showToast('Failed to update task', 'error');
    }
    draggedTaskId = null;
}

// ==========================================
// Tasks List View
// ==========================================
async function renderTasksList() {
    await loadAllData();
    const content = document.getElementById('pageContent');

    content.innerHTML = `
        <div class="tasks-controls">
            <div class="tasks-filters">
                <select class="board-filter" id="taskFilterProject" onchange="filterTasksList()">
                    <option value="">All Projects</option>
                    ${allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
                <select class="board-filter" id="taskFilterStatus" onchange="filterTasksList()">
                    <option value="">All Status</option>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                </select>
                <select class="board-filter" id="taskFilterPriority" onchange="filterTasksList()">
                    <option value="">All Priority</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>
        </div>
        <div class="tasks-table" id="tasksTableContainer">
            ${renderTasksTable(allTasks)}
        </div>
    `;
}

function renderTasksTable(tasks) {
    if (tasks.length === 0) {
        return '<div class="empty-state"><h3>No tasks found</h3><p>Create a new task to get started</p></div>';
    }
    return `
        <table>
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Project</th>
                    <th>Due Date</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(t => `
                    <tr onclick="openTaskDetail(${t.id})">
                        <td><span class="task-row-key">${t.taskKey}</span></td>
                        <td><span class="task-row-title">${escapeHtml(t.title)}</span></td>
                        <td><span class="status-badge status-${t.status.toLowerCase()}">${formatStatus(t.status)}</span></td>
                        <td><span class="priority-badge priority-${t.priority.toLowerCase()}">${t.priority}</span></td>
                        <td>
                            <div class="task-row-assignee">
                                ${t.assignee ?
                                    `<div class="card-avatar" style="background:${t.assignee.avatarColor || '#6366f1'}">${t.assignee.name.charAt(0)}</div>
                                     <span>${escapeHtml(t.assignee.name)}</span>` :
                                    '<span style="color:var(--text-muted)">Unassigned</span>'}
                            </div>
                        </td>
                        <td style="color:var(--text-muted);font-size:0.78rem">${t.project ? t.project.name : '-'}</td>
                        <td style="font-size:0.78rem;color:var(--text-muted)">${t.dueDate ? formatDate(t.dueDate) : '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterTasksList() {
    const projectId = document.getElementById('taskFilterProject').value;
    const status = document.getElementById('taskFilterStatus').value;
    const priority = document.getElementById('taskFilterPriority').value;

    let filtered = [...allTasks];
    if (projectId) filtered = filtered.filter(t => t.project && t.project.id == projectId);
    if (status) filtered = filtered.filter(t => t.status === status);
    if (priority) filtered = filtered.filter(t => t.priority === priority);

    document.getElementById('tasksTableContainer').innerHTML = renderTasksTable(filtered);
}

// ==========================================
// Projects
// ==========================================
async function renderProjects() {
    await loadAllData();
    const content = document.getElementById('pageContent');

    content.innerHTML = `
        <div class="projects-header">
            <div>
                <h2 style="font-size:0.85rem;color:var(--text-muted);font-weight:600">${allProjects.length} Projects</h2>
            </div>
            <button class="btn btn-primary" onclick="openCreateProjectModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New Project
            </button>
        </div>
        <div class="projects-grid">
            ${allProjects.map(p => `
                <div class="project-card" onclick="boardFilterProjectId='${p.id}'; navigateTo('board');">
                    <div class="project-card-header">
                        <span class="project-key-badge">${p.projectKey}</span>
                        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); editProject(${p.id});" title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                    </div>
                    <h3 class="project-card-name">${escapeHtml(p.name)}</h3>
                    <p class="project-card-desc">${escapeHtml(p.description || 'No description')}</p>
                    <div class="project-card-footer">
                        <div class="project-card-stats">
                            <span class="project-stat"><strong>${p.taskCount || 0}</strong> tasks</span>
                        </div>
                        ${p.owner ? `<div class="card-avatar" style="background:${p.owner.avatarColor || '#6366f1'}" title="${escapeHtml(p.owner.name)}">${p.owner.name.charAt(0)}</div>` : ''}
                    </div>
                </div>
            `).join('')}
            ${allProjects.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><h3>No projects yet</h3><p>Create your first project to get started</p></div>' : ''}
        </div>
    `;
}

// ==========================================
// Team
// ==========================================
async function renderTeam() {
    await loadAllData();
    const content = document.getElementById('pageContent');

    content.innerHTML = `
        <div class="team-header">
            <div>
                <h2 style="font-size:0.85rem;color:var(--text-muted);font-weight:600">${allUsers.length} Team Members</h2>
            </div>
            <button class="btn btn-primary" onclick="openCreateUserModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Member
            </button>
        </div>
        <div class="team-grid">
            ${allUsers.map(u => {
                const userTasks = allTasks.filter(t => t.assignee && t.assignee.id === u.id);
                return `
                    <div class="team-card">
                        <div class="team-avatar" style="background:${u.avatarColor || '#6366f1'}">${u.name.charAt(0)}</div>
                        <div class="team-name">${escapeHtml(u.name)}</div>
                        <div class="team-email">${escapeHtml(u.email)}</div>
                        <span class="team-role">${u.role || 'Member'}</span>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:14px">${userTasks.length} assigned tasks</div>
                        <div class="team-card-actions">
                            <button class="btn btn-ghost btn-sm" onclick="editUser(${u.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteUserConfirm(${u.id})">Remove</button>
                        </div>
                    </div>
                `;
            }).join('')}
            ${allUsers.length === 0 ? '<div class="empty-state" style="grid-column:1/-1"><h3>No team members</h3><p>Add your first team member</p></div>' : ''}
        </div>
    `;
}

// ==========================================
// Task Detail Modal
// ==========================================
async function openTaskDetail(taskId) {
    const task = allTasks.find(t => t.id === taskId) || await API.get(`/api/tasks/${taskId}`);
    if (!task) return;

    document.getElementById('detailTaskKey').textContent = task.taskKey;

    document.getElementById('taskDetailBody').innerHTML = `
        <h2 class="task-detail-title">${escapeHtml(task.title)}</h2>
        ${task.description ? `<div class="task-detail-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-detail-grid">
            <div class="detail-field">
                <span class="detail-field-label">Status</span>
                <span class="detail-field-value"><span class="status-badge status-${task.status.toLowerCase()}">${formatStatus(task.status)}</span></span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Priority</span>
                <span class="detail-field-value"><span class="priority-badge priority-${task.priority.toLowerCase()}">${task.priority}</span></span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Assignee</span>
                <span class="detail-field-value">
                    ${task.assignee ?
                        `<div style="display:flex;align-items:center;gap:8px">
                            <div class="card-avatar" style="background:${task.assignee.avatarColor || '#6366f1'}">${task.assignee.name.charAt(0)}</div>
                            ${escapeHtml(task.assignee.name)}
                        </div>` :
                        '<span style="color:var(--text-muted)">Unassigned</span>'}
                </span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Reporter</span>
                <span class="detail-field-value">
                    ${task.reporter ?
                        `<div style="display:flex;align-items:center;gap:8px">
                            <div class="card-avatar" style="background:${task.reporter.avatarColor || '#6366f1'}">${task.reporter.name.charAt(0)}</div>
                            ${escapeHtml(task.reporter.name)}
                        </div>` :
                        '<span style="color:var(--text-muted)">—</span>'}
                </span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Project</span>
                <span class="detail-field-value">${task.project ? escapeHtml(task.project.name) : '—'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Due Date</span>
                <span class="detail-field-value">${task.dueDate ? formatDate(task.dueDate) : '—'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Created</span>
                <span class="detail-field-value">${task.createdAt ? formatDateTime(task.createdAt) : '—'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-field-label">Updated</span>
                <span class="detail-field-value">${task.updatedAt ? formatDateTime(task.updatedAt) : '—'}</span>
            </div>
        </div>
        <div class="task-detail-actions">
            <button class="btn btn-primary btn-sm" onclick="closeTaskDetailModal(); openEditTaskModal(${task.id});">Edit Task</button>
            <button class="btn btn-danger btn-sm" onclick="deleteTaskConfirm(${task.id})">Delete Task</button>
        </div>
    `;

    document.getElementById('taskDetailModal').classList.add('active');
}

function closeTaskDetailModal() {
    document.getElementById('taskDetailModal').classList.remove('active');
}

// ==========================================
// Task Create/Edit Modal
// ==========================================
function openCreateTaskModal() {
    document.getElementById('modalTitle').textContent = 'Create Task';
    document.getElementById('taskSubmitBtn').textContent = 'Create Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    populateTaskFormDropdowns();
    document.getElementById('taskModal').classList.add('active');
}

async function openEditTaskModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskSubmitBtn').textContent = 'Save Changes';
    populateTaskFormDropdowns();

    document.getElementById('taskId').value = task.id;
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskProject').value = task.project ? task.project.id : '';
    document.getElementById('taskAssignee').value = task.assignee ? task.assignee.id : '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate || '';

    document.getElementById('taskModal').classList.add('active');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('active');
}

function populateTaskFormDropdowns() {
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="">Select Project</option>' +
        allProjects.map(p => `<option value="${p.id}">${p.name} (${p.projectKey})</option>`).join('');

    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>' +
        allUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

async function submitTaskForm(e) {
    e.preventDefault();

    const taskIdVal = document.getElementById('taskId').value;
    const payload = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        projectId: document.getElementById('taskProject').value,
        assigneeId: document.getElementById('taskAssignee').value || null,
        status: document.getElementById('taskStatus').value,
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value || null,
        reporterId: allUsers[0]?.id || null
    };

    try {
        if (taskIdVal) {
            await API.put(`/api/tasks/${taskIdVal}`, payload);
            showToast('Task updated successfully!', 'success');
        } else {
            await API.post('/api/tasks', payload);
            showToast('Task created successfully!', 'success');
        }
        closeTaskModal();
        await loadAllData();
        renderPage();
    } catch (err) {
        showToast(`Failed to save task: ${err.message}`, 'error');
    }
}

async function deleteTaskConfirm(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        await API.delete(`/api/tasks/${id}`);
        closeTaskDetailModal();
        showToast('Task deleted', 'info');
        await loadAllData();
        renderPage();
    } catch (err) {
        showToast('Failed to delete task', 'error');
    }
}

// ==========================================
// Project Create/Edit Modal
// ==========================================
function openCreateProjectModal() {
    document.getElementById('projectModalTitle').textContent = 'Create Project';
    document.getElementById('projectSubmitBtn').textContent = 'Create Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    populateProjectFormDropdowns();
    document.getElementById('projectModal').classList.add('active');
}

async function editProject(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    document.getElementById('projectModalTitle').textContent = 'Edit Project';
    document.getElementById('projectSubmitBtn').textContent = 'Save Changes';
    populateProjectFormDropdowns();

    document.getElementById('projectId').value = project.id;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectKey').value = project.projectKey;
    document.getElementById('projectKey').disabled = true;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectOwner').value = project.owner ? project.owner.id : '';

    document.getElementById('projectModal').classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
    document.getElementById('projectKey').disabled = false;
}

function populateProjectFormDropdowns() {
    const ownerSelect = document.getElementById('projectOwner');
    ownerSelect.innerHTML = '<option value="">Select Owner</option>' +
        allUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

async function submitProjectForm(e) {
    e.preventDefault();
    const projectIdVal = document.getElementById('projectId').value;
    const payload = {
        name: document.getElementById('projectName').value,
        projectKey: document.getElementById('projectKey').value.toUpperCase(),
        description: document.getElementById('projectDescription').value,
        ownerId: document.getElementById('projectOwner').value || null
    };

    try {
        if (projectIdVal) {
            await API.put(`/api/projects/${projectIdVal}`, payload);
            showToast('Project updated!', 'success');
        } else {
            await API.post('/api/projects', payload);
            showToast('Project created!', 'success');
        }
        closeProjectModal();
        await loadAllData();
        renderPage();
    } catch (err) {
        showToast('Failed to save project', 'error');
    }
}

// ==========================================
// User Create/Edit Modal
// ==========================================
function openCreateUserModal() {
    document.getElementById('userModalTitle').textContent = 'Add Team Member';
    document.getElementById('userSubmitBtn').textContent = 'Add Member';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').classList.add('active');
}

async function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('userModalTitle').textContent = 'Edit Member';
    document.getElementById('userSubmitBtn').textContent = 'Save Changes';

    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role || 'Member';

    document.getElementById('userModal').classList.add('active');
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

async function submitUserForm(e) {
    e.preventDefault();
    const userIdVal = document.getElementById('userId').value;
    const payload = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value
    };

    try {
        if (userIdVal) {
            await API.put(`/api/users/${userIdVal}`, payload);
            showToast('Member updated!', 'success');
        } else {
            await API.post('/api/users', payload);
            showToast('Member added!', 'success');
        }
        closeUserModal();
        await loadAllData();
        renderPage();
    } catch (err) {
        showToast('Failed to save member', 'error');
    }
}

async function deleteUserConfirm(id) {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
        await API.delete(`/api/users/${id}`);
        showToast('Member removed', 'info');
        await loadAllData();
        renderPage();
    } catch (err) {
        showToast('Failed to remove member', 'error');
    }
}

// ==========================================
// Search
// ==========================================
let searchDebounce;
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            if (currentPage === 'tasks') renderTasksList();
            return;
        }
        try {
            const results = await API.get(`/api/tasks?search=${encodeURIComponent(query)}`);
            navigateTo('tasks');
            document.getElementById('tasksTableContainer').innerHTML = renderTasksTable(results);
        } catch (err) {
            console.error('Search failed:', err);
        }
    }, 300);
});

// ==========================================
// Utilities
// ==========================================
function formatStatus(status) {
    const map = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' };
    return map[status] || status;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// Toast Notifications
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// Event Listeners
// ==========================================
// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
    });
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.getElementById('projectKey').disabled = false;
        }
    });
});

// ==========================================
// Initialize
// ==========================================
async function init() {
    await loadAllData();
    renderDashboard();
}

init();
