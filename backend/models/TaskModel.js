const db = require("../config/db");

class TaskModel {
  // Map an attachment row → { id, url, name }
  static mapAttachment(row) {
    return { id: row.attachment_id, url: row.file_url, name: row.file_name };
  }

  // Fetch attachments for the given task ids and attach to each task.
  // Done in a separate query + JS merge instead of JSON_ARRAYAGG so it works
  // on both MySQL 8 and MariaDB 10.x (JSON_ARRAYAGG is missing before MariaDB 10.5).
  static async attachFiles(tasks) {
    if (!tasks.length) return tasks;
    const ids = tasks.map((t) => t.task_id);
    const { rows: attachments } = await db.query(
      `SELECT attachment_id, task_id, file_url, file_name
       FROM task_attachments
       WHERE task_id IN (?)`,
      [ids]
    );
    const byTask = {};
    for (const row of attachments) {
      (byTask[row.task_id] = byTask[row.task_id] || []).push(
        TaskModel.mapAttachment(row)
      );
    }
    for (const task of tasks) {
      task.attachments = byTask[task.task_id] || [];
    }
    return tasks;
  }

  // Get all tasks with attachments
  // Pinned tasks float to the top of each column (is_pinned DESC),
  // then keep manual drag order via position.
  static async getAll() {
    try {
      const { rows } = await db.query(
        `SELECT * FROM tasks
         ORDER BY
           COALESCE(is_pinned, 0) DESC,
           pinned_at DESC,
           position ASC,
           created_at DESC`
      );
      return await TaskModel.attachFiles(rows);
    } catch (err) {
      const message = (err && err.message) || "";
      // Backward-compatible if pin columns not migrated yet
      if (message.includes("is_pinned") || message.includes("pinned_at")) {
        const { rows } = await db.query(
          `SELECT * FROM tasks
           ORDER BY position ASC, created_at DESC`
        );
        return await TaskModel.attachFiles(rows);
      }
      throw err;
    }
  }

  // Get tasks by status
  static async getByStatus(status) {
    try {
      const { rows } = await db.query(
        `SELECT * FROM tasks
         WHERE status = ?
         ORDER BY
           COALESCE(is_pinned, 0) DESC,
           pinned_at DESC,
           position ASC`,
        [status]
      );
      return rows;
    } catch (err) {
      const message = (err && err.message) || "";
      if (message.includes("is_pinned") || message.includes("pinned_at")) {
        const { rows } = await db.query(
          `SELECT * FROM tasks WHERE status = ? ORDER BY position ASC`,
          [status]
        );
        return rows;
      }
      throw err;
    }
  }

  // Get single task by ID
  static async getById(taskId) {
    const { rows } = await db.query(
      `SELECT * FROM tasks WHERE task_id = ?`,
      [taskId]
    );
    if (!rows.length) return null;
    const [task] = await TaskModel.attachFiles(rows);
    return task;
  }

  // Helper to convert empty strings to null
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
      files = [], // Array of { url, name }
    } = taskData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Get max position for the status
      const [posRows] = await conn.query(
        `SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM tasks WHERE status = ?`,
        [status]
      );
      const nextPosition = posRows[0]?.next_pos || 0;

      // Insert task
      const [result] = await conn.query(
        `INSERT INTO tasks
         (title, description, status, priority, due_date, assigned_to, position)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          status,
          priority,
          TaskModel.toNull(due_date),
          TaskModel.toNull(assigned_to),
          nextPosition,
        ]
      );

      const taskId = result.insertId;

      // Insert attachments
      if (files && files.length > 0) {
        for (const file of files) {
          await conn.query(
            `INSERT INTO task_attachments (task_id, file_url, file_name) VALUES (?, ?, ?)`,
            [taskId, file.url, file.name]
          );
        }
      }

      await conn.commit();

      // Return the complete task
      return await TaskModel.getById(taskId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
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
      files = [], // New files to add
    } = taskData;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [updateResult] = await conn.query(
        `UPDATE tasks
         SET title = ?, description = ?, status = ?, priority = ?,
             due_date = ?, assigned_to = ?, position = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE task_id = ?`,
        [
          title,
          description,
          status,
          priority,
          TaskModel.toNull(due_date),
          TaskModel.toNull(assigned_to),
          position,
          taskId,
        ]
      );

      if (updateResult.affectedRows === 0) {
        await conn.rollback();
        throw new Error("Task not found");
      }

      // Add new attachments
      if (files && files.length > 0) {
        for (const file of files) {
          await conn.query(
            `INSERT INTO task_attachments (task_id, file_url, file_name) VALUES (?, ?, ?)`,
            [taskId, file.url, file.name]
          );
        }
      }

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      console.error("TaskModel.update error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async removeAttachment(attachmentId) {
    const { rowCount } = await db.query(
      `DELETE FROM task_attachments WHERE attachment_id = ?`,
      [attachmentId]
    );
    return rowCount > 0;
  }

  // Update task status and position (for drag & drop)
  static async updatePosition(taskId, status, position) {
    const { rowCount } = await db.query(
      `UPDATE tasks
       SET status = ?, position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE task_id = ?`,
      [status, position, taskId]
    );
    return rowCount > 0;
  }

  // Reorder tasks in a column
  static async reorderTasks(status, taskIds) {
    for (let i = 0; i < taskIds.length; i++) {
      await db.query(
        `UPDATE tasks SET position = ?, status = ? WHERE task_id = ?`,
        [i, status, taskIds[i]]
      );
    }
    return true;
  }

  // Delete task
  static async delete(taskId) {
    const { rowCount } = await db.query(
      `DELETE FROM tasks WHERE task_id = ?`,
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
    // Check if pin columns exist (MySQL information_schema).
    // MySQL 8 may return TABLE_NAME/COLUMN_NAME uppercase — normalize.
    const { rows: schemaCheck } = await db.query(
      `SELECT column_name AS col
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'tasks'
         AND column_name IN ('is_pinned', 'pinned_at')`
    );

    const cols = new Set(
      schemaCheck.map((r) =>
        String(r.col ?? r.COL ?? r.column_name ?? r.COLUMN_NAME ?? "").toLowerCase()
      )
    );

    if (!cols.has("is_pinned") || !cols.has("pinned_at")) {
      // Direct probe as fallback (same casing quirks as FullNoteModel)
      try {
        await db.query("SELECT is_pinned, pinned_at FROM tasks LIMIT 0");
      } catch (_) {
        const err = new Error(
          "Pinning is not available until the database is migrated (missing is_pinned/pinned_at columns)."
        );
        err.code = "PIN_COLUMNS_MISSING";
        throw err;
      }
    }

    // Read current value first so pinned_at logic is unambiguous across engines
    const { rows } = await db.query(
      `SELECT is_pinned FROM tasks WHERE task_id = ?`,
      [taskId]
    );
    if (!rows.length) return false;

    const currentlyPinned = Boolean(rows[0].is_pinned);
    const { rowCount } = await db.query(
      `UPDATE tasks
       SET is_pinned = ?,
           pinned_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE task_id = ?`,
      [currentlyPinned ? 0 : 1, currentlyPinned ? null : new Date(), taskId]
    );

    return rowCount > 0;
  }
}

module.exports = TaskModel;