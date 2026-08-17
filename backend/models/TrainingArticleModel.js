const db = require("../config/db");

const normalizeAttachmentItems = (value) => {
  if (!value) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) value = parsed;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      url: String(item?.url || "").trim(),
      name: String(item?.name || "").trim() || "Attachment",
    }))
    .filter((item) => Boolean(item.url));
};

const normalizeArticle = (row) => {
  if (!row) return null;
  const fallbackAttachment =
    row.attachment_url && String(row.attachment_url).trim()
      ? [
          {
            url: String(row.attachment_url).trim(),
            name: String(row.attachment_name || "").trim() || "Attachment",
          },
        ]
      : [];

  const attachments =
    normalizeAttachmentItems(row.attachments).length > 0
      ? normalizeAttachmentItems(row.attachments)
      : fallbackAttachment;

  return {
    ...row,
    attachments,
    attachment_url: attachments[0]?.url || null,
    attachment_name: attachments[0]?.name || null,
  };
};

class TrainingArticleModel {
  static async getAll() {
    const { rows } = await db.query(
      `SELECT *
       FROM training_articles
       ORDER BY created_at DESC`,
    );
    return rows.map(normalizeArticle);
  }

  static async getById(articleId) {
    const { rows } = await db.query(
      `SELECT * FROM training_articles WHERE article_id = ?`,
      [articleId],
    );
    return normalizeArticle(rows[0] || null);
  }

  static async create(articleData) {
    const {
      title,
      content,
      attachment_url = null,
      attachment_name = null,
      attachments = [],
    } = articleData;

    const normalizedAttachments = normalizeAttachmentItems(attachments);

    const sql = `INSERT INTO training_articles (title, content, attachment_url, attachment_name, attachments)
       VALUES (?, ?, ?, ?, ?)`;

    const { insertId } = await db.query(sql, [
      title,
      content,
      attachment_url,
      attachment_name,
      JSON.stringify(normalizedAttachments),
    ]);

    return this.getById(insertId);
  }

  static async update(articleId, articleData) {
    const { title, content, attachment_url, attachment_name, attachments = [] } =
      articleData;

    const normalizedAttachments = normalizeAttachmentItems(attachments);

    await db.query(
      `UPDATE training_articles
       SET title = ?,
           content = ?,
           attachment_url = ?,
           attachment_name = ?,
           attachments = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = ?`,
      [
        title,
        content,
        attachment_url,
        attachment_name,
        JSON.stringify(normalizedAttachments),
        articleId,
      ]
    );

    return this.getById(articleId);
  }

  static async delete(articleId) {
    const { rowCount } = await db.query(
      `DELETE FROM training_articles WHERE article_id = ?`,
      [articleId],
    );
    return rowCount > 0;
  }
}

module.exports = TrainingArticleModel;