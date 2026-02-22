const db = require("../config/db");

class TrainingArticleModel {
  static async getAll() {
    const { rows } = await db.query(
      `SELECT *
       FROM training_articles
       ORDER BY created_at DESC`,
    );
    return rows;
  }

  static async getById(articleId) {
    const { rows } = await db.query(
      `SELECT * FROM training_articles WHERE article_id = $1`,
      [articleId],
    );
    return rows[0] || null;
  }

  static async create(articleData) {
    const {
      title,
      content,
      attachment_url = null,
      attachment_name = null,
    } = articleData;

    const { rows } = await db.query(
      `INSERT INTO training_articles (title, content, attachment_url, attachment_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, content, attachment_url, attachment_name],
    );

    return rows[0];
  }

  static async update(articleId, articleData) {
    const { title, content, attachment_url, attachment_name } = articleData;

    const { rows } = await db.query(
      `UPDATE training_articles
       SET title = $1,
           content = $2,
           attachment_url = $3,
           attachment_name = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = $5
       RETURNING *`,
      [title, content, attachment_url, attachment_name, articleId],
    );

    return rows[0] || null;
  }

  static async delete(articleId) {
    const { rowCount } = await db.query(
      `DELETE FROM training_articles WHERE article_id = $1`,
      [articleId],
    );
    return rowCount > 0;
  }
}

module.exports = TrainingArticleModel;
