
// src/public/marketplace/Marketplace.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          axios.get(
            `${API_URL}/public/marketplace/products`
          ),
          axios.get(
            `${API_URL}/public/marketplace/categories`
          ),
        ]);

      setProducts(
        productsResponse.data?.products || []
      );

      setCategories(
        categoriesResponse.data?.categories || []
      );
    } catch (err) {
      console.error(
        'Error loading marketplace:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Failed to load marketplace products.'
      );

      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // IMAGE URL
  // ============================================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';

    // Already a complete URL
    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:')
    ) {
      return imageUrl;
    }

    // Backend-relative image
    if (imageUrl.startsWith('/')) {
      const backendBase = API_URL.replace(
        /\/api\/?$/,
        ''
      );

      return `${backendBase}${imageUrl}`;
    }

    return imageUrl;
  };

  // ============================================================
  // CATEGORY NAME
  // ============================================================

  const getCategoryName = (category) => {
    if (!category) return 'General';

    if (typeof category === 'string') {
      return category;
    }

    return (
      category.name ||
      category.title ||
      'General'
    );
  };

  // ============================================================
  // FILTER PRODUCTS
  // ============================================================

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => {
        const category =
          product.category ||
          product.category_name ||
          '';

        return (
          String(category).toLowerCase() ===
          String(selectedCategory).toLowerCase()
        );
      });
    }

    // Search
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      filtered = filtered.filter((product) => {
        const name =
          product.name?.toLowerCase() || '';

        const description =
          product.description?.toLowerCase() || '';

        const category =
          product.category?.toLowerCase() || '';

        return (
          name.includes(term) ||
          description.includes(term) ||
          category.includes(term)
        );
      });
    }

    return filtered;
  }, [
    products,
    selectedCategory,
    searchTerm,
  ]);

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  // ============================================================
  // STOCK
  // ============================================================

  const getStock = (product) => {
    if (
      product.stock === null ||
      product.stock === undefined ||
      product.stock === ''
    ) {
      return null;
    }

    const stock = Number(product.stock);

    return Number.isNaN(stock) ? null : stock;
  };

  const getStockStatus = (product) => {
    const stock = getStock(product);

    if (stock === null) {
      return 'available';
    }

    if (stock <= 0) {
      return 'out';
    }

    if (stock < 5) {
      return 'low';
    }

    return 'available';
  };

  // ============================================================
  // PRICE
  // ============================================================

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ''
    ) {
      return 'Price on Request';
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return 'Price on Request';
    }

    return `RWF ${numericPrice.toLocaleString()}`;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="marketplace-loading-page">

        <div className="marketplace-spinner">
          <div className="spinner-inner"></div>
        </div>

        <h3>Loading Marketplace</h3>

        <p>
          Please wait while we load Scout
          products...
        </p>

        <style>{`

          .marketplace-loading-page {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #f7faf8;
            text-align: center;
          }

          .marketplace-spinner {
            width: 54px;
            height: 54px;
            border: 5px solid #dcebe5;
            border-top-color: #006a4e;
            border-radius: 50%;
            animation:
              marketplaceSpin
              0.8s linear infinite;
            margin-bottom: 20px;
          }

          .spinner-inner {
            width: 100%;
            height: 100%;
          }

          .marketplace-loading-page h3 {
            margin: 0 0 7px;
            color: #12372a;
            font-size: 1.25rem;
          }

          .marketplace-loading-page p {
            margin: 0;
            color: #6d7b75;
            font-size: 0.9rem;
          }

          @keyframes marketplaceSpin {
            to {
              transform: rotate(360deg);
            }
          }

        `}</style>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="marketplace-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="marketplace-hero">

        <div className="marketplace-container">

          <Link
            to="/"
            className="marketplace-back"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>

          <div className="marketplace-eyebrow">
            <i className="fas fa-store"></i>
            MSR MARKETPLACE
          </div>

          <h1>
            Scout Marketplace
          </h1>

          <p>
            Find official Scout uniforms,
            merchandise, equipment, accessories,
            and supplies for your scouting journey.
          </p>

          <div className="marketplace-hero-stats">

            <div className="hero-stat">
              <strong>
                {products.length}
              </strong>

              <span>
                Products
              </span>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat">
              <strong>
                {categories.length}
              </strong>

              <span>
                Categories
              </span>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat">
              <strong>
                RWF
              </strong>

              <span>
                Local Pricing
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          MARKETPLACE SECTION
      ====================================================== */}

      <section className="marketplace-section">

        <div className="marketplace-container">

          {/* ==================================================
              FILTER CARD
          ================================================== */}

          <div className="marketplace-filter-card">

            <div className="filter-heading">

              <div className="filter-heading-icon">
                <i className="fas fa-shopping-bag"></i>
              </div>

              <div>
                <h2>
                  Browse Products
                </h2>

                <p>
                  Find what you need for your
                  scouting activities
                </p>
              </div>

            </div>

            <div className="marketplace-filters">

              {/* Search */}

              <div className="search-wrapper">

                <i className="fas fa-search"></i>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="search-input"
                />

                {searchTerm && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() =>
                      setSearchTerm('')
                    }
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}

              </div>

              {/* Category */}

              <div className="category-wrapper">

                <i className="fas fa-tags"></i>

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(
                      e.target.value
                    )
                  }
                  className="category-select"
                >
                  <option value="all">
                    All Categories
                  </option>

                  {categories.map((category) => {

                    const name =
                      getCategoryName(
                        category
                      );

                    return (
                      <option
                        key={
                          category.id ||
                          name
                        }
                        value={name}
                      >
                        {name}
                      </option>
                    );
                  })}

                </select>

              </div>

              {/* Count */}

              <div className="product-count">

                <strong>
                  {filteredProducts.length}
                </strong>

                <span>
                  {filteredProducts.length === 1
                    ? 'product found'
                    : 'products found'}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="marketplace-error">

              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>

              <div className="error-content">

                <strong>
                  Marketplace unavailable
                </strong>

                <p>
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={fetchMarketplaceData}
              >
                <i className="fas fa-redo"></i>
                Retry
              </button>

            </div>
          )}

          {/* ==================================================
              RESULTS HEADER
          ================================================== */}

          {filteredProducts.length > 0 && (
            <div className="products-header">

              <div>

                <span className="products-label">
                  OFFICIAL SCOUT PRODUCTS
                </span>

                <h2>
                  {selectedCategory === 'all'
                    ? 'Shop Our Collection'
                    : selectedCategory}
                </h2>

              </div>

              {(searchTerm ||
                selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="clear-filter-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-times"></i>
                  Clear Filters
                </button>
              )}

            </div>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {filteredProducts.length === 0 ? (

            <div className="marketplace-empty">

              <div className="empty-icon">
                <i className="fas fa-shopping-basket"></i>
              </div>

              <span className="empty-label">
                NO PRODUCTS FOUND
              </span>

              <h3>
                Nothing Available
              </h3>

              <p>
                {searchTerm ||
                selectedCategory !== 'all'
                  ? 'We could not find products matching your search or selected category.'
                  : 'There are no products available at the moment. Please check back later.'}
              </p>

              {(searchTerm ||
                selectedCategory !== 'all') && (
                <button
                  type="button"
                  className="empty-clear-btn"
                  onClick={clearFilters}
                >
                  <i className="fas fa-sync-alt"></i>
                  Reset Filters
                </button>
              )}

            </div>

          ) : (

            /* ==================================================
               PRODUCT GRID
            ================================================== */

            <div className="products-grid">

              {filteredProducts.map(
                (product) => {

                  const stockStatus =
                    getStockStatus(product);

                  const imageUrl =
                    getImageUrl(
                      product.image_url
                    );

                  return (

                    <article
                      className="product-card"
                      key={product.id}
                    >

                      {/* =================================================
                          IMAGE
                      ================================================= */}

                      <div className="product-image">

                        {imageUrl ? (

                          <img
                            src={imageUrl}
                            alt={
                              product.name ||
                              'Scout product'
                            }
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display =
                                'none';

                              const fallback =
                                e.currentTarget
                                  .parentElement
                                  .querySelector(
                                    '.product-image-fallback'
                                  );

                              if (fallback) {
                                fallback.style.display =
                                  'flex';
                              }
                            }}
                          />

                        ) : null}

                        <div
                          className="product-image-fallback"
                          style={{
                            display: imageUrl
                              ? 'none'
                              : 'flex',
                          }}
                        >
                          <i className="fas fa-box-open"></i>
                        </div>

                        {/* Category */}

                        <div className="product-image-category">

                          {product.category ||
                            product.category_name ||
                            'General'}

                        </div>

                        {/* Stock */}

                        {stockStatus === 'low' && (
                          <span className="stock-badge low-stock">
                            <i className="fas fa-bolt"></i>
                            Low Stock
                          </span>
                        )}

                        {stockStatus === 'out' && (
                          <span className="stock-badge out-of-stock">
                            <i className="fas fa-times-circle"></i>
                            Out of Stock
                          </span>
                        )}

                        {stockStatus ===
                          'available' &&
                          getStock(product) !==
                            null && (
                            <span className="stock-badge in-stock">
                              <i className="fas fa-check-circle"></i>
                              In Stock
                            </span>
                          )}

                      </div>

                      {/* =================================================
                          INFO
                      ================================================= */}

                      <div className="product-info">

                        <h3>
                          {product.name ||
                            'Unnamed Product'}
                        </h3>

                        <p className="product-desc">
                          {product.description ||
                            'No product description available.'}
                        </p>

                        {/* Price */}

                        <div className="product-price-row">

                          <div>
                            <span className="price-label">
                              PRICE
                            </span>

                            <div className="product-price">
                              {formatPrice(
                                product.price
                              )}
                            </div>
                          </div>

                        </div>

                        {/* Product meta */}

                        <div className="product-meta">

                          <span>
                            <i className="fas fa-shield-alt"></i>
                            Official Scout Item
                          </span>

                          {getStock(product) !==
                            null && (
                            <span>
                              <i className="fas fa-boxes"></i>
                              {getStock(product)}{' '}
                              available
                            </span>
                          )}

                        </div>

                        {/* Button */}

                        <Link
                          to={`/marketplace/${product.id}`}
                          className="product-btn"
                        >
                          <span>
                            View Details
                          </span>

                          <i className="fas fa-arrow-right"></i>
                        </Link>

                      </div>

                    </article>

                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

      {/* ======================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="marketplace-cta">

        <div className="marketplace-container">

          <div className="cta-icon">
            <i className="fas fa-user-shield"></i>
          </div>

          <div className="cta-content">

            <span>
              SHOP WITH CONFIDENCE
            </span>

            <h2>
              Official Scout Merchandise
            </h2>

            <p>
              Support the scouting movement while
              getting the uniforms, equipment and
              merchandise you need.
            </p>

          </div>

          <Link
            to="/contact"
            className="cta-button"
          >
            Contact Us
            <i className="fas fa-arrow-right"></i>
          </Link>

        </div>

      </section>

      {/* ======================================================
          STYLES
      ====================================================== */}

      <style>{`

        /* =====================================================
           BASE
        ===================================================== */

        .marketplace-page {
          min-height: 100vh;
          background: #f7faf8;
          color: #26352f;
        }

        .marketplace-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .marketplace-hero {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #003d2d 0%,
              #006a4e 55%,
              #00845f 100%
            );
          color: white;
          padding: 68px 0 64px;
        }

        .marketplace-hero::before {
          content: '';
          position: absolute;
          width: 430px;
          height: 430px;
          border-radius: 50%;
          border: 1px solid
            rgba(255,255,255,0.08);
          right: -160px;
          top: -210px;
        }

        .marketplace-hero::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 1px solid
            rgba(255,209,0,0.13);
          left: -160px;
          bottom: -210px;
        }

        .marketplace-hero
          .marketplace-container {
          position: relative;
          z-index: 2;
        }

        /* =====================================================
           BACK
        ===================================================== */

        .marketplace-back {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #FFD100;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 22px;
          transition: all 0.25s ease;
        }

        .marketplace-back:hover {
          color: white;
          transform: translateX(-3px);
        }

        /* =====================================================
           EYEBROW
        ===================================================== */

        .marketplace-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFD100;
          color: #12372a;
          padding: 7px 15px;
          border-radius: 30px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }

        /* =====================================================
           HERO TEXT
        ===================================================== */

        .marketplace-hero h1 {
          margin: 0 0 13px;
          font-size: clamp(
            2.25rem,
            5vw,
            3.5rem
          );
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .marketplace-hero p {
          max-width: 680px;
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: 1.02rem;
          line-height: 1.75;
        }

        /* =====================================================
           HERO STATS
        ===================================================== */

        .marketplace-hero-stats {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 32px;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hero-stat strong {
          color: #FFD100;
          font-size: 1.7rem;
          line-height: 1;
        }

        .hero-stat span {
          color: rgba(255,255,255,0.72);
          font-size: 0.76rem;
          font-weight: 600;
        }

        .hero-stat-divider {
          width: 1px;
          height: 38px;
          background: rgba(255,255,255,0.2);
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .marketplace-section {
          padding: 50px 0 70px;
        }

        /* =====================================================
           FILTER CARD
        ===================================================== */

        .marketplace-filter-card {
          background: white;
          border: 1px solid #e2ebe6;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 40px;
          box-shadow:
            0 8px 30px
            rgba(0,52,38,0.06);
        }

        .filter-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .filter-heading-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eaf5f0;
          color: #006a4e;
        }

        .filter-heading h2 {
          margin: 0 0 3px;
          color: #12372a;
          font-size: 1.05rem;
        }

        .filter-heading p {
          margin: 0;
          color: #7a8781;
          font-size: 0.79rem;
        }

        .marketplace-filters {
          display: grid;
          grid-template-columns:
            minmax(260px, 1fr)
            210px
            auto;
          gap: 12px;
          align-items: center;
        }

        /* =====================================================
           SEARCH
        ===================================================== */

        .search-wrapper,
        .category-wrapper {
          height: 48px;
          display: flex;
          align-items: center;
          position: relative;
          background: #f7faf8;
          border: 1px solid #dce7e2;
          border-radius: 10px;
          transition: all 0.25s ease;
        }

        .search-wrapper:focus-within,
        .category-wrapper:focus-within {
          background: white;
          border-color: #006a4e;
          box-shadow:
            0 0 0 3px
            rgba(0,106,78,0.08);
        }

        .search-wrapper > i,
        .category-wrapper > i {
          margin-left: 15px;
          color: #75837d;
          font-size: 0.85rem;
        }

        .search-input {
          width: 100%;
          height: 100%;
          padding:
            0 42px 0 11px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #26352f;
          font-size: 0.88rem;
          box-sizing: border-box;
        }

        .search-input::placeholder {
          color: #99a49f;
        }

        .search-clear {
          position: absolute;
          right: 9px;
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 50%;
          background: #dfe9e5;
          color: #52625b;
          cursor: pointer;
        }

        /* =====================================================
           CATEGORY
        ===================================================== */

        .category-select {
          width: 100%;
          height: 100%;
          padding: 0 12px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #33443c;
          font-size: 0.87rem;
          cursor: pointer;
        }

        /* =====================================================
           COUNT
        ===================================================== */

        .product-count {
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 17px;
          border-radius: 10px;
          background: #f1f7f4;
          color: #68766f;
          font-size: 0.8rem;
          white-space: nowrap;
        }

        .product-count strong {
          color: #006a4e;
          font-size: 1rem;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .marketplace-error {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff7f6;
          border: 1px solid #f2d3ce;
          border-left: 4px solid #d9534f;
          border-radius: 12px;
          padding: 15px 17px;
          margin-bottom: 30px;
        }

        .error-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #fde9e7;
          color: #d9534f;
        }

        .error-content strong {
          color: #8d2926;
          font-size: 0.88rem;
        }

        .error-content p {
          margin: 3px 0 0;
          color: #87605d;
          font-size: 0.78rem;
        }

        .marketplace-error button {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border: 0;
          border-radius: 8px;
          background: #d9534f;
          color: white;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 700;
        }

        /* =====================================================
           PRODUCTS HEADER
        ===================================================== */

        .products-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .products-label {
          color: #006a4e;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .products-header h2 {
          margin: 5px 0 0;
          color: #12372a;
          font-size: 1.75rem;
          letter-spacing: -0.5px;
        }

        .clear-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border: 1px solid #d8e4df;
          border-radius: 8px;
          background: white;
          color: #53635b;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .clear-filter-btn:hover {
          color: #006a4e;
          border-color: #006a4e;
        }

        /* =====================================================
           PRODUCT GRID
        ===================================================== */

        .products-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 23px;
        }

        /* =====================================================
           PRODUCT CARD
        ===================================================== */

        .product-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: white;
          border: 1px solid #e1e9e5;
          border-radius: 16px;
          box-shadow:
            0 5px 20px
            rgba(0,52,38,0.055);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #006a4e;
          z-index: 2;
        }

        .product-card:hover {
          transform: translateY(-6px);
          border-color: #bcd9ce;
          box-shadow:
            0 15px 38px
            rgba(0,52,38,0.12);
        }

        /* =====================================================
           IMAGE
        ===================================================== */

        .product-image {
          position: relative;
          height: 225px;
          background:
            linear-gradient(
              135deg,
              #edf6f2,
              #f8fbfa
            );
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 0.45s ease;
        }

        .product-card:hover
          .product-image img {
          transform: scale(1.05);
        }

        .product-image-fallback {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
          color: #006a4e;
          font-size: 3.5rem;
        }

        .product-image-category {
          position: absolute;
          left: 12px;
          bottom: 12px;
          max-width: calc(100% - 24px);
          padding: 5px 10px;
          border-radius: 20px;
          background: rgba(0,61,45,0.88);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           STOCK
        ===================================================== */

        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 20px;
          color: white;
          font-size: 0.66rem;
          font-weight: 800;
          box-shadow:
            0 3px 10px
            rgba(0,0,0,0.12);
        }

        .low-stock {
          background: #e38b00;
        }

        .out-of-stock {
          background: #c93434;
        }

        .in-stock {
          background: #006a4e;
        }

        /* =====================================================
           PRODUCT INFO
        ===================================================== */

        .product-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 20px;
        }

        .product-info h3 {
          margin: 0 0 9px;
          color: #12372a;
          font-size: 1.12rem;
          line-height: 1.35;
        }

        .product-desc {
          min-height: 44px;
          margin: 0 0 17px;
          color: #6b7972;
          font-size: 0.84rem;
          line-height: 1.65;

          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        /* =====================================================
           PRICE
        ===================================================== */

        .product-price-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .price-label {
          display: block;
          margin-bottom: 3px;
          color: #98a39e;
          font-size: 0.61rem;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .product-price {
          color: #006a4e;
          font-size: 1.22rem;
          font-weight: 800;
        }

        /* =====================================================
           META
        ===================================================== */

        .product-meta {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 11px 0;
          border-top: 1px solid #edf1ef;
          border-bottom: 1px solid #edf1ef;
          margin-bottom: 15px;
        }

        .product-meta span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #718078;
          font-size: 0.72rem;
        }

        .product-meta i {
          width: 17px;
          color: #006a4e;
          text-align: center;
        }

        /* =====================================================
           BUTTON
        ===================================================== */

        .product-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          border-radius: 9px;
          background: #006a4e;
          color: white;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 700;
          transition: all 0.25s ease;
        }

        .product-btn:hover {
          background: #004f3a;
        }

        .product-btn i {
          transition:
            transform 0.25s ease;
        }

        .product-btn:hover i {
          transform: translateX(4px);
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .marketplace-empty {
          background: white;
          border: 1px dashed #cbdcd5;
          border-radius: 18px;
          text-align: center;
          padding: 70px 25px;
        }

        .empty-icon {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #edf6f2;
          color: #006a4e;
          font-size: 1.7rem;
        }

        .empty-label {
          color: #75847d;
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .marketplace-empty h3 {
          margin: 8px 0;
          color: #12372a;
          font-size: 1.3rem;
        }

        .marketplace-empty p {
          max-width: 520px;
          margin: 0 auto 20px;
          color: #75817c;
          font-size: 0.88rem;
          line-height: 1.65;
        }

        .empty-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 17px;
          border: 0;
          border-radius: 8px;
          background: #006a4e;
          color: white;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .empty-clear-btn:hover {
          background: #004f3a;
        }

        /* =====================================================
           CTA
        ===================================================== */

        .marketplace-cta {
          background: #003d2d;
          color: white;
          padding: 42px 0;
        }

        .marketplace-cta
          .marketplace-container {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .cta-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 15px;
          background: rgba(255,209,0,0.13);
          color: #FFD100;
          font-size: 1.4rem;
        }

        .cta-content {
          flex: 1;
        }

        .cta-content > span {
          color: #FFD100;
          font-size: 0.67rem;
          font-weight: 800;
          letter-spacing: 1.2px;
        }

        .cta-content h2 {
          margin: 4px 0 5px;
          font-size: 1.45rem;
        }

        .cta-content p {
          margin: 0;
          color: rgba(255,255,255,0.7);
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 19px;
          border-radius: 9px;
          background: #FFD100;
          color: #12372a;
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 800;
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .cta-button:hover {
          background: #ffe05c;
          transform: translateY(-2px);
        }

        .cta-button i {
          transition:
            transform 0.25s ease;
        }

        .cta-button:hover i {
          transform: translateX(3px);
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {

          .products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .marketplace-filters {
            grid-template-columns:
              minmax(0, 1fr)
              190px;
          }

          .product-count {
            grid-column: 1 / -1;
            justify-content: flex-start;
          }

        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 680px) {

          .marketplace-container {
            padding: 0 17px;
          }

          .marketplace-hero {
            padding: 48px 0 50px;
          }

          .marketplace-hero h1 {
            font-size: 2.2rem;
          }

          .marketplace-hero p {
            font-size: 0.9rem;
            line-height: 1.65;
          }

          .marketplace-hero-stats {
            flex-wrap: wrap;
            gap: 18px;
            margin-top: 26px;
          }

          .hero-stat strong {
            font-size: 1.4rem;
          }

          .hero-stat span {
            font-size: 0.7rem;
          }

          .hero-stat-divider {
            display: none;
          }

          .marketplace-section {
            padding: 35px 0 55px;
          }

          .marketplace-filter-card {
            padding: 17px;
            border-radius: 14px;
          }

          .marketplace-filters {
            grid-template-columns: 1fr;
          }

          .product-count {
            grid-column: auto;
            justify-content: flex-start;
          }

          .products-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .products-header h2 {
            font-size: 1.45rem;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .product-image {
            height: 230px;
          }

          .marketplace-error {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .marketplace-error button {
            margin-left: 52px;
          }

          .marketplace-cta
            .marketplace-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {

          .marketplace-hero {
            padding: 40px 0 44px;
          }

          .marketplace-hero h1 {
            font-size: 2rem;
          }

          .marketplace-filter-card {
            padding: 14px;
          }

          .filter-heading {
            align-items: flex-start;
          }

          .filter-heading-icon {
            width: 38px;
            height: 38px;
          }

          .product-image {
            height: 200px;
          }

          .product-info {
            padding: 17px;
          }

        }

      `}</style>
    </div>
  );
};

export default Marketplace;