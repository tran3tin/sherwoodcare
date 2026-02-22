import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { trainingArticleService } from "../../services/trainingArticleService";

const stripHtml = (html) =>
  String(html || "")
    .replace(/<[^>]*>/g, " ")
    .trim();

export default function Training() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterAttachment, setFilterAttachment] = useState("all");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredArticles = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return articles.filter((article) => {
      const title = String(article?.title || "").toLowerCase();
      const content = stripHtml(article?.content).toLowerCase();
      const hasAttachment = Boolean(article?.attachment_url);

      const matchedText =
        !query || title.includes(query) || content.includes(query);
      const matchedAttachment =
        filterAttachment === "all" ||
        (filterAttachment === "with" && hasAttachment) ||
        (filterAttachment === "without" && !hasAttachment);

      return matchedText && matchedAttachment;
    });
  }, [articles, searchText, filterAttachment]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterAttachment, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const pagedArticles = filteredArticles.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handleDeleteArticle = async (id) => {
    const confirmed = window.confirm("Delete this article?");
    if (!confirmed) return;

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <h2 style={{ margin: 0 }}>Training Articles</h2>
            <button
              type="button"
              className="btn-action btn-save"
              onClick={() => navigate("/training/new")}
              title="Create new article"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Search title/content..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: 1,
                minWidth: "240px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "8px 10px",
                fontSize: "14px",
              }}
            />
            <select
              value={filterAttachment}
              onChange={(e) => setFilterAttachment(e.target.value)}
              style={{
                minWidth: "170px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                padding: "8px 10px",
                fontSize: "14px",
              }}
            >
              <option value="all">All attachments</option>
              <option value="with">With attachment</option>
              <option value="without">Without attachment</option>
            </select>
          </div>

          {loading ? (
            <p style={{ margin: 0, color: "#6b7280" }}>Loading...</p>
          ) : filteredArticles.length === 0 ? (
            <p style={{ margin: 0, color: "#6b7280" }}>No matching articles.</p>
          ) : (
            <div style={{ display: "grid", gap: "10px" }}>
              {pagedArticles.map((article, idx) => (
                <div
                  key={article.article_id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 4px" }}>
                        #{startIndex + idx + 1} • {article.title}
                      </h4>
                      <small style={{ color: "#6b7280" }}>
                        {new Date(article.created_at).toLocaleString("en-AU")}
                      </small>
                      {article.attachment_url && (
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "12px",
                            color: "#0b4f78",
                          }}
                        >
                          <i
                            className="fas fa-paperclip"
                            style={{ marginRight: "4px" }}
                          ></i>
                          Attachment
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="btn-action btn-view"
                        title="View detail"
                        onClick={() =>
                          navigate(`/training/${article.article_id}`)
                        }
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="btn-action btn-delete"
                        title="Delete"
                        onClick={() => handleDeleteArticle(article.article_id)}
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

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#374151",
                      lineHeight: 1.45,
                    }}
                  >
                    {stripHtml(article.content).slice(0, 220)}
                    {stripHtml(article.content).length > 220 ? "..." : ""}
                  </p>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginTop: "6px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <small style={{ color: "#6b7280" }}>
                    Page {safeCurrentPage} / {totalPages} •{" "}
                    {filteredArticles.length} article(s)
                  </small>
                  <select
                    value={String(pageSize)}
                    onChange={(e) => setPageSize(Number(e.target.value) || 6)}
                    style={{
                      minWidth: "100px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "6px 8px",
                      fontSize: "13px",
                    }}
                    title="Rows per page"
                  >
                    <option value="6">6 / page</option>
                    <option value="10">10 / page</option>
                    <option value="20">20 / page</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="btn-action"
                    title="Previous page"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={safeCurrentPage <= 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button
                    type="button"
                    className="btn-action"
                    title="Next page"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={safeCurrentPage >= totalPages}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
