
// src/components/national/MarketplaceAdmin.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  'http://localhost:5000/api';

// API_URL ends with /api.
// BASE_URL is the backend root and is used for uploaded images/files.
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const SCOUT = {
  purple: '#6A1B9A',
  gold: '#FFD100',
  green: '#2E7D32',
  blue: '#2196F3',
  red: '#D32F2F',
  navy: '#002B5C',
  white: '#FFFFFF',
  background: '#F7F8FA',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  lightPurple: '#F3E5F5',
  lightGreen: '#E8F5E9',
  lightRed: '#FFEBEE',
  lightBlue: '#E3F2FD',
};

const getToken = () => {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    ''
  );
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  price: '',
  category: 'uniform',
  stock: '',
  image_url: '',
  specifications: {
    Size: '',
    Color: '',
    Material: '',
  },
};

const DEFAULT_CATEGORIES = [
  'uniform',
  'badges',
  'camping gear',
  'accessories',
  'books',
  'merchandise',
];

/*
 * Convert product image paths returned by the backend into
 * browser-accessible URLs.
 *
 * Examples:
 *   /uploads/products/photo.jpg
 *      -> https://myscoutrwanda.onrender.com/uploads/products/photo.jpg
 *
 *   uploads/products/photo.jpg
 *      -> https://myscoutrwanda.onrender.com/uploads/products/photo.jpg
 *
 *   http://localhost:5000/uploads/products/photo.jpg
 *      -> https://myscoutrwanda.onrender.com/uploads/products/photo.jpg
 *
 *   https://myscoutrwanda.onrender.com/uploads/products/photo.jpg
 *      -> unchanged
 */
