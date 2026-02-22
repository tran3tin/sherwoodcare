import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { API_BASE_URL } from "../../config/api";
import { trainingArticleService } from "../../services/trainingArticleService";
import "react-quill/dist/quill.snow.css";

const buildAssetUrl = (url) => {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

export default function Training() {
  const [articleTitle, setArticleTitle] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAttachmentFile, setEditAttachmentFile] = useState(null);
  const [removeCurrentAttachment, setRemoveCurrentAttachment] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    }),
    [],
  );

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
  ];

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await trainingArticleService.getAll();
      setArticles(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load training articles:", error);
      toast.error("Failed to load training articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleCreateArticle = async () => {
    const title = articleTitle.trim();
    const body = articleBody.trim();

    if (!title) {
      toast.warning("Please enter article title.");
      return;
    }

    if (!body || body === "<p><br></p>") {
      toast.warning("Please enter article content.");
      return;
    }

    try {
      setPublishing(true);
      await trainingArticleService.create({
        title,
        content: body,
        attachment: attachmentFile,
      });
      setArticleTitle("");
      setArticleBody("");
      setAttachmentFile(null);
      await loadArticles();
      toast.success("Article created successfully.");
    } catch (error) {
      console.error("Failed to create training article:", error);
      toast.error(error?.response?.data?.error || "Failed to create article.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteArticle = async (id) => {
    try {
      setDeletingId(id);
      await trainingArticleService.delete(id);
      await loadArticles();
      toast.success("Article deleted.");
    } catch (error) {
      console.error("Failed to delete training article:", error);
      toast.error(error?.response?.data?.error || "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditArticle = (article) => {
    setEditingId(article.article_id);
    setEditTitle(article.title || "");
    setEditBody(article.content || "");
    setEditAttachmentFile(null);
    setRemoveCurrentAttachment(false);
  };

  const cancelEditArticle = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditAttachmentFile(null);
    setRemoveCurrentAttachment(false);
  };

  const handleSaveEditArticle = async () => {
    const title = editTitle.trim();
    const body = editBody.trim();

    if (!title) {
      toast.warning("Please enter article title.");
      return;
    }
    if (!body || body === "<p><br></p>") {
      toast.warning("Please enter article content.");
      return;
    }

    try {
      setSavingEdit(true);
      await trainingArticleService.update(editingId, {
        title,
        content: body,
        attachment: editAttachmentFile,
        removeAttachment: removeCurrentAttachment,
      });
      await loadArticles();
      cancelEditArticle();
      toast.success("Article updated.");
    } catch (error) {
      console.error("Failed to update training article:", error);
      toast.error(error?.response?.data?.error || "Failed to update article.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Layout title="Training" breadcrumb={["Home", "Training"]}>
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px",
            marginBottom: "14px",
          }}
        >
          <h2 style={{ margin: "0 0 12px" }}>Create Training Article</h2>

          <input
            type="text"
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder="Article title"
            style={{
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          />

          <div style={{ marginBottom: "10px" }}>
            <ReactQuill
              theme="snow"
              value={articleBody}
              onChange={setArticleBody}
              modules={modules}
              formats={formats}
              style={{ background: "#fff" }}
            />
          </div>

          <div
            style={{
              border: "1px dashed #d1d5db",
              borderRadius: "6px",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <label
              style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}
            >
              Attachment File
            </label>
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
            />
            {attachmentFile && (
              <div
                style={{ marginTop: "6px", color: "#374151", fontSize: "13px" }}
              >
                Selected: {attachmentFile.name}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "end" }}>
            <button
              type="button"
              className="btn-action"
              onClick={() => {
                setArticleTitle("");
                setArticleBody("");
                setAttachmentFile(null);
              }}
              disabled={publishing}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn-action btn-save"
              onClick={handleCreateArticle}
              disabled={publishing}
            >
              {publishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px",
          }}
        >
          <h3 style={{ margin: "0 0 10px" }}>Training Articles</h3>
          {loading ? (
            <p style={{ margin: 0, color: "#6b7280" }}>Loading...</p>
          ) : articles.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>No articles yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {articles.map((article) => (
                <div
                  key={article.article_id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  {editingId === article.article_id ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          width: "100%",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          padding: "8px",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      />

                      <ReactQuill
                        theme="snow"
                        value={editBody}
                        onChange={setEditBody}
                        modules={modules}
                        formats={formats}
                        style={{ background: "#fff", marginBottom: "8px" }}
                      />

                      {article.attachment_url && !removeCurrentAttachment && (
                        <div style={{ marginBottom: "8px" }}>
                          <a
                            href={buildAssetUrl(article.attachment_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#0b4f78", fontSize: "13px" }}
                          >
                            <i
                              className="fas fa-paperclip"
                              style={{ marginRight: "4px" }}
                            ></i>
                            {article.attachment_name || "Attachment"}
                          </a>
                        </div>
                      )}

                      <div style={{ marginBottom: "8px" }}>
                        <input
                          type="file"
                          onChange={(e) =>
                            setEditAttachmentFile(e.target.files?.[0] || null)
                          }
                        />
                        {article.attachment_url && (
                          <label
                            style={{
                              marginLeft: "10px",
                              fontSize: "13px",
                              color: "#374151",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={removeCurrentAttachment}
                              onChange={(e) =>
                                setRemoveCurrentAttachment(e.target.checked)
                              }
                              style={{ marginRight: "4px" }}
                            />
                            Remove current attachment
                          </label>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-action"
                          onClick={cancelEditArticle}
                          disabled={savingEdit}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-save"
                          onClick={handleSaveEditArticle}
                          disabled={savingEdit}
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <h4 style={{ margin: "0 0 6px" }}>{article.title}</h4>
                          <small style={{ color: "#6b7280" }}>
                            {new Date(article.created_at).toLocaleString(
                              "en-AU",
                            )}
                          </small>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            type="button"
                            className="btn-action btn-edit"
                            onClick={() => startEditArticle(article)}
                            title="Edit"
                            disabled={deletingId === article.article_id}
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() =>
                              handleDeleteArticle(article.article_id)
                            }
                            title="Delete"
                            disabled={deletingId === article.article_id}
                          >
                            {deletingId === article.article_id ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-trash"></i>
                            )}
                          </button>
                        </div>
                      </div>
                      {article.attachment_url && (
                        <div style={{ marginTop: "8px" }}>
                          <a
                            href={buildAssetUrl(article.attachment_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#0b4f78", fontSize: "13px" }}
                          >
                            <i
                              className="fas fa-paperclip"
                              style={{ marginRight: "4px" }}
                            ></i>
                            {article.attachment_name || "Attachment"}
                          </a>
                        </div>
                      )}
                      <div
                        style={{ marginTop: "8px" }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
