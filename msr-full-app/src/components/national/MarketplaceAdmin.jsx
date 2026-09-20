// src/components/national/MarketplaceAdmin.jsx

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:5000/api';

const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const SCOUT = {
  purple: '#6A1B9A',
  dark: '#4A148C',
  blue: '#002B5C',
  gold: '#FFD100',
  border: '#e5e7eb',
  text: '#1f2937',
  muted: '#6b7280',
  background: '#f7f8fc',
};

const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('authToken') ||
  '';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  seller_name: '',
  seller_phone: '',
  seller_email: '',
  location: '',
  status: 'active',
};

const getMediaUrl = (value) => {
  if (!value) return '';

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  let path = value;

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (path.startsWith('/api/uploads/')) {
    path = path.replace('/api/uploads/', '/uploads/');
  }

  return `${BASE_URL}${path}`;
};

const MarketplaceAdmin = () => {
  const [activeSection, setActiveSection] = useState('products');

  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [productImage, setProductImage] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const [stats, setStats] = useState({
    products: 0,
    activeProducts: 0,
    messages: 0,
    unreadMessages: 0,
  });

  const loadProducts = async () => {
    setLoadingProducts(true);
    setError('');

    try {
      const response = await api.get('/admin/products');

      const data =
        response.data?.products ||
        response.data?.data ||
        response.data ||
        [];

      setProducts(Array.isArray(data) ? data : []);

      const list = Array.isArray(data) ? data : [];

      setStats((previous) => ({
        ...previous,
        products: list.length,
        activeProducts: list.filter(
          (item) =>
            item.status === 'active' ||
            item.is_active === true ||
            item.isActive === true
        ).length,
      }));
    } catch (err) {
      console.error('Load products error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load marketplace products.'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/public/marketplace/categories');

      const data =
        response.data?.categories ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Load categories error:', err);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);

    try {
      const response = await api.get('/admin/messages');

      const data =
        response.data?.messages ||
        response.data?.data ||
        response.data ||
        [];

      const list = Array.isArray(data) ? data : [];

      setMessages(list);

      setStats((previous) => ({
        ...previous,
        messages: list.length,
        unreadMessages: list.filter(
          (item) =>
            item.is_read === false ||
            item.isRead === false ||
            item.read === false
        ).length,
      }));
    } catch (err) {
      console.error('Load messages error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load marketplace messages.'
      );
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadMessages();
  }, []);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        String(product.name || '')
          .toLowerCase()
          .includes(term) ||
        String(product.description || '')
          .toLowerCase()
          .includes(term) ||
        String(product.category || '')
          .toLowerCase()
          .includes(term) ||
        String(product.seller_name || product.sellerName || '')
          .toLowerCase()
          .includes(term);

      const productCategory =
        product.category ||
        product.category_name ||
        product.categoryName ||
        '';

      const matchesCategory =
        !categoryFilter ||
        String(productCategory).toLowerCase() ===
          String(categoryFilter).toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductImage(null);
    setProductImagePreview('');
    setError('');
    setSuccess('');
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category:
        product.category ||
        product.category_name ||
        product.categoryName ||
        '',
      stock: product.stock ?? product.quantity ?? '',
      seller_name:
        product.seller_name ||
        product.sellerName ||
        '',
      seller_phone:
        product.seller_phone ||
        product.sellerPhone ||
        '',
      seller_email:
        product.seller_email ||
        product.sellerEmail ||
        '',
      location: product.location || '',
      status: product.status || 'active',
    });

    setProductImage(null);

    const existingImage =
      product.image_url ||
      product.imageUrl ||
      product.image ||
      product.photo ||
      product.product_image ||
      '';

    setProductImagePreview(getMediaUrl(existingImage));

    setError('');
    setSuccess('');
    setShowProductModal(true);
  };

  const closeProductPanel = () => {
    if (savingProduct) return;

    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductImage(null);
    setProductImagePreview('');
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProductImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProductImagePreview(previewUrl);
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!productForm.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!productForm.price && productForm.price !== 0) {
      setError('Product price is required.');
      return;
    }

    setSavingProduct(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        category: productForm.category.trim(),
        stock:
          productForm.stock === ''
            ? 0
            : Number(productForm.stock),
        seller_name: productForm.seller_name.trim(),
        seller_phone: productForm.seller_phone.trim(),
        seller_email: productForm.seller_email.trim(),
        location: productForm.location.trim(),
        status: productForm.status,
      };

      let productId;

      if (editingProduct) {
        const response = await api.put(
          `/admin/products/${editingProduct.id}`,
          payload
        );

        const updated =
          response.data?.product ||
          response.data?.data ||
          response.data;

        productId = updated?.id || editingProduct.id;

        setSuccess('Product updated successfully.');
      } else {
        const response = await api.post(
          '/admin/products',
          payload
        );

        const created =
          response.data?.product ||
          response.data?.data ||
          response.data;

        productId = created?.id;

        setSuccess('Product created successfully.');
      }

      if (productImage && productId) {
        const formData = new FormData();

        formData.append('image', productImage);

        await api.post(
          `/admin/products/${productId}/image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      await loadProducts();

      setTimeout(() => {
        closeProductPanel();
      }, 500);
    } catch (err) {
      console.error('Save product error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to save product.'
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!product?.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await api.delete(`/admin/products/${product.id}`);

      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id
        )
      );

      setSuccess('Product deleted successfully.');
    } catch (err) {
      console.error('Delete product error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete product.'
      );
    }
  };

  const markMessageRead = async (message) => {
    if (!message?.id) return;

    try {
      await api.put(`/admin/messages/${message.id}/read`);

      setMessages((previous) =>
        previous.map((item) =>
          item.id === message.id
            ? {
                ...item,
                is_read: true,
                isRead: true,
                read: true,
              }
            : item
        )
      );

      setStats((previous) => ({
        ...previous,
        unreadMessages: Math.max(
          0,
          previous.unreadMessages - 1
        ),
      }));
    } catch (err) {
      console.error('Mark message read error:', err);
    }
  };

  const markMessageReplied = async (message) => {
    if (!message?.id) return;

    try {
      await api.put(
        `/admin/messages/${message.id}/replied`
      );

      setMessages((previous) =>
        previous.map((item) =>
          item.id === message.id
            ? {
                ...item,
                replied: true,
                is_replied: true,
              }
            : item
        )
      );
    } catch (err) {
      console.error('Mark message replied error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to update message.'
      );
    }
  };

  const deleteMessage = async (message) => {
    if (!message?.id) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this message?'
    );

    if (!confirmed) return;

    setDeletingMessage(true);
    setError('');
    setSuccess('');

    try {
      await api.delete(`/admin/messages/${message.id}`);

      setMessages((previous) =>
        previous.filter(
          (item) => item.id !== message.id
        )
      );

      setSelectedMessage(null);

      setStats((previous) => ({
        ...previous,
        messages: Math.max(
          0,
          previous.messages - 1
        ),
        unreadMessages:
          message.is_read === false ||
          message.isRead === false ||
          message.read === false
            ? Math.max(
                0,
                previous.unreadMessages - 1
              )
            : previous.unreadMessages,
      }));

      setSuccess('Message deleted successfully.');
    } catch (err) {
      console.error('Delete message error:', err);

      setError(
        err.response?.data?.message ||
          'Failed to delete message.'
      );
    } finally {
      setDeletingMessage(false);
    }
  };

  const viewMessage = async (message) => {
    setSelectedMessage(message);

    if (
      message.is_read === false ||
      message.isRead === false ||
      message.read === false
    ) {
      await markMessageRead(message);
    }
  };

  const formatPrice = (price) => {
    const number = Number(price);

    if (Number.isNaN(number)) {
      return price || '0';
    }

    return new Intl.NumberFormat('en-RW', {
      maximumFractionDigits: 0,
    }).format(number);
  };

  const getProductImage = (product) => {
    return getMediaUrl(
      product.image_url ||
        product.imageUrl ||
        product.image ||
        product.photo ||
        product.product_image ||
        ''
    );
  };

  return (
    <>
      <style>{`
        .msr-marketplace {
          min-height: 100vh;
          background: ${SCOUT.background};
          color: ${SCOUT.text};
        }

        /*
         * IMPORTANT:
         * The common dashboard Sidebar is outside this component.
         * This component therefore never changes its position.
         */

        .msr-marketplace-inner {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          box-sizing: border-box;
        }

        .msr-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 22px;
        }

        .msr-page-title {
          margin: 0;
          color: ${SCOUT.dark};
          font-size: 28px;
          font-weight: 800;
        }

        .msr-page-subtitle {
          margin: 7px 0 0;
          color: ${SCOUT.muted};
          font-size: 14px;
        }

        .msr-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .msr-stat-card {
          background: #fff;
          border: 1px solid ${SCOUT.border};
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 4px 14px rgba(0,0,0,.04);
        }

        .msr-stat-label {
          color: ${SCOUT.muted};
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .04em;
        }

        .msr-stat-value {
          margin-top: 7px;
          color: ${SCOUT.dark};
          font-size: 25px;
          font-weight: 800;
        }

        .msr-management {
          background: #fff;
          border: 1px solid ${SCOUT.border};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 5px 18px rgba(0,0,0,.04);
        }

        .msr-management-tabs {
          display: flex;
          gap: 3px;
          padding: 8px;
          border-bottom: 1px solid ${SCOUT.border};
          background: #fafafa;
        }

        .msr-tab {
          border: 0;
          background: transparent;
          color: ${SCOUT.muted};
          padding: 11px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        .msr-tab:hover {
          background: #f0ebf5;
          color: ${SCOUT.dark};
        }

        .msr-tab.active {
          background: ${SCOUT.purple};
          color: #fff;
        }

        .msr-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 18px;
          border-bottom: 1px solid ${SCOUT.border};
        }

        .msr-toolbar-left {
          display: flex;
          gap: 10px;
          flex: 1;
        }

        .msr-input,
        .msr-select,
        .msr-textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d9dde5;
          border-radius: 9px;
          padding: 11px 12px;
          background: #fff;
          color: ${SCOUT.text};
          font-size: 14px;
          outline: none;
        }

        .msr-input:focus,
        .msr-select:focus,
        .msr-textarea:focus {
          border-color: ${SCOUT.purple};
          box-shadow: 0 0 0 3px rgba(106,27,154,.08);
        }

        .msr-button {
          border: 0;
          border-radius: 9px;
          padding: 11px 17px;
          cursor: pointer;
          font-weight: 800;
          white-space: nowrap;
        }

        .msr-button-purple {
          background: ${SCOUT.purple};
          color: #fff;
        }

        .msr-button-purple:hover {
          background: ${SCOUT.dark};
        }

        .msr-button-gold {
          background: ${SCOUT.gold};
          color: #251900;
        }

        .msr-button-secondary {
          background: #f0f1f4;
          color: #374151;
        }

        .msr-button-danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .msr-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .msr-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .msr-table th {
          background: #fafafa;
          color: ${SCOUT.muted};
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .03em;
          padding: 13px 15px;
          text-align: left;
          border-bottom: 1px solid ${SCOUT.border};
        }

        .msr-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #edf0f4;
          vertical-align: middle;
          font-size: 14px;
        }

        .msr-table tr:hover td {
          background: #fcfcfd;
        }

        .msr-product-cell {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .msr-product-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 9px;
          border: 1px solid ${SCOUT.border};
          background: #f3f4f6;
          flex-shrink: 0;
        }

        .msr-product-image-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 9px;
          background: #f1eafa;
          color: ${SCOUT.purple};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .msr-product-name {
          font-weight: 800;
          color: ${SCOUT.dark};
        }

        .msr-product-description {
          margin-top: 3px;
          max-width: 300px;
          color: ${SCOUT.muted};
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msr-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 800;
        }

        .msr-badge-active {
          background: #dcfce7;
          color: #166534;
        }

        .msr-badge-inactive {
          background: #f3f4f6;
          color: #4b5563;
        }

        .msr-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .msr-icon-button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .msr-icon-edit {
          background: #ede9fe;
        }

        .msr-icon-delete {
          background: #fee2e2;
        }

        .msr-icon-view {
          background: #e0f2fe;
        }

        .msr-empty {
          padding: 55px 20px;
          text-align: center;
          color: ${SCOUT.muted};
        }

        .msr-alert {
          margin-bottom: 16px;
          padding: 12px 15px;
          border-radius: 9px;
          font-size: 14px;
          font-weight: 600;
        }

        .msr-alert-success {
          background: #dcfce7;
          color: #166534;
        }

        .msr-alert-error {
          background: #fee2e2;
          color: #991b1b;
        }

        /*
         * PRODUCT PANEL
         *
         * The panel is positioned relative to the Marketplace content,
         * NOT over the common dashboard sidebar.
         */
        .msr-product-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;

          /*
           * Leave the common dashboard sidebar visible.
           * The sidebar normally occupies about 250px.
           */
          left: 250px;

          background: rgba(0,0,0,.32);
          z-index: 900;

          display: flex;
          justify-content: flex-start;
          align-items: stretch;
        }

        .msr-product-panel {
          width: min(760px, 100%);
          height: 100%;
          background: #fff;
          overflow-y: auto;
          box-shadow: 8px 0 30px rgba(0,0,0,.18);
          animation: msrProductPanelIn .22s ease-out;
          display: flex;
          flex-direction: column;
        }

        @keyframes msrProductPanelIn {
          from {
            transform: translateX(-35px);
            opacity: .7;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .msr-product-panel-header {
          position: sticky;
          top: 0;
          z-index: 5;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 18px 22px;
          background: #fff;
          border-bottom: 1px solid ${SCOUT.border};
        }

        .msr-panel-title {
          margin: 0;
          color: ${SCOUT.dark};
          font-size: 20px;
          font-weight: 800;
        }

        .msr-panel-subtitle {
          margin: 4px 0 0;
          color: ${SCOUT.muted};
          font-size: 12px;
        }

        .msr-close-button {
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 8px;
          background: #f3f4f6;
          color: #374151;
          cursor: pointer;
          font-size: 19px;
        }

        .msr-product-panel-body {
          padding: 22px;
          flex: 1;
        }

        .msr-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .msr-form-group {
          margin-bottom: 15px;
        }

        .msr-form-group.full {
          grid-column: 1 / -1;
        }

        .msr-label {
          display: block;
          margin-bottom: 7px;
          color: #374151;
          font-size: 13px;
          font-weight: 800;
        }

        .msr-required {
          color: #dc2626;
        }

        .msr-textarea {
          min-height: 110px;
          resize: vertical;
        }

        .msr-image-upload {
          border: 2px dashed #d7dbe3;
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          background: #fafafa;
        }

        .msr-image-preview {
          width: 150px;
          height: 150px;
          object-fit: cover;
          border-radius: 10px;
          margin: 0 auto 12px;
          display: block;
          border: 1px solid ${SCOUT.border};
        }

        .msr-file-input {
          width: 100%;
        }

        .msr-product-panel-footer {
          position: sticky;
          bottom: 0;
          z-index: 5;
          padding: 16px 22px;
          border-top: 1px solid ${SCOUT.border};
          background: #fff;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .msr-message-list {
          padding: 0;
        }

        .msr-message-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 16px 18px;
          border-bottom: 1px solid #edf0f4;
        }

        .msr-message-row:hover {
          background: #fafafa;
        }

        .msr-message-main {
          min-width: 0;
          flex: 1;
        }

        .msr-message-name {
          font-weight: 800;
          color: ${SCOUT.dark};
        }

        .msr-message-email {
          margin-top: 3px;
          color: ${SCOUT.muted};
          font-size: 12px;
        }

        .msr-message-preview {
          margin-top: 6px;
          color: #4b5563;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msr-message-actions {
          display: flex;
          gap: 7px;
          flex-shrink: 0;
        }

        .msr-message-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          background: rgba(0,0,0,.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .msr-message-modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
        }

        .msr-message-modal-header {
          padding: 18px 20px;
          border-bottom: 1px solid ${SCOUT.border};
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .msr-message-modal-body {
          padding: 20px;
        }

        .msr-message-field {
          margin-bottom: 16px;
        }

        .msr-message-field-label {
          color: ${SCOUT.muted};
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .msr-message-field-value {
          color: ${SCOUT.text};
          line-height: 1.6;
          word-break: break-word;
        }

        .msr-loading {
          padding: 35px;
          text-align: center;
          color: ${SCOUT.muted};
        }

        @media (max-width: 900px) {
          .msr-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .msr-product-overlay {
            left: 0;
          }

          .msr-product-panel {
            width: min(700px, 94vw);
          }
        }

        @media (max-width: 650px) {
          .msr-marketplace-inner {
            padding: 14px;
          }

          .msr-page-header {
            flex-direction: column;
          }

          .msr-stats {
            grid-template-columns: 1fr;
          }

          .msr-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .msr-toolbar-left {
            flex-direction: column;
          }

          .msr-form-grid {
            grid-template-columns: 1fr;
          }

          .msr-form-group.full {
            grid-column: auto;
          }

          .msr-product-overlay {
            left: 0;
          }

          .msr-product-panel {
            width: 100%;
          }

          .msr-product-panel-body {
            padding: 16px;
          }

          .msr-product-panel-footer {
            padding: 14px 16px;
          }

          .msr-message-row {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="msr-marketplace">
        <div className="msr-marketplace-inner">

          <div className="msr-page-header">
            <div>
              <h1 className="msr-page-title">
                Marketplace Management
              </h1>

              <p className="msr-page-subtitle">
                Manage marketplace products and customer messages.
              </p>
            </div>
          </div>

          {success && (
            <div className="msr-alert msr-alert-success">
              {success}
            </div>
          )}

          {error && (
            <div className="msr-alert msr-alert-error">
              {error}
            </div>
          )}

          <div className="msr-stats">
            <div className="msr-stat-card">
              <div className="msr-stat-label">
                Total Products
              </div>
              <div className="msr-stat-value">
                {stats.products}
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-label">
                Active Products
              </div>
              <div className="msr-stat-value">
                {stats.activeProducts}
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-label">
                Messages
              </div>
              <div className="msr-stat-value">
                {stats.messages}
              </div>
            </div>

            <div className="msr-stat-card">
              <div className="msr-stat-label">
                Unread Messages
              </div>
              <div className="msr-stat-value">
                {stats.unreadMessages}
              </div>
            </div>
          </div>

          <div className="msr-management">

            <div className="msr-management-tabs">
              <button
                type="button"
                className={`msr-tab ${
                  activeSection === 'products'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveSection('products')
                }
              >
                Products
              </button>

              <button
                type="button"
                className={`msr-tab ${
                  activeSection === 'messages'
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setActiveSection('messages')
                }
              >
                Messages
                {stats.unreadMessages > 0 && (
                  <span
                    style={{
                      marginLeft: 7,
                      background: SCOUT.gold,
                      color: '#000',
                      borderRadius: 999,
                      padding: '2px 7px',
                      fontSize: 10,
                    }}
                  >
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            </div>

            {activeSection === 'products' && (
              <>
                <div className="msr-toolbar">
                  <div className="msr-toolbar-left">
                    <input
                      type="search"
                      className="msr-input"
                      placeholder="Search products..."
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                    />

                    <select
                      className="msr-select"
                      value={categoryFilter}
                      onChange={(event) =>
                        setCategoryFilter(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        All Categories
                      </option>

                      {categories.map((category, index) => {
                        const value =
                          typeof category === 'string'
                            ? category
                            : category.name ||
                              category.category ||
                              category.title ||
                              '';

                        return (
                          <option
                            key={
                              category.id ||
                              `${value}-${index}`
                            }
                            value={value}
                          >
                            {value}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {loadingProducts ? (
                  <div className="msr-loading">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="msr-empty">
                    <div
                      style={{
                        fontSize: 35,
                        marginBottom: 10,
                      }}
                    >
                      🛍️
                    </div>

                    <strong>
                      No products found
                    </strong>

                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                      }}
                    >
                      Use the New Product button in the
                      dashboard sidebar to add a product.
                    </div>
                  </div>
                ) : (
                  <div className="msr-table-wrapper">
                    <table className="msr-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredProducts.map(
                          (product) => {
                            const image =
                              getProductImage(product);

                            const status =
                              product.status ||
                              (product.is_active === false
                                ? 'inactive'
                                : 'active');

                            return (
                              <tr
                                key={product.id}
                              >
                                <td>
                                  <div className="msr-product-cell">
                                    {image ? (
                                      <img
                                        src={image}
                                        alt={
                                          product.name ||
                                          'Product'
                                        }
                                        className="msr-product-image"
                                      />
                                    ) : (
                                      <div className="msr-product-image-placeholder">
                                        🛍️
                                      </div>
                                    )}

                                    <div>
                                      <div className="msr-product-name">
                                        {product.name ||
                                          'Unnamed Product'}
                                      </div>

                                      <div className="msr-product-description">
                                        {product.description ||
                                          'No description'}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  {product.category ||
                                    product.category_name ||
                                    '—'}
                                </td>

                                <td>
                                  <strong>
                                    RWF{' '}
                                    {formatPrice(
                                      product.price
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  {product.stock ??
                                    product.quantity ??
                                    0}
                                </td>

                                <td>
                                  <span
                                    className={`msr-badge ${
                                      status ===
                                        'active' ||
                                      status === 'published'
                                        ? 'msr-badge-active'
                                        : 'msr-badge-inactive'
                                    }`}
                                  >
                                    {status}
                                  </span>
                                </td>

                                <td>
                                  <div className="msr-actions">
                                    <button
                                      type="button"
                                      title="Edit product"
                                      className="msr-icon-button msr-icon-edit"
                                      onClick={() =>
                                        openEditProduct(
                                          product
                                        )
                                      }
                                    >
                                      ✏️
                                    </button>

                                    <button
                                      type="button"
                                      title="Delete product"
                                      className="msr-icon-button msr-icon-delete"
                                      onClick={() =>
                                        deleteProduct(
                                          product
                                        )
                                      }
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeSection === 'messages' && (
              <>
                {loadingMessages ? (
                  <div className="msr-loading">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="msr-empty">
                    <div
                      style={{
                        fontSize: 35,
                        marginBottom: 10,
                      }}
                    >
                      💬
                    </div>

                    <strong>
                      No messages found
                    </strong>
                  </div>
                ) : (
                  <div className="msr-message-list">
                    {messages.map((message) => (
                      <div
                        className="msr-message-row"
                        key={message.id}
                      >
                        <div className="msr-message-main">
                          <div className="msr-message-name">
                            {message.name ||
                              message.full_name ||
                              message.sender_name ||
                              'Unknown sender'}
                          </div>

                          <div className="msr-message-email">
                            {message.email ||
                              message.sender_email ||
                              ''}
                          </div>

                          <div className="msr-message-preview">
                            {message.message ||
                              message.content ||
                              message.subject ||
                              'No message'}
                          </div>
                        </div>

                        <div className="msr-message-actions">
                          <button
                            type="button"
                            className="msr-icon-button msr-icon-view"
                            title="View message"
                            onClick={() =>
                              viewMessage(message)
                            }
                          >
                            👁️
                          </button>

                          <button
                            type="button"
                            className="msr-icon-button msr-icon-delete"
                            title="Delete message"
                            onClick={() =>
                              deleteMessage(message)
                            }
                            disabled={deletingMessage}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* =====================================================
            ADD / EDIT PRODUCT PANEL
            =====================================================

            IMPORTANT:
            This panel starts AFTER the common dashboard sidebar
            on desktop. Therefore the common Sidebar.jsx remains
            visible and does not move to the top.
        */}
        {showProductModal && (
          <div
            className="msr-product-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !savingProduct
              ) {
                closeProductPanel();
              }
            }}
          >
            <div className="msr-product-panel">
              <div className="msr-product-panel-header">
                <div>
                  <h2 className="msr-panel-title">
                    {editingProduct
                      ? 'Edit Product'
                      : 'Add New Product'}
                  </h2>

                  <p className="msr-panel-subtitle">
                    {editingProduct
                      ? 'Update the marketplace product information.'
                      : 'Add a new product to the marketplace.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="msr-close-button"
                  onClick={closeProductPanel}
                  disabled={savingProduct}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={saveProduct}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%',
                }}
              >
                <div className="msr-product-panel-body">
                  <div className="msr-form-grid">

                    <div className="msr-form-group full">
                      <label className="msr-label">
                        Product Name{' '}
                        <span className="msr-required">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="msr-input"
                        value={productForm.name}
                        onChange={handleProductChange}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div className="msr-form-group full">
                      <label className="msr-label">
                        Description
                      </label>

                      <textarea
                        name="description"
                        className="msr-textarea"
                        value={productForm.description}
                        onChange={handleProductChange}
                        placeholder="Describe the product..."
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Price (RWF){' '}
                        <span className="msr-required">
                          *
                        </span>
                      </label>

                      <input
                        type="number"
                        name="price"
                        className="msr-input"
                        value={productForm.price}
                        onChange={handleProductChange}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Stock
                      </label>

                      <input
                        type="number"
                        name="stock"
                        className="msr-input"
                        value={productForm.stock}
                        onChange={handleProductChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Category
                      </label>

                      <input
                        type="text"
                        name="category"
                        className="msr-input"
                        value={productForm.category}
                        onChange={handleProductChange}
                        placeholder="e.g. Uniforms"
                        list="marketplace-categories"
                      />

                      <datalist id="marketplace-categories">
                        {categories.map(
                          (category, index) => {
                            const value =
                              typeof category === 'string'
                                ? category
                                : category.name ||
                                  category.category ||
                                  category.title ||
                                  '';

                            return (
                              <option
                                key={`${value}-${index}`}
                                value={value}
                              />
                            );
                          }
                        )}
                      </datalist>
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Status
                      </label>

                      <select
                        name="status"
                        className="msr-select"
                        value={productForm.status}
                        onChange={handleProductChange}
                      >
                        <option value="active">
                          Active
                        </option>

                        <option value="inactive">
                          Inactive
                        </option>
                      </select>
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Seller Name
                      </label>

                      <input
                        type="text"
                        name="seller_name"
                        className="msr-input"
                        value={productForm.seller_name}
                        onChange={handleProductChange}
                        placeholder="Seller name"
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Seller Phone
                      </label>

                      <input
                        type="text"
                        name="seller_phone"
                        className="msr-input"
                        value={productForm.seller_phone}
                        onChange={handleProductChange}
                        placeholder="Phone number"
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Seller Email
                      </label>

                      <input
                        type="email"
                        name="seller_email"
                        className="msr-input"
                        value={productForm.seller_email}
                        onChange={handleProductChange}
                        placeholder="seller@example.com"
                      />
                    </div>

                    <div className="msr-form-group">
                      <label className="msr-label">
                        Location
                      </label>

                      <input
                        type="text"
                        name="location"
                        className="msr-input"
                        value={productForm.location}
                        onChange={handleProductChange}
                        placeholder="Location"
                      />
                    </div>

                    <div className="msr-form-group full">
                      <label className="msr-label">
                        Product Image
                      </label>

                      <div className="msr-image-upload">
                        {productImagePreview && (
                          <img
                            src={productImagePreview}
                            alt="Product preview"
                            className="msr-image-preview"
                          />
                        )}

                        <input
                          type="file"
                          className="msr-file-input"
                          accept="image/*"
                          onChange={handleImageChange}
                        />

                        <div
                          style={{
                            marginTop: 8,
                            color: SCOUT.muted,
                            fontSize: 12,
                          }}
                        >
                          Select a product image.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="msr-product-panel-footer">
                  <button
                    type="button"
                    className="msr-button msr-button-secondary"
                    onClick={closeProductPanel}
                    disabled={savingProduct}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="msr-button msr-button-purple"
                    disabled={savingProduct}
                  >
                    {savingProduct
                      ? 'Saving...'
                      : editingProduct
                      ? 'Update Product'
                      : 'Save Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            MESSAGE VIEW MODAL
            ===================================================== */}
        {selectedMessage && (
          <div
            className="msr-message-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                setSelectedMessage(null);
              }
            }}
          >
            <div className="msr-message-modal">
              <div className="msr-message-modal-header">
                <h2
                  style={{
                    margin: 0,
                    color: SCOUT.dark,
                    fontSize: 19,
                  }}
                >
                  Message Details
                </h2>

                <button
                  type="button"
                  className="msr-close-button"
                  onClick={() =>
                    setSelectedMessage(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="msr-message-modal-body">
                <div className="msr-message-field">
                  <div className="msr-message-field-label">
                    Name
                  </div>

                  <div className="msr-message-field-value">
                    {selectedMessage.name ||
                      selectedMessage.full_name ||
                      selectedMessage.sender_name ||
                      '—'}
                  </div>
                </div>

                <div className="msr-message-field">
                  <div className="msr-message-field-label">
                    Email
                  </div>

                  <div className="msr-message-field-value">
                    {selectedMessage.email ||
                      selectedMessage.sender_email ||
                      '—'}
                  </div>
                </div>

                <div className="msr-message-field">
                  <div className="msr-message-field-label">
                    Phone
                  </div>

                  <div className="msr-message-field-value">
                    {selectedMessage.phone ||
                      selectedMessage.phone_number ||
                      '—'}
                  </div>
                </div>

                <div className="msr-message-field">
                  <div className="msr-message-field-label">
                    Subject
                  </div>

                  <div className="msr-message-field-value">
                    {selectedMessage.subject ||
                      '—'}
                  </div>
                </div>

                <div className="msr-message-field">
                  <div className="msr-message-field-label">
                    Message
                  </div>

                  <div className="msr-message-field-value">
                    {selectedMessage.message ||
                      selectedMessage.content ||
                      '—'}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 9,
                    marginTop: 20,
                  }}
                >
                  <button
                    type="button"
                    className="msr-button msr-button-secondary"
                    onClick={() =>
                      setSelectedMessage(null)
                    }
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="msr-button msr-button-purple"
                    onClick={() =>
                      markMessageReplied(
                        selectedMessage
                      )
                    }
                  >
                    Mark Replied
                  </button>

                  <button
                    type="button"
                    className="msr-button msr-button-danger"
                    onClick={() =>
                      deleteMessage(
                        selectedMessage
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketplaceAdmin;