import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
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

export default function TrainingDetail() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
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

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await trainingArticleService.getById(articleId);
      const next = response?.data || null;
      setArticle(next);
      setEditTitle(next?.title || "");
      setEditBody(next?.content || "");
      setEditAttachmentFile(null);
      setRemoveCurrentAttachment(false);
    } catch (error) {
      console.error("Failed to load article:", error);
      toast.error(error?.response?.data?.error || "Failed to load article.");
      navigate("/training");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticle();
  }, [articleId]);

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
      await trainingArticleService.update(articleId, {
        title,
        content: body,
        attachment: editAttachmentFile,
        removeAttachment: removeCurrentAttachment,
      });
      await loadArticle();
      setIsEditing(false);
      toast.success("Article updated.");
    } catch (error) {
      console.error("Failed to update article:", error);
      toast.error(error?.response?.data?.error || "Failed to update article.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <Layout
        title="Training Detail"
        breadcrumb={["Home", "Training", "Detail"]}
      >
        <div style={{ padding: "0 4px" }}>Loading...</div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout
        title="Training Detail"
        breadcrumb={["Home", "Training", "Detail"]}
      >
        <div style={{ padding: "0 4px" }}>Article not found.</div>
      </Layout>
    );
  }

  return (
    <Layout title="Training Detail" breadcrumb={["Home", "Training", "Detail"]}>
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {isEditing ? "Edit Article" : article.title}
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className="btn-action"
                title="Back"
                onClick={() => navigate("/training")}
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              {!isEditing && (
                <button
                  type="button"
                  className="btn-action btn-edit"
                  title="Edit"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-pen"></i>
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
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
                style={{ display: "flex", justifyContent: "end", gap: "8px" }}
              >
                <button
                  type="button"
                  className="btn-action"
                  title="Cancel"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(article.title || "");
                    setEditBody(article.content || "");
                    setEditAttachmentFile(null);
                    setRemoveCurrentAttachment(false);
                  }}
                  disabled={savingEdit}
                >
                  <i className="fas fa-times"></i>
                </button>
                <button
                  type="button"
                  className="btn-action btn-save"
                  title="Save"
                  onClick={handleSaveEditArticle}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-check"></i>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <small style={{ color: "#6b7280" }}>
                {new Date(article.created_at).toLocaleString("en-AU")}
              </small>
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
                style={{ marginTop: "10px", lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
