import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

/*
============================================================
MSR - NEWS MANAGEMENT
============================================================

File:
src/components/national/NewsManagement.jsx

Everything is contained in this file:
- JSX
- CSS
- API logic
- Image upload
- Create news
- Edit news
- Delete news
- Publish / unpublish
- Search
- Filters
- Preview
- Responsive design

Expected API:
GET    /api/admin/news
POST   /api/admin/news
PUT    /api/admin/news/:id
DELETE /api/admin/news/:id
PATCH  /api/admin/news/:id/status
============================================================
*/

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const CATEGORIES = [
  "General",
  "Events",
  "Training",
  "Community",
  "Leadership",
  "Youth",
  "Volunteering",
  "Announcements",
  "Achievements",
];

const INITIAL_FORM = {
  title: "",
  category: "General",
  excerpt: "",
  content: "",
  status: "draft",
};

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${BACKEND_URL}/${image.replace(/^\/+/, "")}`;
};

const getNewsId = (news) => news?.id || news?._id;

const getNewsImage = (news) =>
  news?.image_url ||
  news?.image ||
  news?.featured_image ||
  news?.featuredImage ||
  "";

const getNewsDate = (news) =>
  news?.created_at ||
  news?.createdAt ||
  news?.published_at ||
  news?.publishedAt ||
  null;

const getNewsStatus = (news) => {
  if (news?.status) return String(news.status).toLowerCase();

  if (
    news?.published === true ||
    news?.is_published === true ||
    news?.isPublished === true
  ) {
    return "published";
  }

  return "draft";
};

const getNewsExcerpt = (news) =>
  news?.excerpt ||
  news?.short_description ||
  news?.shortDescription ||
  "";

const formatDate = (date) => {
  if (!date) return "No date";

  try {
    return new Date(date).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "No date";
  }
};

const NewsManagement = () => {
  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [editingNews, setEditingNews] = useState(null);
  const [previewNews, setPreviewNews] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fileInputRef = useRef(null);

  /*
  ============================================================
  FETCH NEWS
  ============================================================
  */

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/admin/news`);

      const responseData = response.data;

      let newsData = [];

      if (Array.isArray(responseData)) {
        newsData = responseData;
      } else if (Array.isArray(responseData?.news)) {
        newsData = responseData.news;
      } else if (Array.isArray(responseData?.data)) {
        newsData = responseData.data;
      }

      setNews(newsData);
    } catch (err) {
      console.error("Fetch news error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load news. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  /*
  ============================================================
  CLEAR MESSAGES
  ============================================================
  */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /*
  ============================================================
  FORM INPUT
  ============================================================
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ============================================================
  IMAGE SELECT
  ============================================================
  */

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    clearMessages();

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  /*
  ============================================================
  REMOVE IMAGE
  ============================================================
  */

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  ============================================================
  OPEN CREATE FORM
  ============================================================
  */

  const openCreateForm = () => {
    clearMessages();

    setEditingNews(null);
    setForm(INITIAL_FORM);

    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowForm(true);
  };

  /*
  ============================================================
  OPEN EDIT FORM
  ============================================================
  */

  const openEditForm = (item) => {
    clearMessages();

    setEditingNews(item);

    setForm({
      title: item?.title || "",
      category: item?.category || "General",
      excerpt: getNewsExcerpt(item),
      content: item?.content || item?.body || "",
      status: getNewsStatus(item),
    });

    setSelectedImage(null);

    const existingImage = getNewsImage(item);

    setImagePreview(existingImage ? getImageUrl(existingImage) : "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  ============================================================
  CLOSE FORM
  ============================================================
  */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingNews(null);
    setForm(INITIAL_FORM);

    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /*
  ============================================================
  SUBMIT NEWS
  ============================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!form.title.trim()) {
      setError("News title is required.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    if (!form.content.trim()) {
      setError("News content is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("category", form.category);
      formData.append("excerpt", form.excerpt.trim());
      formData.append("content", form.content.trim());
      formData.append("status", form.status);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      let response;

      if (editingNews) {
        const id = getNewsId(editingNews);

        response = await axios.put(
          `${API_URL}/admin/news/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          `${API_URL}/admin/news`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      console.log("News saved:", response.data);

      setSuccess(
        editingNews
          ? "News updated successfully."
          : "News created successfully."
      );

      closeForm();

      await fetchNews();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Save news error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to save news. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  ============================================================
  DELETE NEWS
  ============================================================
  */

  const handleDelete = async (item) => {
    const id = getNewsId(item);

    if (!id) {
      setError("News ID was not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      clearMessages();

      await axios.delete(`${API_URL}/admin/news/${id}`);

      setSuccess("News deleted successfully.");

      setNews((previous) =>
        previous.filter((item) => getNewsId(item) !== id)
      );
    } catch (err) {
      console.error("Delete news error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to delete news."
      );
    }
  };

  /*
  ============================================================
  TOGGLE STATUS
  ============================================================
  */

  const toggleStatus = async (item) => {
    const id = getNewsId(item);

    if (!id) {
      setError("News ID was not found.");
      return;
    }

    const currentStatus = getNewsStatus(item);

    const newStatus =
      currentStatus === "published"
        ? "draft"
        : "published";

    try {
      clearMessages();

      await axios.patch(
        `${API_URL}/admin/news/${id}/status`,
        {
          status: newStatus,
        }
      );

      setNews((previous) =>
        previous.map((newsItem) => {
          if (getNewsId(newsItem) !== id) {
            return newsItem;
          }

          return {
            ...newsItem,
            status: newStatus,
            published:
              newStatus === "published",
          };
        })
      );

      setSuccess(
        newStatus === "published"
          ? "News published successfully."
          : "News moved to draft."
      );
    } catch (err) {
      console.error("Toggle status error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update news status."
      );
    }
  };

  /*
  ============================================================
  PREVIEW
  ============================================================
  */

  const openPreview = (item) => {
    setPreviewNews(item);
    setShowPreview(true);
  };

  const closePreview = () => {
    setPreviewNews(null);
    setShowPreview(false);
  };

  /*
  ============================================================
  FILTER NEWS
  ============================================================
  */

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news.filter((item) => {
      const title = String(item?.title || "").toLowerCase();

      const excerpt = String(
        getNewsExcerpt(item)
      ).toLowerCase();

      const content = String(
        item?.content || item?.body || ""
      ).toLowerCase();

      const category = String(
        item?.category || "General"
      );

      const status = getNewsStatus(item);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        excerpt.includes(query) ||
        content.includes(query);

      const matchesCategory =
        categoryFilter === "all" ||
        category.toLowerCase() ===
          categoryFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    news,
    search,
    categoryFilter,
    statusFilter,
  ]);

  /*
  ============================================================
  STATISTICS
  ============================================================
  */

  const totalNews = news.length;

  const publishedNews = news.filter(
    (item) => getNewsStatus(item) === "published"
  ).length;

  const draftNews = news.filter(
    (item) => getNewsStatus(item) === "draft"
  ).length;

  const categoryCount = new Set(
    news.map((item) => item?.category || "General")
  ).size;

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <>
      <style>{`
        /* =====================================================
           MSR NEWS MANAGEMENT
           ALL CSS IS INSIDE THIS JSX FILE
        ===================================================== */

        .msr-news-page {
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: #f5f6fa;
          padding: 24px;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
          color: #252525;
        }

        .msr-news-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* HEADER */

        .msr-news-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .msr-news-title-area h1 {
          margin: 0 0 6px;
          color: #6a1b9a;
          font-size: 30px;
          font-weight: 800;
        }

        .msr-news-title-area p {
          margin: 0;
          color: #707070;
          font-size: 14px;
        }

        .msr-add-button {
          border: none;
          background: #6a1b9a;
          color: white;
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s ease;
          box-shadow: 0 4px 12px rgba(106, 27, 154, 0.2);
        }

        .msr-add-button:hover {
          background: #55157b;
          transform: translateY(-1px);
        }

        /* ALERTS */

        .msr-alert {
          padding: 13px 16px;
          border-radius: 8px;
          margin-bottom: 18px;
          font-size: 14px;
          font-weight: 600;
        }

        .msr-alert-error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }

        .msr-alert-success {
          background: #e8f5e9;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        }

        /* STATS */

        .msr-news-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .msr-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.04);
        }

        .msr-stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .msr-stat-purple {
          background: #f3e5f5;
        }

        .msr-stat-green {
          background: #e8f5e9;
        }

        .msr-stat-orange {
          background: #fff3e0;
        }

        .msr-stat-blue {
          background: #e3f2fd;
        }

        .msr-stat-content {
          min-width: 0;
        }

        .msr-stat-number {
          display: block;
          font-size: 24px;
          line-height: 1;
          font-weight: 800;
          margin-bottom: 5px;
          color: #222;
        }

        .msr-stat-label {
          font-size: 12px;
          color: #777;
        }

        /* FORM */

        .msr-news-form-card {
          background: white;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 22px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .msr-form-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 15px;
        }

        .msr-form-heading h2 {
          margin: 0;
          font-size: 21px;
          color: #333;
        }

        .msr-close-button {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 8px;
          background: #f1f1f1;
          cursor: pointer;
          font-size: 20px;
          color: #555;
        }

        .msr-close-button:hover {
          background: #e5e5e5;
        }

        .msr-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .msr-form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .msr-form-full {
          grid-column: 1 / -1;
        }

        .msr-form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #444;
        }

        .msr-form-group input,
        .msr-form-group select,
        .msr-form-group textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d7d7d7;
          border-radius: 8px;
          padding: 11px 12px;
          outline: none;
          font-size: 14px;
          background: white;
          color: #222;
          transition: border 0.2s ease;
        }

        .msr-form-group input:focus,
        .msr-form-group select:focus,
        .msr-form-group textarea:focus {
          border-color: #6a1b9a;
          box-shadow: 0 0 0 2px rgba(106, 27, 154, 0.08);
        }

        .msr-form-group textarea {
          resize: vertical;
          min-height: 130px;
          font-family: inherit;
          line-height: 1.6;
        }

        .msr-content-textarea {
          min-height: 260px !important;
        }

        .msr-image-upload {
          border: 2px dashed #d2d2d2;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          background: #fafafa;
        }

        .msr-image-upload:hover {
          border-color: #6a1b9a;
        }

        .msr-upload-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #6a1b9a;
          color: white;
          border-radius: 7px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
        }

        .msr-upload-label:hover {
          background: #55157b;
        }

        .msr-upload-input {
          display: none;
        }

        .msr-image-help {
          margin: 10px 0 0;
          font-size: 12px;
          color: #777;
        }

        .msr-image-preview {
          margin-top: 16px;
          position: relative;
          max-width: 450px;
          margin-left: auto;
          margin-right: auto;
        }

        .msr-image-preview img {
          display: block;
          width: 100%;
          max-height: 260px;
          object-fit: cover;
          border-radius: 9px;
          border: 1px solid #ddd;
        }

        .msr-remove-image {
          position: absolute;
          top: 8px;
          right: 8px;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #c62828;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }

        .msr-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #eee;
        }

        .msr-secondary-button,
        .msr-primary-button {
          border: none;
          padding: 11px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .msr-secondary-button {
          background: #eeeeee;
          color: #444;
        }

        .msr-secondary-button:hover {
          background: #e1e1e1;
        }

        .msr-primary-button {
          background: #6a1b9a;
          color: white;
        }

        .msr-primary-button:hover {
          background: #55157b;
        }

        .msr-primary-button:disabled,
        .msr-secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* FILTER */

        .msr-filter-card {
          background: white;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 18px;
          display: grid;
          grid-template-columns: 1fr 190px 170px;
          gap: 12px;
        }

        .msr-search-wrapper {
          position: relative;
        }

        .msr-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          font-size: 15px;
        }

        .msr-search-input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d7d7d7;
          border-radius: 8px;
          padding: 11px 12px 11px 38px;
          outline: none;
          font-size: 13px;
        }

        .msr-search-input:focus {
          border-color: #6a1b9a;
        }

        .msr-filter-select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d7d7d7;
          border-radius: 8px;
          padding: 11px 12px;
          background: white;
          outline: none;
          font-size: 13px;
        }

        /* NEWS LIST */

        .msr-news-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .msr-news-card {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .msr-news-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        .msr-news-image {
          height: 190px;
          background: #eeeeee;
          position: relative;
          overflow: hidden;
        }

        .msr-news-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .msr-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #999;
          font-size: 13px;
        }

        .msr-no-image-icon {
          font-size: 36px;
          opacity: 0.6;
        }

        .msr-status-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .msr-status-published {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .msr-status-draft {
          background: #fff3e0;
          color: #ef6c00;
        }

        .msr-news-body {
          padding: 17px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .msr-news-meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 9px;
          font-size: 11px;
          color: #777;
        }

        .msr-category {
          color: #6a1b9a;
          font-weight: 800;
        }

        .msr-news-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
          line-height: 1.35;
          color: #252525;
        }

        .msr-news-excerpt {
          margin: 0;
          color: #666;
          font-size: 13px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .msr-news-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 16px;
        }

        .msr-action-button {
          border: none;
          border-radius: 6px;
          padding: 8px 5px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
          background: #f2f2f2;
          color: #444;
          transition: 0.2s ease;
        }

        .msr-action-button:hover {
          background: #e5e5e5;
        }

        .msr-action-preview {
          color: #1565c0;
          background: #e3f2fd;
        }

        .msr-action-edit {
          color: #6a1b9a;
          background: #f3e5f5;
        }

        .msr-action-publish {
          color: #2e7d32;
          background: #e8f5e9;
        }

        .msr-action-delete {
          color: #c62828;
          background: #ffebee;
        }

        /* EMPTY */

        .msr-empty-state {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 55px 20px;
          text-align: center;
          grid-column: 1 / -1;
        }

        .msr-empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .msr-empty-state h3 {
          margin: 0 0 7px;
          font-size: 18px;
          color: #333;
        }

        .msr-empty-state p {
          margin: 0;
          font-size: 13px;
          color: #777;
        }

        /* LOADING */

        .msr-loading {
          background: white;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 55px;
          text-align: center;
          color: #777;
          font-size: 14px;
        }

        .msr-spinner {
          width: 34px;
          height: 34px;
          border: 3px solid #eee;
          border-top-color: #6a1b9a;
          border-radius: 50%;
          animation: msrSpin 0.8s linear infinite;
          margin: 0 auto 14px;
        }

        @keyframes msrSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* MODAL */

        .msr-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .msr-preview-modal {
          width: 100%;
          max-width: 850px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .msr-preview-header {
          position: sticky;
          top: 0;
          z-index: 2;
          background: white;
          border-bottom: 1px solid #eee;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .msr-preview-header h2 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .msr-preview-content {
          padding: 24px;
        }

        .msr-preview-image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .msr-preview-category {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          background: #f3e5f5;
          color: #6a1b9a;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .msr-preview-content h1 {
          margin: 0 0 10px;
          font-size: 30px;
          line-height: 1.25;
          color: #222;
        }

        .msr-preview-date {
          margin: 0 0 20px;
          color: #888;
          font-size: 12px;
        }

        .msr-preview-excerpt {
          padding: 14px 16px;
          background: #f8f8f8;
          border-left: 4px solid #6a1b9a;
          margin-bottom: 22px;
          color: #555;
          font-size: 14px;
          line-height: 1.6;
        }

        .msr-preview-article {
          color: #444;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-wrap;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .msr-news-list {
            grid-template-columns: repeat(2, 1fr);
          }

          .msr-news-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .msr-news-page {
            padding: 16px;
          }

          .msr-news-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .msr-add-button {
            width: 100%;
          }

          .msr-filter-card {
            grid-template-columns: 1fr;
          }

          .msr-form-grid {
            grid-template-columns: 1fr;
          }

          .msr-form-full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .msr-news-stats {
            grid-template-columns: 1fr;
          }

          .msr-news-list {
            grid-template-columns: 1fr;
          }

          .msr-news-title-area h1 {
            font-size: 25px;
          }

          .msr-news-form-card {
            padding: 16px;
          }

          .msr-form-actions {
            flex-direction: column;
          }

          .msr-form-actions button {
            width: 100%;
          }

          .msr-preview-content {
            padding: 17px;
          }

          .msr-preview-content h1 {
            font-size: 23px;
          }
        }
      `}</style>

      <div className="msr-news-page">
        <div className="msr-news-container">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="msr-news-header">
            <div className="msr-news-title-area">
              <h1>📰 News Management</h1>

              <p>
                Create, upload, edit and manage MyScout Rwanda
                news articles.
              </p>
            </div>

            <button
              type="button"
              className="msr-add-button"
              onClick={openCreateForm}
            >
              <span>＋</span>
              Add News
            </button>
          </div>

          {/* ==================================================
              ALERTS
          ================================================== */}

          {error && (
            <div className="msr-alert msr-alert-error">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="msr-alert msr-alert-success">
              ✓ {success}
            </div>
          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="msr-news-stats">

            <div className="msr-stat-card">
              <div className="msr-stat-icon msr-stat-purple">
                📰
              </div>

              <div className="msr-stat-content">
                <span className="msr-stat-number">
                  {totalNews}
                </span>

                <span className="msr-stat-label">
                  Total News
                </span>
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-icon msr-stat-green">
                ✓
              </div>

              <div className="msr-stat-content">
                <span className="msr-stat-number">
                  {publishedNews}
                </span>

                <span className="msr-stat-label">
                  Published
                </span>
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-icon msr-stat-orange">
                📝
              </div>

              <div className="msr-stat-content">
                <span className="msr-stat-number">
                  {draftNews}
                </span>

                <span className="msr-stat-label">
                  Drafts
                </span>
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-icon msr-stat-blue">
                🗂️
              </div>

              <div className="msr-stat-content">
                <span className="msr-stat-number">
                  {categoryCount}
                </span>

                <span className="msr-stat-label">
                  Categories
                </span>
              </div>
            </div>

          </div>

          {/* ==================================================
              CREATE / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="msr-news-form-card">

              <div className="msr-form-heading">
                <h2>
                  {editingNews
                    ? "✏️ Edit News"
                    : "➕ Create News"}
                </h2>

                <button
                  type="button"
                  className="msr-close-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>

                <div className="msr-form-grid">

                  {/* TITLE */}

                  <div className="msr-form-group msr-form-full">
                    <label htmlFor="news-title">
                      News Title *
                    </label>

                    <input
                      id="news-title"
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Enter news title"
                      maxLength={250}
                      required
                    />
                  </div>

                  {/* CATEGORY */}

                  <div className="msr-form-group">
                    <label htmlFor="news-category">
                      Category *
                    </label>

                    <select
                      id="news-category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      {CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* STATUS */}

                  <div className="msr-form-group">
                    <label htmlFor="news-status">
                      Status *
                    </label>

                    <select
                      id="news-status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>
                    </select>
                  </div>

                  {/* EXCERPT */}

                  <div className="msr-form-group msr-form-full">
                    <label htmlFor="news-excerpt">
                      Short Description
                    </label>

                    <textarea
                      id="news-excerpt"
                      name="excerpt"
                      value={form.excerpt}
                      onChange={handleChange}
                      placeholder="Write a short description of the news..."
                      maxLength={500}
                      style={{ minHeight: "100px" }}
                    />

                    <small
                      style={{
                        color: "#888",
                        fontSize: "11px",
                      }}
                    >
                      {form.excerpt.length}/500
                    </small>
                  </div>

                  {/* CONTENT */}

                  <div className="msr-form-group msr-form-full">
                    <label htmlFor="news-content">
                      News Content *
                    </label>

                    <textarea
                      id="news-content"
                      name="content"
                      className="msr-content-textarea"
                      value={form.content}
                      onChange={handleChange}
                      placeholder="Write the complete news article here..."
                      required
                    />
                  </div>

                  {/* IMAGE */}

                  <div className="msr-form-group msr-form-full">

                    <label>
                      Featured Image
                    </label>

                    <div className="msr-image-upload">

                      <label
                        htmlFor="news-image"
                        className="msr-upload-label"
                      >
                        📷 Choose Image
                      </label>

                      <input
                        ref={fileInputRef}
                        id="news-image"
                        className="msr-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />

                      <p className="msr-image-help">
                        JPG, JPEG, PNG or WEBP.
                        Maximum size: 5MB.
                      </p>

                      {imagePreview && (
                        <div className="msr-image-preview">

                          <img
                            src={imagePreview}
                            alt="News preview"
                          />

                          <button
                            type="button"
                            className="msr-remove-image"
                            onClick={removeImage}
                            title="Remove image"
                          >
                            ×
                          </button>

                        </div>
                      )}

                    </div>
                  </div>

                </div>

                {/* FORM BUTTONS */}

                <div className="msr-form-actions">

                  <button
                    type="button"
                    className="msr-secondary-button"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="msr-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingNews
                      ? "💾 Update News"
                      : "📤 Save News"}
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="msr-filter-card">

            <div className="msr-search-wrapper">

              <span className="msr-search-icon">
                🔍
              </span>

              <input
                className="msr-search-input"
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search news..."
              />

            </div>

            <select
              className="msr-filter-select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="all">
                All Categories
              </option>

              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              className="msr-filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>

          </div>

          {/* ==================================================
              NEWS LIST
          ================================================== */}

          {loading ? (
            <div className="msr-loading">
              <div className="msr-spinner"></div>
              Loading news...
            </div>
          ) : (
            <div className="msr-news-list">

              {filteredNews.length === 0 ? (
                <div className="msr-empty-state">

                  <div className="msr-empty-icon">
                    📰
                  </div>

                  <h3>
                    No news found
                  </h3>

                  <p>
                    {news.length === 0
                      ? "You have not created any news yet."
                      : "Try changing your search or filters."}
                  </p>

                </div>
              ) : (
                filteredNews.map((item) => {

                  const id = getNewsId(item);

                  const image =
                    getNewsImage(item);

                  const status =
                    getNewsStatus(item);

                  const category =
                    item?.category || "General";

                  return (
                    <article
                      className="msr-news-card"
                      key={id}
                    >

                      {/* IMAGE */}

                      <div className="msr-news-image">

                        {image ? (
                          <img
                            src={getImageUrl(image)}
                            alt={item?.title || "News"}
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="msr-no-image">

                            <span className="msr-no-image-icon">
                              📰
                            </span>

                            No image
                          </div>
                        )}

                        <span
                          className={`msr-status-badge ${
                            status === "published"
                              ? "msr-status-published"
                              : "msr-status-draft"
                          }`}
                        >
                          {status}
                        </span>

                      </div>

                      {/* BODY */}

                      <div className="msr-news-body">

                        <div className="msr-news-meta">

                          <span className="msr-category">
                            {category}
                          </span>

                          <span>
                            {formatDate(
                              getNewsDate(item)
                            )}
                          </span>

                        </div>

                        <h3>
                          {item?.title ||
                            "Untitled News"}
                        </h3>

                        <p className="msr-news-excerpt">
                          {getNewsExcerpt(item) ||
                            "No short description available."}
                        </p>

                        {/* ACTIONS */}

                        <div className="msr-news-actions">

                          <button
                            type="button"
                            className="msr-action-button msr-action-preview"
                            onClick={() =>
                              openPreview(item)
                            }
                          >
                            👁 View
                          </button>

                          <button
                            type="button"
                            className="msr-action-button msr-action-edit"
                            onClick={() =>
                              openEditForm(item)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="msr-action-button msr-action-publish"
                            onClick={() =>
                              toggleStatus(item)
                            }
                          >
                            {status === "published"
                              ? "📝 Draft"
                              : "✓ Publish"}
                          </button>

                          <button
                            type="button"
                            className="msr-action-button msr-action-delete"
                            onClick={() =>
                              handleDelete(item)
                            }
                          >
                            🗑 Delete
                          </button>

                        </div>

                      </div>

                    </article>
                  );
                })
              )}

            </div>
          )}

        </div>
      </div>

      {/* ======================================================
          PREVIEW MODAL
      ====================================================== */}

      {showPreview && previewNews && (
        <div
          className="msr-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePreview();
            }
          }}
        >

          <div className="msr-preview-modal">

            <div className="msr-preview-header">

              <h2>
                News Preview
              </h2>

              <button
                type="button"
                className="msr-close-button"
                onClick={closePreview}
              >
                ×
              </button>

            </div>

            <div className="msr-preview-content">

              {getNewsImage(previewNews) && (
                <img
                  className="msr-preview-image"
                  src={getImageUrl(
                    getNewsImage(previewNews)
                  )}
                  alt={
                    previewNews?.title ||
                    "News"
                  }
                />
              )}

              <span className="msr-preview-category">
                {previewNews?.category ||
                  "General"}
              </span>

              <h1>
                {previewNews?.title ||
                  "Untitled News"}
              </h1>

              <p className="msr-preview-date">
                {formatDate(
                  getNewsDate(previewNews)
                )}{" "}
                •{" "}
                {getNewsStatus(previewNews)}
              </p>

              {getNewsExcerpt(previewNews) && (
                <div className="msr-preview-excerpt">
                  {getNewsExcerpt(previewNews)}
                </div>
              )}

              <div className="msr-preview-article">
                {previewNews?.content ||
                  previewNews?.body ||
                  "No content available."}
              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default NewsManagement;