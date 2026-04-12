const fs = require("fs");
const path = require("path");
const TrainingArticleModel = require("../models/TrainingArticleModel");

const toNormalizedRelativePath = (url) => String(url || "").replace(/^\/+/, "");

const deletePublicFile = (attachmentUrl) => {
  if (!attachmentUrl) return;
  const relativePath = toNormalizedRelativePath(attachmentUrl);
  const filePath = path.join(__dirname, "..", "public", relativePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const toIncomingFiles = (req) => {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;

  const attachments = Array.isArray(req.files.attachments)
    ? req.files.attachments
    : [];
  const legacyAttachment = Array.isArray(req.files.attachment)
    ? req.files.attachment
    : [];

  return [...attachments, ...legacyAttachment];
};

const buildAttachmentRecord = (file) => ({
  url: `/uploads/training/${file.filename}`,
  name: file.originalname,
});

const parseRemoveAttachmentUrls = (rawValue) => {
  if (!rawValue) return [];

  if (Array.isArray(rawValue)) {
    return rawValue.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof rawValue === "string") {
    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch (_) {
      // Ignore parsing error and treat as single string value.
    }

    return [rawValue.trim()].filter(Boolean);
  }

  return [];
};

const getAllArticles = async (req, res) => {
  try {
    const data = await TrainingArticleModel.getAll();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching training articles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch articles" });
  }
};

const getArticleById = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    if (!Number.isFinite(articleId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid article id" });
    }

    const data = await TrainingArticleModel.getById(articleId);
    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: "Article not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching training article:", error);
    res.status(500).json({ success: false, error: "Failed to fetch article" });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !String(title).trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    if (!content || !String(content).trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    const uploadedFiles = toIncomingFiles(req);
    const attachments = uploadedFiles.map(buildAttachmentRecord);
    const attachment_url = attachments[0]?.url || null;
    const attachment_name = attachments[0]?.name || null;

    const created = await TrainingArticleModel.create({
      title: String(title).trim(),
      content,
      attachment_url,
      attachment_name,
      attachments,
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating training article:", error);
    res.status(500).json({ success: false, error: "Failed to create article" });
  }
};

const updateArticle = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    if (!Number.isFinite(articleId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid article id" });
    }

    const existing = await TrainingArticleModel.getById(articleId);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: "Article not found" });
    }

    const { title, content, remove_attachment } = req.body;
    const nextTitle = String(title || "").trim();
    const nextContent = String(content || "").trim();

    if (!nextTitle) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }
    if (!nextContent) {
      return res
        .status(400)
        .json({ success: false, error: "Content is required" });
    }

    const existingAttachments = Array.isArray(existing.attachments)
      ? existing.attachments
      : existing.attachment_url
        ? [
            {
              url: existing.attachment_url,
              name: existing.attachment_name || "Attachment",
            },
          ]
        : [];

    const removeAttachmentUrls = parseRemoveAttachmentUrls(
      req.body.remove_attachment_urls,
    );

    const removeAttachmentFlag =
      remove_attachment === true || String(remove_attachment) === "true";
    const shouldRemoveAll =
      removeAttachmentFlag && removeAttachmentUrls.length === 0;
    const attachmentsToRemove = shouldRemoveAll
      ? existingAttachments
      : existingAttachments.filter((item) =>
          removeAttachmentUrls.includes(String(item?.url || "").trim()),
        );

    attachmentsToRemove.forEach((item) => deletePublicFile(item?.url));

    const keptAttachments = shouldRemoveAll
      ? []
      : existingAttachments.filter(
          (item) =>
            !removeAttachmentUrls.includes(String(item?.url || "").trim()),
        );

    const incomingAttachments = toIncomingFiles(req).map(buildAttachmentRecord);
    const attachments = [...keptAttachments, ...incomingAttachments];

    const attachment_url = attachments[0]?.url || null;
    const attachment_name = attachments[0]?.name || null;

    const updated = await TrainingArticleModel.update(articleId, {
      title: nextTitle,
      content: nextContent,
      attachment_url,
      attachment_name,
      attachments,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating training article:", error);
    res.status(500).json({ success: false, error: "Failed to update article" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);
    if (!Number.isFinite(articleId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid article id" });
    }

    const articles = await TrainingArticleModel.getAll();
    const target = articles.find((a) => Number(a.article_id) === articleId);
    if (!target) {
      return res
        .status(404)
        .json({ success: false, error: "Article not found" });
    }

    const attachments = Array.isArray(target.attachments)
      ? target.attachments
      : target.attachment_url
        ? [
            {
              url: target.attachment_url,
              name: target.attachment_name || "Attachment",
            },
          ]
        : [];

    attachments.forEach((item) => deletePublicFile(item?.url));

    const deleted = await TrainingArticleModel.delete(articleId);
    if (!deleted) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to delete article" });
    }

    res.json({ success: true, message: "Article deleted" });
  } catch (error) {
    console.error("Error deleting training article:", error);
    res.status(500).json({ success: false, error: "Failed to delete article" });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
