import React, { useMemo, useState } from "react";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { trainingArticleService } from "../../services/trainingArticleService";
import "react-quill/dist/quill.snow.css";

export default function TrainingCreate() {
  const navigate = useNavigate();
  const [articleTitle, setArticleTitle] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [publishing, setPublishing] = useState(false);

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
      toast.success("Article created successfully.");
      navigate("/training");
    } catch (error) {
      console.error("Failed to create training article:", error);
      toast.error(error?.response?.data?.error || "Failed to create article.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Layout
      title="Create Training Article"
      breadcrumb={["Home", "Training", "Create"]}
    >
      <div style={{ padding: "0 4px" }}>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px",
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
              title="Back"
              onClick={() => navigate("/training")}
              disabled={publishing}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <button
              type="button"
              className="btn-action"
              title="Clear"
              onClick={() => {
                setArticleTitle("");
                setArticleBody("");
                setAttachmentFile(null);
              }}
              disabled={publishing}
            >
              <i className="fas fa-eraser"></i>
            </button>
            <button
              type="button"
              className="btn-action btn-save"
              title="Publish"
              onClick={handleCreateArticle}
              disabled={publishing}
            >
              {publishing ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
