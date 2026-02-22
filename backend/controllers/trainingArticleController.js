const fs = require("fs");
const path = require("path");
const TrainingArticleModel = require("../models/TrainingArticleModel");

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

    let attachment_url = null;
    let attachment_name = null;

    if (req.file) {
      attachment_url = `/uploads/training/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const created = await TrainingArticleModel.create({
      title: String(title).trim(),
      content,
      attachment_url,
      attachment_name,
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

    let attachment_url = existing.attachment_url || null;
    let attachment_name = existing.attachment_name || null;

    const removeAttachmentFlag =
      remove_attachment === true || String(remove_attachment) === "true";

    if (removeAttachmentFlag && attachment_url) {
      const relativePath = String(attachment_url).replace(/^\/+/, "");
      const filePath = path.join(__dirname, "..", "public", relativePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      attachment_url = null;
      attachment_name = null;
    }

    if (req.file) {
      if (attachment_url) {
        const relativePath = String(attachment_url).replace(/^\/+/, "");
        const oldFilePath = path.join(__dirname, "..", "public", relativePath);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      attachment_url = `/uploads/training/${req.file.filename}`;
      attachment_name = req.file.originalname;
    }

    const updated = await TrainingArticleModel.update(articleId, {
      title: nextTitle,
      content: nextContent,
      attachment_url,
      attachment_name,
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

    if (target.attachment_url) {
      const relativePath = String(target.attachment_url).replace(/^\/+/, "");
      const filePath = path.join(__dirname, "..", "public", relativePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

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
