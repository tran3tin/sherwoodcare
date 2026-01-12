const db = require("../config/db");

class TaskModel {
  // Get all tasks
  static async getAll() {
    const { rows } = await db.query(
      `SELECT * FROM tasks ORDER BY position ASC, created_at DESC`
    );
    return rows;
  }

  // Get tasks by status
  static async getByStatus(status) {
    const { rows } = await db.query(
      `SELECT * FROM tasks WHERE status = $1 ORDER BY position ASC`,
      [status]
    );
    return rows;
  }

  // Get single task by ID
  static async getById(taskId) {
    const { rows } = await db.query(`SELECT * FROM tasks WHERE task_id = $1`, [
      taskId,
    ]);
    return rows[0];
  }

  // Helper to convert empty strings to null (PostgreSQL compatibility)
  static toNull(value) {
    return value === "" || value === undefined ? null : value;
  }

  // Create new task
  static async create(taskData) {
    const {
      title,
      description = "",
      status = "todo",
      priority = "medium",
      due_date = null,
      assigned_to = null,
      position = 0,
      attachment_url = null,
      attachment_name = null,
    } = taskData;

    // Get max position for the status
    const { rows: posRows } = await db.query(
      `SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM tasks WHERE status = $1`,
      [status]
    );
    const nextPosition = posRows[0]?.next_pos || 0;

    const { rows: result } = await db.query(
      `INSERT INTO tasks 
       (title, description, status, priority, due_date, assigned_to, position, attachment_url, attachment_name) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        description,
        status,
        priority,
        TaskModel.toNull(due_date), // Ensure null not empty string
        TaskModel.toNull(assigned_to), // Ensure null not empty string
        nextPosition,
        TaskModel.toNull(attachment_url),
        TaskModel.toNull(attachment_name),
      ]
    );

    return result[0];
  }

  // Update task
  static async update(taskId, taskData) {
    const {
      title,
      description,
      status,
      priority,
      due_date,
      assigned_to,
      position,
      attachment_url,
      attachment_name,
    } = taskData;

    const { rowCount } = await db.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, 
           due_date = $5, assigned_to = $6, position = $7,
           attachment_url = $8, attachment_name = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $10`,
      [
        title,
        description,
        status,
        priority,
        TaskModel.toNull(due_date), // Ensure null not empty string
        TaskModel.toNull(assigned_to), // Ensure null not empty string
        position,
        TaskModel.toNull(attachment_url),
        TaskModel.toNull(attachment_name),
        taskId,
      ]
    );

    return rowCount > 0;
  }

  // Update task status and position (for drag & drop)
  static async updatePosition(taskId, status, position) {
    const { rowCount } = await db.query(
      `UPDATE tasks 
       SET status = $1, position = $2, updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $3`,
      [status, position, taskId]
    );
    return rowCount > 0;
  }

  // Reorder tasks in a column
  static async reorderTasks(status, taskIds) {
    for (let i = 0; i < taskIds.length; i++) {
      await db.query(
        `UPDATE tasks SET position = $1, status = $2 WHERE task_id = $3`,
        [i, status, taskIds[i]]
      );
    }
    return true;
  }

  // Delete task
  static async delete(taskId) {
    const { rowCount } = await db.query(
      `DELETE FROM tasks WHERE task_id = $1`,
      [taskId]
    );
    return rowCount > 0;
  }

  // Get tasks count by status
  static async getCountByStatus() {
    const { rows } = await db.query(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
    );
    return rows;
  }

  // Toggle task pin
  static async togglePin(taskId) {
    // Check if pin columns exist
    const { rows: schemaCheck } = await db.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'tasks' 
       AND column_name IN ('is_pinned', 'pinned_at')`
    );

    if (schemaCheck.length < 2) {
      const err = new Error(
        "Pinning is not available until the database is migrated (missing is_pinned/pinned_at columns)."
      );
      err.code = "PIN_COLUMNS_MISSING";
      throw err;
    }

    const { rows } = await db.query(
      `UPDATE tasks 
       SET is_pinned = NOT is_pinned, 
           pinned_at = CASE WHEN is_pinned THEN NULL ELSE CURRENT_TIMESTAMP END,
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = $1
       RETURNING is_pinned`,
      [taskId]
    );

    return rows.length > 0;
  }
}

module.exports = TaskModel;