const getMediaUrl = (url) => {
  if (!url) return '';

  const value = String(url).trim();

  if (!value) return '';

  // Data/blob URLs are already browser-ready.
  if (
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  // Convert old localhost backend URLs to the deployed backend.
  if (
    value.startsWith('http://localhost:5000') ||
    value.startsWith('http://127.0.0.1:5000')
  ) {
    const path = value.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1):5000/, '');
    return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  // Already an absolute URL.
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Remove accidental /api prefix from media paths.
  let path = value.replace(/^\/+/, '');

  if (path.startsWith('api/uploads/')) {
    path = path.replace(/^api\//, '');
  }

  if (!path.startsWith('uploads/')) {
    path = `uploads/${path}`;
  }

  return `${BASE_URL}/${path}`;
};

const MarketplaceAdmin = () => {
  const [activeSection, setActiveSection] = useState('products');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductError('');

    try {
      // API_URL already contains /api.
      const response = await api.get('/admin/products');

      const data =
        response.data?.products ||
        response.data?.data ||
        response.data ||
        [];

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load products error:', error);

      setProductError(
        error.response?.data?.message ||
        'Unable to load products.'
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      // API_URL already contains /api.
      const response = await api.get('/public/marketplace/categories');

      const data =
        response.data?.categories ||
        response.data?.data ||
        response.data ||
        [];

      if (Array.isArray(data) && data.length > 0) {
        const normalized = data
          .map((item) => {
            if (typeof item === 'string') return item;

            return item.name || item.category || '';
          })
          .filter(Boolean);

        if (normalized.length > 0) {
          setCategories(normalized);
        }
      }
    } catch (error) {
      console.warn('Categories could not be loaded:', error);
    }
  };

  const loadMessages = async () => {
    setLoadingMessages(true);
    setMessageError('');

    try {
      // API_URL already contains /api.
      const response = await api.get('/admin/messages');

      const data =
        response.data?.messages ||
        response.data?.data ||
        response.data ||
        [];

      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load messages error:', error);

      setMessageError(
        error.response?.data?.message ||
        'Unable to load messages.'
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

  const openAddProduct = () => {
    setEditingProduct(null);

    setProductForm({
      ...EMPTY_PRODUCT,
      specifications: {
        Size: '',
        Color: '',
        Material: '',
      },
    });

    setProductImage(null);
    setImagePreview('');
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);

    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || 'uniform',
      stock: product.stock ?? '',
      image_url: product.image_url || '',
      specifications: {
        Size:
          product.specifications?.Size ||
          product.specifications?.size ||
          '',
        Color:
          product.specifications?.Color ||
          product.specifications?.color ||
          '',
        Material:
          product.specifications?.Material ||
          product.specifications?.material ||
          '',
      },
    });

    setProductImage(null);
    setImagePreview(getMediaUrl(product.image_url || ''));
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    if (savingProduct) return;

    setShowProductModal(false);
    setEditingProduct(null);
    setProductImage(null);
    setImagePreview('');
  };

  const handleProductChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSpecificationChange = (event) => {
    const { name, value } = event.target;

    setProductForm((previous) => ({
      ...previous,
      specifications: {
        ...previous.specifications,
        [name]: value,
      },
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!productForm.name.trim()) {
      alert('Please enter the product name.');
      return;
    }

    if (!productForm.price || Number(productForm.price) < 0) {
      alert('Please enter a valid price.');
      return;
    }

    if (
      productForm.stock === '' ||
      Number(productForm.stock) < 0
    ) {
      alert('Please enter a valid stock quantity.');
      return;
    }

    setSavingProduct(true);

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        category: productForm.category,
        stock: Number(productForm.stock),
        image_url: productForm.image_url || null,
        specifications: productForm.specifications,
      };

      let savedProduct;

      if (editingProduct) {
        const response = await api.put(
          `/admin/products/${editingProduct.id}`,
          payload
        );

        savedProduct =
          response.data?.product ||
          response.data?.data;
      } else {
        const response = await api.post(
          '/admin/products',
          payload
        );

        savedProduct =
          response.data?.product ||
          response.data?.data;
      }

      if (
        productImage &&
        (savedProduct?.id || editingProduct?.id)
      ) {
        const productId =
          savedProduct?.id ||
          editingProduct.id;

        const formData = new FormData();

        formData.append('image', productImage);

        // API_URL already contains /api.
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

      alert(
        editingProduct
          ? 'Product updated successfully.'
          : 'Product uploaded successfully.'
      );

      closeProductModal();
      await loadProducts();
    } catch (error) {
      console.error('Save product error:', error);

      alert(
        error.response?.data?.message ||
        'Unable to save product.'
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      // API_URL already contains /api.
      await api.delete(`/admin/products/${product.id}`);

      setProducts((previous) =>
        previous.filter(
          (item) => item.id !== product.id
        )
      );

      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Delete product error:', error);

      alert(
        error.response?.data?.message ||
        'Unable to delete product.'
      );
    }
  };

  const filteredProducts = useMemo(() => {
    const search = searchProduct.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.description
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        categoryFilter === 'all' ||
        product.category
          ?.toLowerCase() ===
          categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchProduct, categoryFilter]);

  const getStockStatus = (stock) => {
    const quantity = Number(stock || 0);

    if (quantity <= 0) {
      return {
        label: 'Out of Stock',
        className: 'msr-status-out',
      };
    }

    if (quantity < 5) {
      return {
        label: 'Low Stock',
        className: 'msr-status-low',
      };
    }

    return {
      label: 'In Stock',
      className: 'msr-status-in',
    };
  };

  const unreadMessages = messages.filter(
    (message) =>
      String(message.status || '').toLowerCase() === 'new' ||
      String(message.status || '').toLowerCase() === 'unread'
  ).length;

  const filteredMessages = useMemo(() => {
    const search = searchMessage.trim().toLowerCase();

    return messages.filter((message) => {
      const status = String(
        message.status || 'new'
      ).toLowerCase();

      const matchesStatus =
        messageFilter === 'all' ||
        status === messageFilter;

      const searchableText = [
        message.name,
        message.full_name,
        message.email,
        message.subject,
        message.message,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !search ||
        searchableText.includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [messages, searchMessage, messageFilter]);

  const viewMessage = async (message) => {
    setSelectedMessage(message);

    const status = String(
      message.status || ''
    ).toLowerCase();

    if (status === 'new' || status === 'unread') {
      try {
        // API_URL already contains /api.
        await api.put(
          `/admin/messages/${message.id}/read`
        );

        setMessages((previous) =>
          previous.map((item) =>
            item.id === message.id
              ? {
                  ...item,
                  status: 'read',
                }
              : item
          )
        );

        setSelectedMessage((previous) =>
          previous
            ? {
                ...previous,
                status: 'read',
              }
            : previous
        );
      } catch (error) {
        console.warn(
          'Could not mark message as read:',
          error
        );
      }
    }
  };

  const markReplied = async (message) => {
    try {
      // API_URL already contains /api.
      await api.put(
        `/admin/messages/${message.id}/replied`
      );

      setMessages((previous) =>
        previous.map((item) =>
          item.id === message.id
            ? {
                ...item,
                status: 'replied',
              }
            : item
        )
      );

      setSelectedMessage((previous) =>
        previous
          ? {
              ...previous,
              status: 'replied',
            }
          : previous
      );
    } catch (error) {
      console.error(
        'Mark replied error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Unable to update message.'
      );
    }
  };

  const deleteMessage = async (message) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this message?'
      )
    ) {
      return;
    }

    setDeletingMessage(true);

    try {
      // API_URL already contains /api.
      await api.delete(
        `/admin/messages/${message.id}`
      );

      setMessages((previous) =>
        previous.filter(
          (item) => item.id !== message.id
        )
      );

      setSelectedMessage(null);
    } catch (error) {
      console.error(
        'Delete message error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Unable to delete message.'
      );
    } finally {
      setDeletingMessage(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-RW').format(
      Number(price || 0)
    );
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleString('en-RW', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const messageStatusClass = (status) => {
    switch (
      String(status || 'new').toLowerCase()
    ) {
      case 'read':
        return 'msr-message-read';

      case 'replied':
        return 'msr-message-replied';

      case 'archived':
        return 'msr-message-archived';

      case 'new':
      case 'unread':
      default:
        return 'msr-message-new';
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .msr-admin {
          min-height: 100vh;
          display: flex;
          background: ${SCOUT.background};
          color: ${SCOUT.text};
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .msr-admin-sidebar {
          width: 250px;
          min-height: 100vh;
          background: ${SCOUT.navy};
          color: ${SCOUT.white};
          position: sticky;
          top: 0;
          align-self: flex-start;
        }

        .msr-admin-brand {
          height: 76px;
          display: flex;
          align-items: center;
          padding: 0 22px;
          border-bottom: 1px solid rgba(255,255,255,.15);
        }

        .msr-admin-brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: ${SCOUT.gold};
          color: ${SCOUT.navy};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-right: 11px;
          font-weight: 800;
        }

        .msr-admin-brand-text {
          line-height: 1.15;
        }

        .msr-admin-brand-title {
          font-size: 16px;
          font-weight: 800;
        }

        .msr-admin-brand-subtitle {
          font-size: 11px;
          opacity: .7;
          margin-top: 3px;
        }

        .msr-admin-nav {
          padding: 24px 14px;
        }

        .msr-admin-nav-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: .55;
          padding: 0 12px 10px;
        }

        .msr-admin-nav-button {
          width: 100%;
          border: none;
          background: transparent;
          color: rgba(255,255,255,.78);
          padding: 13px 14px;
          margin-bottom: 6px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          transition: .2s ease;
        }

        .msr-admin-nav-button:hover {
          background: rgba(255,255,255,.08);
          color: ${SCOUT.white};
        }

        .msr-admin-nav-button.active {
          background: ${SCOUT.purple};
          color: ${SCOUT.white};
          box-shadow: 0 5px 15px rgba(0,0,0,.15);
        }

        .msr-admin-nav-icon {
          width: 22px;
          text-align: center;
          font-size: 18px;
        }

        .msr-message-count {
          margin-left: auto;
          min-width: 23px;
          height: 23px;
          padding: 0 6px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${SCOUT.red};
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .msr-admin-main {
          flex: 1;
          min-width: 0;
        }

        .msr-admin-header {
          height: 76px;
          background: white;
          border-bottom: 1px solid ${SCOUT.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .msr-admin-header-title {
          font-size: 21px;
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-admin-header-subtitle {
          color: ${SCOUT.muted};
          font-size: 12px;
          margin-top: 3px;
        }

        .msr-admin-user {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 14px;
        }

        .msr-admin-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${SCOUT.lightPurple};
          color: ${SCOUT.purple};
          font-weight: 800;
        }

        .msr-admin-content {
          padding: 30px;
        }

        .msr-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 26px;
        }

        .msr-stat-card {
          background: white;
          border: 1px solid ${SCOUT.border};
          border-radius: 13px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,.03);
        }

        .msr-stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
        }

        .msr-stat-icon.products {
          background: ${SCOUT.lightPurple};
          color: ${SCOUT.purple};
        }

        .msr-stat-icon.low {
          background: #FFF8E1;
          color: #F57F17;
        }

        .msr-stat-icon.messages {
          background: ${SCOUT.lightBlue};
          color: ${SCOUT.blue};
        }

        .msr-stat-label {
          font-size: 12px;
          color: ${SCOUT.muted};
        }

        .msr-stat-number {
          font-size: 25px;
          font-weight: 800;
          color: ${SCOUT.navy};
          margin-top: 3px;
        }

        .msr-toolbar {
          background: white;
          border: 1px solid ${SCOUT.border};
          border-radius: 13px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .msr-search {
          flex: 1;
          min-width: 220px;
          position: relative;
        }

        .msr-search input {
          width: 100%;
          height: 42px;
          border: 1px solid ${SCOUT.border};
          border-radius: 8px;
          padding: 0 14px 0 40px;
          outline: none;
          font-size: 14px;
        }

        .msr-search input:focus {
          border-color: ${SCOUT.purple};
          box-shadow: 0 0 0 3px rgba(106,27,154,.1);
        }

        .msr-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: ${SCOUT.muted};
        }

        .msr-select {
          height: 42px;
          border: 1px solid ${SCOUT.border};
          border-radius: 8px;
          background: white;
          padding: 0 12px;
          color: ${SCOUT.text};
          outline: none;
          min-width: 150px;
        }

        .msr-button {
          border: none;
          border-radius: 8px;
          height: 42px;
          padding: 0 17px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .2s ease;
          white-space: nowrap;
        }

        .msr-button-primary {
          background: ${SCOUT.purple};
          color: white;
        }

        .msr-button-primary:hover {
          background: #4A1370;
        }

        .msr-button-gold {
          background: ${SCOUT.gold};
          color: ${SCOUT.navy};
        }

        .msr-button-secondary {
          background: #F3F4F6;
          color: ${SCOUT.text};
        }

        .msr-button-danger {
          background: ${SCOUT.lightRed};
          color: ${SCOUT.red};
        }

        .msr-button-success {
          background: ${SCOUT.lightGreen};
          color: ${SCOUT.green};
        }

        .msr-table-container {
          background: white;
          border: 1px solid ${SCOUT.border};
          border-radius: 13px;
          overflow: hidden;
        }

        .msr-table-header {
          padding: 19px 20px;
          border-bottom: 1px solid ${SCOUT.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .msr-table-title {
          font-size: 16px;
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-table-count {
          color: ${SCOUT.muted};
          font-size: 12px;
        }

        .msr-table-scroll {
          overflow-x: auto;
        }

        .msr-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
        }

        .msr-table th {
          text-align: left;
          padding: 13px 18px;
          background: #FAFAFA;
          color: ${SCOUT.muted};
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          font-weight: 800;
          border-bottom: 1px solid ${SCOUT.border};
        }

        .msr-table td {
          padding: 14px 18px;
          border-bottom: 1px solid #F0F0F0;
          font-size: 13px;
          vertical-align: middle;
        }

        .msr-table tbody tr:hover {
          background: #FCFCFD;
        }

        .msr-table tbody tr:last-child td {
          border-bottom: none;
        }

        .msr-product-image {
          width: 54px;
          height: 54px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid ${SCOUT.border};
          background: #F3F4F6;
        }

        .msr-product-placeholder {
          width: 54px;
          height: 54px;
          border-radius: 8px;
          background: ${SCOUT.lightPurple};
          color: ${SCOUT.purple};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .msr-product-name {
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-product-description {
          max-width: 250px;
          color: ${SCOUT.muted};
          margin-top: 3px;
          font-size: 11px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msr-category {
          display: inline-block;
          background: ${SCOUT.lightPurple};
          color: ${SCOUT.purple};
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .msr-price {
          font-weight: 800;
          color: ${SCOUT.navy};
          white-space: nowrap;
        }

        .msr-stock-number {
          font-weight: 800;
        }

        .msr-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .msr-status-in {
          background: ${SCOUT.lightGreen};
          color: ${SCOUT.green};
        }

        .msr-status-low {
          background: #FFF8E1;
          color: #E65100;
        }

        .msr-status-out {
          background: ${SCOUT.lightRed};
          color: ${SCOUT.red};
        }

        .msr-action-buttons {
          display: flex;
          gap: 6px;
        }

        .msr-icon-button {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .msr-icon-edit {
          background: ${SCOUT.lightBlue};
          color: ${SCOUT.blue};
        }

        .msr-icon-delete {
          background: ${SCOUT.lightRed};
          color: ${SCOUT.red};
        }

        .msr-empty {
          padding: 55px 20px;
          text-align: center;
          color: ${SCOUT.muted};
        }

        .msr-empty-icon {
          font-size: 42px;
          margin-bottom: 10px;
        }

        .msr-loading {
          padding: 50px;
          text-align: center;
          color: ${SCOUT.muted};
        }

        .msr-error {
          background: ${SCOUT.lightRed};
          border: 1px solid #FFCDD2;
          color: ${SCOUT.red};
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 13px;
        }

        .msr-message-row.unread {
          background: #FFFDF0;
        }

        .msr-message-name {
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-message-email {
          color: ${SCOUT.muted};
          font-size: 11px;
          margin-top: 3px;
        }

        .msr-message-subject {
          font-weight: 700;
          color: ${SCOUT.text};
        }

        .msr-message-preview {
          max-width: 330px;
          color: ${SCOUT.muted};
          font-size: 11px;
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .msr-message-status {
          display: inline-block;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .msr-message-new {
          background: ${SCOUT.lightRed};
          color: ${SCOUT.red};
        }

        .msr-message-read {
          background: ${SCOUT.lightBlue};
          color: ${SCOUT.blue};
        }

        .msr-message-replied {
          background: ${SCOUT.lightGreen};
          color: ${SCOUT.green};
        }

        .msr-message-archived {
          background: #F3F4F6;
          color: ${SCOUT.muted};
        }

        .msr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.58);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .msr-modal {
          width: min(760px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 25px 70px rgba(0,0,0,.3);
        }

        .msr-modal.small {
          width: min(600px, 100%);
        }

        .msr-modal-header {
          padding: 19px 22px;
          border-bottom: 1px solid ${SCOUT.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }

        .msr-modal-title {
          color: ${SCOUT.navy};
          font-size: 18px;
          font-weight: 800;
        }

        .msr-close {
          width: 35px;
          height: 35px;
          border: none;
          background: #F3F4F6;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          color: ${SCOUT.text};
        }

        .msr-modal-body {
          padding: 22px;
        }

        .msr-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .msr-form-group {
          margin-bottom: 2px;
        }

        .msr-form-group.full {
          grid-column: 1 / -1;
        }

        .msr-label {
          display: block;
          font-size: 12px;
          font-weight: 800;
          color: ${SCOUT.navy};
          margin-bottom: 7px;
        }

        .msr-required {
          color: ${SCOUT.red};
        }

        .msr-input,
        .msr-textarea,
        .msr-form-select {
          width: 100%;
          border: 1px solid ${SCOUT.border};
          border-radius: 8px;
          padding: 11px 12px;
          outline: none;
          font-size: 13px;
          color: ${SCOUT.text};
          background: white;
        }

        .msr-input:focus,
        .msr-textarea:focus,
        .msr-form-select:focus {
          border-color: ${SCOUT.purple};
          box-shadow: 0 0 0 3px rgba(106,27,154,.1);
        }

        .msr-textarea {
          min-height: 105px;
          resize: vertical;
        }

        .msr-upload {
          border: 2px dashed ${SCOUT.border};
          border-radius: 10px;
          padding: 18px;
          text-align: center;
          cursor: pointer;
          transition: .2s ease;
        }

        .msr-upload:hover {
          border-color: ${SCOUT.purple};
          background: ${SCOUT.lightPurple};
        }

        .msr-upload input {
          display: none;
        }

        .msr-upload-icon {
          font-size: 30px;
          margin-bottom: 5px;
        }

        .msr-upload-text {
          font-size: 12px;
          font-weight: 700;
          color: ${SCOUT.navy};
        }

        .msr-upload-help {
          font-size: 10px;
          color: ${SCOUT.muted};
          margin-top: 3px;
        }

        .msr-image-preview {
          margin-top: 12px;
          display: flex;
          justify-content: center;
        }

        .msr-image-preview img {
          width: 130px;
          height: 130px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid ${SCOUT.border};
        }

        .msr-specifications {
          border: 1px solid ${SCOUT.border};
          border-radius: 10px;
          padding: 15px;
        }

        .msr-specifications-title {
          font-size: 12px;
          font-weight: 800;
          color: ${SCOUT.navy};
          margin-bottom: 12px;
        }

        .msr-spec-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .msr-modal-footer {
          padding: 17px 22px;
          border-top: 1px solid ${SCOUT.border};
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .msr-message-detail {
          padding: 22px;
        }

        .msr-message-detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding-bottom: 18px;
          border-bottom: 1px solid ${SCOUT.border};
        }

        .msr-message-detail-name {
          font-size: 18px;
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-message-detail-email {
          margin-top: 4px;
          color: ${SCOUT.blue};
          font-size: 13px;
        }

        .msr-message-detail-date {
          color: ${SCOUT.muted};
          font-size: 11px;
          text-align: right;
        }

        .msr-message-detail-subject {
          margin-top: 22px;
          font-size: 16px;
          font-weight: 800;
          color: ${SCOUT.navy};
        }

        .msr-message-detail-body {
          margin-top: 13px;
          background: #FAFAFA;
          border: 1px solid ${SCOUT.border};
          border-radius: 10px;
          padding: 18px;
          line-height: 1.7;
          font-size: 14px;
          white-space: pre-wrap;
        }

        @media (max-width: 900px) {
          .msr-admin-sidebar {
            width: 210px;
          }

          .msr-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .msr-content {
            padding: 20px;
          }

          .msr-form-grid {
            grid-template-columns: 1fr;
          }

          .msr-form-group.full {
            grid-column: auto;
          }

          .msr-spec-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .msr-admin {
            display: block;
          }

          .msr-admin-sidebar {
            width: 100%;
            min-height: auto;
            position: relative;
          }

          .msr-admin-brand {
            height: 65px;
          }

          .msr-admin-nav {
            display: flex;
            padding: 10px;
            gap: 8px;
          }

          .msr-admin-nav-label {
            display: none;
          }

          .msr-admin-nav-button {
            margin: 0;
            justify-content: center;
            padding: 11px;
          }

          .msr-admin-nav-button span:not(.msr-admin-nav-icon):not(.msr-message-count) {
            display: none;
          }

          .msr-message-count {
            position: absolute;
            margin-left: 27px;
            margin-top: -25px;
          }

          .msr-admin-header {
            padding: 0 17px;
            height: 65px;
          }

          .msr-admin-header-title {
            font-size: 17px;
          }

          .msr-admin-user {
            font-size: 12px;
          }

          .msr-admin-content {
            padding: 15px;
          }

          .msr-stat-grid {
            grid-template-columns: 1fr;
          }

          .msr-toolbar {
            align-items: stretch;
          }

          .msr-search {
            min-width: 100%;
          }

          .msr-select,
          .msr-toolbar .msr-button {
            width: 100%;
          }

          .msr-modal-overlay {
            padding: 10px;
          }

          .msr-modal {
            max-height: 96vh;
          }

          .msr-modal-footer {
            flex-direction: column-reverse;
          }

          .msr-modal-footer .msr-button {
            width: 100%;
          }

          .msr-message-detail-header {
            flex-direction: column;
          }

          .msr-message-detail-date {
            text-align: left;
          }
        }
      `}</style>

      <div className="msr-admin">
        <aside className="msr-admin-sidebar">
          <div className="msr-admin-brand">
            <div className="msr-admin-brand-icon">
              MSR
            </div>

            <div className="msr-admin-brand-text">
              <div className="msr-admin-brand-title">
                Marketplace
              </div>

              <div className="msr-admin-brand-subtitle">
                Administration
              </div>
            </div>
          </div>

          <nav className="msr-admin-nav">
            <div className="msr-admin-nav-label">
              Management
            </div>

            <button
              type="button"
              className={`msr-admin-nav-button ${
                activeSection === 'products'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveSection('products')
              }
            >
              <span className="msr-admin-nav-icon">
                🛍️
              </span>

              <span>Products</span>
            </button>

            <button
              type="button"
              className={`msr-admin-nav-button ${
                activeSection === 'messages'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveSection('messages')
              }
            >
              <span className="msr-admin-nav-icon">
                💬
              </span>

              <span>Messages</span>

              {unreadMessages > 0 && (
                <span className="msr-message-count">
                  {unreadMessages}
                </span>
              )}
            </button>
          </nav>
        </aside>

        <main className="msr-admin-main">
          <header className="msr-admin-header">
            <div>
              <div className="msr-admin-header-title">
                {activeSection === 'products'
                  ? 'Marketplace Administration'
                  : 'Public Messages'}
              </div>

              <div className="msr-admin-header-subtitle">
                {activeSection === 'products'
                  ? 'Manage scout products and marketplace inventory'
                  : 'Receive and manage messages from the public website'}
              </div>
            </div>

            <div className="msr-admin-user">
              <div className="msr-admin-user-avatar">
                A
              </div>

              <span>Admin</span>
            </div>
          </header>

          <div className="msr-admin-content">
            {activeSection === 'products' && (
              <>
                <div className="msr-stat-grid">
                  <div className="msr-stat-card">
                    <div className="msr-stat-icon products">
                      🛍️
                    </div>

                    <div>
                      <div className="msr-stat-label">
                        Total Products
                      </div>

                      <div className="msr-stat-number">
                        {products.length}
                      </div>
                    </div>
                  </div>

                  <div className="msr-stat-card">
                    <div className="msr-stat-icon low">
                      ⚠️
                    </div>

                    <div>
                      <div className="msr-stat-label">
                        Low Stock
                      </div>

                      <div className="msr-stat-number">
                        {
                          products.filter(
                            (p) =>
                              Number(p.stock || 0) > 0 &&
                              Number(p.stock || 0) < 5
                          ).length
                        }
                      </div>
                    </div>
                  </div>

                  <div className="msr-stat-card">
                    <div className="msr-stat-icon messages">
                      💬
                    </div>

                    <div>
                      <div className="msr-stat-label">
                        New Messages
                      </div>

                      <div className="msr-stat-number">
                        {unreadMessages}
                      </div>
                    </div>
                  </div>
                </div>

                {productError && (
                  <div className="msr-error">
                    {productError}
                  </div>
                )}

                <div className="msr-toolbar">
                  <div className="msr-search">
                    <span className="msr-search-icon">
                      🔎
                    </span>

                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchProduct}
                      onChange={(e) =>
                        setSearchProduct(e.target.value)
                      }
                    />
                  </div>

                  <select
                    className="msr-select"
                    value={categoryFilter}
                    onChange={(e) =>
                      setCategoryFilter(e.target.value)
                    }
                  >
                    <option value="all">
                      All Categories
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category.charAt(0).toUpperCase() +
                          category.slice(1)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="msr-button msr-button-primary"
                    onClick={openAddProduct}
                  >
                    ＋ Add Product
                  </button>
                </div>

                <div className="msr-table-container">
                  <div className="msr-table-header">
                    <div className="msr-table-title">
                      Products
                    </div>

                    <div className="msr-table-count">
                      {filteredProducts.length} product
                      {filteredProducts.length !== 1
                        ? 's'
                        : ''}
                    </div>
                  </div>

                  {loadingProducts ? (
                    <div className="msr-loading">
                      Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="msr-empty">
                      <div className="msr-empty-icon">
                        🛍️
                      </div>

                      <strong>
                        No products found
                      </strong>

                      <div>
                        Add your first marketplace
                        product.
                      </div>
                    </div>
                  ) : (
                    <div className="msr-table-scroll">
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
                              const stockStatus =
                                getStockStatus(
                                  product.stock
                                );

                              const productImageUrl =
                                getMediaUrl(
                                  product.image_url
                                );

                              return (
                                <tr
                                  key={product.id}
                                >
                                  <td>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems:
                                          'center',
                                        gap: '11px',
                                      }}
                                    >
                                      {productImageUrl ? (
                                        <img
                                          src={
                                            productImageUrl
                                          }
                                          alt={
                                            product.name
                                          }
                                          className="msr-product-image"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="msr-product-placeholder">
                                          📦
                                        </div>
                                      )}

                                      <div>
                                        <div className="msr-product-name">
                                          {
                                            product.name
                                          }
                                        </div>

                                        <div className="msr-product-description">
                                          {product.description ||
                                            'No description'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="msr-category">
                                      {product.category ||
                                        'Uncategorized'}
                                    </span>
                                  </td>

                                  <td>
                                    <span className="msr-price">
                                      RWF{' '}
                                      {formatPrice(
                                        product.price
                                      )}
                                    </span>
                                  </td>

                                  <td>
                                    <span className="msr-stock-number">
                                      {product.stock ??
                                        0}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`msr-status ${stockStatus.className}`}
                                    >
                                      {
                                        stockStatus.label
                                      }
                                    </span>
                                  </td>

                                  <td>
                                    <div className="msr-action-buttons">
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
                </div>
              </>
            )}

            {activeSection === 'messages' && (
              <>
                <div className="msr-toolbar">
                  <div className="msr-search">
                    <span className="msr-search-icon">
                      🔎
                    </span>

                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchMessage}
                      onChange={(e) =>
                        setSearchMessage(e.target.value)
                      }
                    />
                  </div>

                  <select
                    className="msr-select"
                    value={messageFilter}
                    onChange={(e) =>
                      setMessageFilter(e.target.value)
                    }
                  >
                    <option value="all">
                      All Messages
                    </option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">
                      Replied
                    </option>
                    <option value="archived">
                      Archived
                    </option>
                  </select>

                  <button
                    type="button"
                    className="msr-button msr-button-secondary"
                    onClick={loadMessages}
                  >
                    ↻ Refresh
                  </button>
                </div>

                {messageError && (
                  <div className="msr-error">
                    {messageError}
                  </div>
                )}

                <div className="msr-table-container">
                  <div className="msr-table-header">
                    <div className="msr-table-title">
                      Messages From Public
                    </div>

                    <div className="msr-table-count">
                      {filteredMessages.length} message
                      {filteredMessages.length !== 1
                        ? 's'
                        : ''}
                    </div>
                  </div>

                  {loadingMessages ? (
                    <div className="msr-loading">
                      Loading messages...
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="msr-empty">
                      <div className="msr-empty-icon">
                        💬
                      </div>

                      <strong>
                        No messages found
                      </strong>

                      <div>
                        Messages submitted through
                        the public Contact page will
                        appear here.
                      </div>
                    </div>
                  ) : (
                    <div className="msr-table-scroll">
                      <table className="msr-table">
                        <thead>
                          <tr>
                            <th>Sender</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredMessages.map(
                            (message) => {
                              const status =
                                String(
                                  message.status ||
                                    'new'
                                ).toLowerCase();

                              const isUnread =
                                status === 'new' ||
                                status === 'unread';

                              return (
                                <tr
                                  key={message.id}
                                  className={
                                    isUnread
                                      ? 'msr-message-row unread'
                                      : 'msr-message-row'
                                  }
                                >
                                  <td>
                                    <div className="msr-message-name">
                                      {message.name ||
                                        message.full_name ||
                                        'Public User'}
                                    </div>

                                    <div className="msr-message-email">
                                      {message.email ||
                                        'No email'}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="msr-message-subject">
                                      {message.subject ||
                                        'No subject'}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="msr-message-preview">
                                      {message.message ||
                                        'No message content'}
                                    </div>
                                  </td>

                                  <td>
                                    {formatDate(
                                      message.created_at ||
                                        message.createdAt ||
                                        message.date
                                    )}
                                  </td>

                                  <td>
                                    <span
                                      className={`msr-message-status ${messageStatusClass(
                                        status
                                      )}`}
                                    >
                                      {status}
                                    </span>
                                  </td>

                                  <td>
                                    <div className="msr-action-buttons">
                                      <button
                                        type="button"
                                        className="msr-icon-button msr-icon-edit"
                                        title="View message"
                                        onClick={() =>
                                          viewMessage(
                                            message
                                          )
                                        }
                                      >
                                        👁️
                                      </button>

                                      <button
                                        type="button"
                                        className="msr-icon-button msr-icon-delete"
                                        title="Delete message"
                                        onClick={() =>
                                          deleteMessage(
                                            message
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
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showProductModal && (
        <div
          className="msr-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeProductModal();
            }
          }}
        >
          <div className="msr-modal">
            <div className="msr-modal-header">
              <div className="msr-modal-title">
                {editingProduct
                  ? 'Edit Product'
                  : 'Add New Product'}
              </div>

              <button
                type="button"
                className="msr-close"
                onClick={closeProductModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div className="msr-modal-body">
                <div className="msr-form-grid">
                  <div className="msr-form-group full">
                    <label className="msr-label">
                      Product Name{' '}
                      <span className="msr-required">
                        *
                      </span>
                    </label>

                    <input
                      className="msr-input"
                      type="text"
                      name="name"
                      value={productForm.name}
                      onChange={handleProductChange}
                      placeholder="e.g. Scout Uniform"
                      required
                    />
                  </div>

                  <div className="msr-form-group">
                    <label className="msr-label">
                      Category
                    </label>

                    <select
                      className="msr-form-select"
                      name="category"
                      value={productForm.category}
                      onChange={handleProductChange}
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category
                              .charAt(0)
                              .toUpperCase() +
                              category.slice(1)}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="msr-form-group">
                    <label className="msr-label">
                      Price (RWF){' '}
                      <span className="msr-required">
                        *
                      </span>
                    </label>

                    <input
                      className="msr-input"
                      type="number"
                      min="0"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductChange}
                      placeholder="15000"
                      required
                    />
                  </div>

                  <div className="msr-form-group">
                    <label className="msr-label">
                      Stock Quantity{' '}
                      <span className="msr-required">
                        *
                      </span>
                    </label>

                    <input
                      className="msr-input"
                      type="number"
                      min="0"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductChange}
                      placeholder="25"
                      required
                    />
                  </div>

                  <div className="msr-form-group full">
                    <label className="msr-label">
                      Description
                    </label>

                    <textarea
                      className="msr-textarea"
                      name="description"
                      value={productForm.description}
                      onChange={handleProductChange}
                      placeholder="Describe the product..."
                    />
                  </div>

                  <div className="msr-form-group full">
                    <label className="msr-label">
                      Product Image
                    </label>

                    <label className="msr-upload">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />

                      <div className="msr-upload-icon">
                        🖼️
                      </div>

                      <div className="msr-upload-text">
                        Click to choose product image
                      </div>

                      <div className="msr-upload-help">
                        JPG, PNG or WEBP
                      </div>

                      {imagePreview && (
                        <div className="msr-image-preview">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                          />
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="msr-form-group full">
                    <div className="msr-specifications">
                      <div className="msr-specifications-title">
                        Product Specifications
                      </div>

                      <div className="msr-spec-grid">
                        <div>
                          <label className="msr-label">
                            Size
                          </label>

                          <input
                            className="msr-input"
                            type="text"
                            name="Size"
                            value={
                              productForm
                                .specifications
                                .Size
                            }
                            onChange={
                              handleSpecificationChange
                            }
                            placeholder="S, M, L, XL"
                          />
                        </div>

                        <div>
                          <label className="msr-label">
                            Color
                          </label>

                          <input
                            className="msr-input"
                            type="text"
                            name="Color"
                            value={
                              productForm
                                .specifications
                                .Color
                            }
                            onChange={
                              handleSpecificationChange
                            }
                            placeholder="Khaki"
                          />
                        </div>

                        <div>
                          <label className="msr-label">
                            Material
                          </label>

                          <input
                            className="msr-input"
                            type="text"
                            name="Material"
                            value={
                              productForm
                                .specifications
                                .Material
                            }
                            onChange={
                              handleSpecificationChange
                            }
                            placeholder="Cotton"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="msr-modal-footer">
                <button
                  type="button"
                  className="msr-button msr-button-secondary"
                  onClick={closeProductModal}
                  disabled={savingProduct}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="msr-button msr-button-primary"
                  disabled={savingProduct}
                >
                  {savingProduct
                    ? 'Saving...'
                    : editingProduct
                    ? 'Save Changes'
                    : 'Upload Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMessage && (
        <div
          className="msr-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedMessage(null);
            }
          }}
        >
          <div className="msr-modal small">
            <div className="msr-modal-header">
              <div className="msr-modal-title">
                Message Details
              </div>

              <button
                type="button"
                className="msr-close"
                onClick={() =>
                  setSelectedMessage(null)
                }
              >
                ×
              </button>
            </div>

            <div className="msr-message-detail">
              <div className="msr-message-detail-header">
                <div>
                  <div className="msr-message-detail-name">
                    {selectedMessage.name ||
                      selectedMessage.full_name ||
                      'Public User'}
                  </div>

                  <div className="msr-message-detail-email">
                    {selectedMessage.email ||
                      'No email provided'}
                  </div>
                </div>

                <div>
                  <div
                    className={`msr-message-status ${messageStatusClass(
                      selectedMessage.status
                    )}`}
                  >
                    {selectedMessage.status ||
                      'new'}
                  </div>

                  <div className="msr-message-detail-date">
                    {formatDate(
                      selectedMessage.created_at ||
                        selectedMessage.createdAt ||
                        selectedMessage.date
                    )}
                  </div>
                </div>
              </div>

              <div className="msr-message-detail-subject">
                {selectedMessage.subject ||
                  'No subject'}
              </div>

              <div className="msr-message-detail-body">
                {selectedMessage.message ||
                  'No message content.'}
              </div>
            </div>

            <div className="msr-modal-footer">
              <button
                type="button"
                className="msr-button msr-button-danger"
                onClick={() =>
                  deleteMessage(selectedMessage)
                }
                disabled={deletingMessage}
              >
                🗑️ Delete
              </button>

              {selectedMessage.email && (
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject ||
                      'MSR Inquiry'
                  )}`}
                  className="msr-button msr-button-gold"
                  style={{
                    textDecoration: 'none',
                  }}
                  onClick={() =>
                    markReplied(selectedMessage)
                  }
                >
                  ✉️ Reply
                </a>
              )}

              <button
                type="button"
                className="msr-button msr-button-success"
                onClick={() =>
                  markReplied(selectedMessage)
                }
              >
                ✓ Mark Replied
              </button>

              <button
                type="button"
                className="msr-button msr-button-secondary"
                onClick={() =>
                  setSelectedMessage(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketplaceAdmin;
