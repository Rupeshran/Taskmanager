// =============================================
// js/dashboard.js — Task Management Logic
// =============================================

// ---- State ----
let allTasks = [];
let currentFilter = "all";

// ---- DOM helpers ----
const $ = (id) => document.getElementById(id);

// ---- Toast Notifications ----
function showToast(message, type = "success") {
  const container = $("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === "success" ? "✓" : "✕"}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// ---- Format date ----
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---- Render Tasks ----
function renderTasks() {
  const list = $("taskList");
  const emptyState = $("emptyState");

  const filtered = allTasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  updateStats();

  if (filtered.length === 0) {
    list.innerHTML = "";
    emptyState.style.display = "block";

    const msgs = {
      all: ["No tasks yet", "Add your first task above to get started."],
      active: ["All caught up!", "No active tasks remaining."],
      completed: ["Nothing completed yet", "Complete a task to see it here."],
    };
    const [title, sub] = msgs[currentFilter];
    emptyState.querySelector("h3").textContent = title;
    emptyState.querySelector("p").textContent = sub;
    return;
  }

  emptyState.style.display = "none";

  list.innerHTML = filtered
    .map(
      (task) => `
    <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task._id}">
      <div class="task-checkbox" onclick="toggleTask('${task._id}', ${task.completed})" title="Mark as ${task.completed ? "incomplete" : "complete"}"></div>
      <span class="task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
      <div class="task-meta">
        <span class="task-date">${formatDate(task.createdAt)}</span>
        <button class="task-delete-btn" onclick="deleteTask('${task._id}')" title="Delete task" aria-label="Delete task">✕</button>
      </div>
    </li>`
    )
    .join("");
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---- Update Stats ----
function updateStats() {
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.completed).length;
  const active = total - done;

  $("statTotal").textContent = total;
  $("statDone").textContent = done;
  $("statActive").textContent = active;
}

// ---- Load Tasks ----
async function loadTasks() {
  // Show loading skeletons
  const list = $("taskList");
  list.innerHTML = Array(3)
    .fill(0)
    .map(() => `<li class="skeleton"></li>`)
    .join("");

  try {
    const data = await apiRequest("/api/tasks");
    allTasks = data.tasks || [];
    renderTasks();
  } catch (err) {
    list.innerHTML = "";
    showToast("Failed to load tasks.", "error");
  }
}

// ---- Create Task ----
async function createTask(event) {
  event.preventDefault();
  const input = $("newTaskInput");
  const title = input.value.trim();

  if (!title) {
    input.focus();
    return;
  }

  const btn = $("addTaskBtn");
  btn.disabled = true;
  btn.textContent = "Adding...";

  try {
    const data = await apiRequest("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title }),
    });

    allTasks.unshift(data.task);
    renderTasks();
    input.value = "";
    showToast("Task added.");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span>+</span> Add Task`;
  }
}

// ---- Toggle Task Completion ----
async function toggleTask(taskId, currentStatus) {
  const item = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (item) item.style.opacity = "0.5";

  try {
    const data = await apiRequest(`/api/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !currentStatus }),
    });

    // Update local state
    const idx = allTasks.findIndex((t) => t._id === taskId);
    if (idx !== -1) allTasks[idx] = data.task;

    renderTasks();
    showToast(data.task.completed ? "Task completed! ✓" : "Task marked incomplete.");
  } catch (err) {
    if (item) item.style.opacity = "1";
    showToast(err.message, "error");
  }
}

// ---- Delete Task ----
async function deleteTask(taskId) {
  const item = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (item) item.classList.add("removing");

  // Small delay for animation
  await new Promise((r) => setTimeout(r, 200));

  try {
    await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });

    allTasks = allTasks.filter((t) => t._id !== taskId);
    renderTasks();
    showToast("Task deleted.");
  } catch (err) {
    // Re-render to restore removed item
    renderTasks();
    showToast(err.message, "error");
  }
}

// ---- Filters ----
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  renderTasks();
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  // Set user info in navbar
  const user = auth.getUser();
  if (user) {
    const nameEl = $("userName");
    const avatarEl = $("userAvatar");
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  }

  // Add task form
  const addForm = $("addTaskForm");
  if (addForm) addForm.addEventListener("submit", createTask);

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  // Load tasks
  loadTasks();
});
