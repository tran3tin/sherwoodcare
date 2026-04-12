const db = require("../config/db");

const normalizeAttachmentItems = (value) => {
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
      `SELECT * FROM training_articles WHERE article_id = $1`,
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

    const { rows } = await db.query(
      `INSERT INTO training_articles (title, content, attachment_url, attachment_name, attachments)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [
        title,
        content,
        attachment_url,
        attachment_name,
        JSON.stringify(normalizedAttachments),
      ],
    );

    return normalizeArticle(rows[0]);
  }

  static async update(articleId, articleData) {
    const { title, content, attachment_url, attachment_name, attachments = [] } =
      articleData;

    const normalizedAttachments = normalizeAttachmentItems(attachments);

    const { rows } = await db.query(
      `UPDATE training_articles
       SET title = $1,
           content = $2,
           attachment_url = $3,
           attachment_name = $4,
           attachments = $5::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE article_id = $6
       RETURNING *`,
      [
        title,
        content,
        attachment_url,
        attachment_name,
        JSON.stringify(normalizedAttachments),
        articleId,
      ],
    );

    return normalizeArticle(rows[0] || null);
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
