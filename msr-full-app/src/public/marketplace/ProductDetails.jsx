
// src/public/marketplace/ProductDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const image = String(imagePath).trim();

  if (!image) return null;

  // Cloudinary or any other absolute HTTP/HTTPS URL
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Protocol-relative URL
  if (image.startsWith('//')) {
    return `https:${image}`;
  }

  // Existing backend absolute path
  if (image.startsWith('/')) {
    return `${BACKEND_URL}${image}`;
  }

  // Existing filename-only local upload
  return `${BACKEND_URL}/uploads/${image}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setImageLoading(true);
      setImageError(false);

      const response = await axios.get(
        `${API_URL}/public/marketplace/products/${id}`
      );

      let productData = null;
      let relatedData = [];

      if (response.data?.success) {
        productData =
          response.data.data?.product || response.data.product;

        relatedData =
          response.data.data?.relatedProducts ||
          response.data.relatedProducts ||
          [];
      } else if (response.data?.product) {
        productData = response.data.product;
        relatedData = response.data.relatedProducts || [];
      } else if (response.data?.data?.product) {
        productData = response.data.data.product;
        relatedData = response.data.data.relatedProducts || [];
      } else {
        productData = response.data;
      }

      if (productData && productData.id) {
        setProduct(productData);
        setRelatedProducts(relatedData);
        setError('');

        console.log(
          '🖼️ ProductDetails database image_url:',
          productData.image_url
        );

        console.log(
          '🔗 ProductDetails final image URL:',
          getImageUrl(productData.image_url)
        );
      } else {
        setError('Product not found');
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);

    if (val > 0 && val <= (product?.stock || 999)) {
      setQuantity(val);
    }
  };

  const handleImageError = () => {
    console.error(
      '❌ ProductDetails image failed to load:',
      imageUrl
    );

    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log(
      '✅ ProductDetails image loaded:',
      imageUrl
    );

    setImageLoading(false);
  };

  const handlePayNow = () => {
    if (!product) return;

    const paymentData = {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productDescription: product.description,
      productCategory: product.category,
      productImage: product.image_url,
      isProductPurchase: true
    };

    sessionStorage.setItem(
      'productPaymentData',
      JSON.stringify(paymentData)
    );

    navigate('/payment', {
      state: {
        product: paymentData,
        prefill: {
          amount: product.price,
          service: product.name,
          category: product.category || 'product'
        }
      }
    });
  };

  const addToCart = () => {
    setToastMessage(
      `✅ Added ${quantity} × ${product?.name} to cart!`
    );

    setShowSuccessToast(true);

    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleRetry = () => {
    fetchProduct();
  };

  const imageUrl = getImageUrl(product?.image_url);
  const isInStock = product?.stock && product?.stock > 0;

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>

        <style>{`
          .product-details-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            background: #f8f9fa;
          }

          .loading-container {
            text-align: center;
          }

          .loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid #e8d5f0;
            border-top: 4px solid #6A1B9A;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }

            100% {
              transform: rotate(360deg);
            }
          }

          .loading-container p {
            color: #6B7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-error">
        <div className="error-container">
          <div className="error-icon">🔍</div>

          <h2>Product Not Found</h2>

          <p>
            {error ||
              'The product you are looking for does not exist or has been removed.'}
          </p>

          <div className="error-actions">
            <button
              onClick={handleRetry}
              className="btn-retry"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>

              Retry
            </button>

            <Link
              to="/products"
              className="btn-back"
            >
              ← Back to Products
            </Link>
          </div>
        </div>

        <style>{`
          .product-details-error {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            background: #f8f9fa;
            padding: 20px;
          }

          .error-container {
            text-align: center;
            max-width: 500px;
            background: white;
            padding: 50px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 16px;
          }

          .error-container h2 {
            color: #002B5C;
            margin: 0 0 8px 0;
            font-size: 1.8rem;
          }

          .error-container p {
            color: #6B7280;
            margin: 0 0 24px 0;
            line-height: 1.6;
          }

          .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn-retry {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 24px;
            background: #6A1B9A;
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95rem;
          }

          .btn-retry:hover {
            background: #5a1580;
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(106,27,154,0.3);
          }

          .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 24px;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 10px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            font-size: 0.95rem;
          }

          .btn-back:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="product-details-page">

        {/* Toast Notification */}
        {showSuccessToast && (
          <div className="toast-notification toast-slide-in">
            <span className="toast-icon">✅</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="product-details-container">

          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/marketplace">Marketplace</Link>

            <span className="separator">›</span>

            <Link to="/products">Products</Link>

            <span className="separator">›</span>

            <span className="current">
              {product.name}
            </span>
          </div>

          {/* Main Product Section */}
          <div className="product-main">

            {/* Image Gallery */}
            <div className="product-gallery">
              <div className="product-image-wrapper">

                {imageLoading &&
                  product.image_url &&
                  !imageError && (
                    <div className="image-loader">
                      <div className="loader-spinner"></div>
                    </div>
                  )}

                {product.image_url && !imageError ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    className={`product-image ${
                      imageLoading ? 'hidden' : 'visible'
                    }`}
                    decoding="async"
                  />
                ) : (
                  <div className="image-placeholder">
                    <span>📦</span>

                    {imageError && (
                      <p>Image unavailable</p>
                    )}
                  </div>
                )}

                {isInStock && product.stock < 5 && (
                  <span className="badge badge-low-stock">
                    ⚠️ Low Stock
                  </span>
                )}

                {!isInStock && (
                  <span className="badge badge-out-of-stock">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info">

              <div className="product-meta">
                <span className="category-badge">
                  {product.category || 'General'}
                </span>

                {isInStock ? (
                  <span className="stock-badge in-stock">
                    ✅ In Stock
                  </span>
                ) : (
                  <span className="stock-badge out-of-stock">
                    ❌ Out of Stock
                  </span>
                )}
              </div>

              <h1 className="product-title">
                {product.name}
              </h1>

              <div className="product-price">
                {product.price ? (
                  <>
                    <span className="price-amount">
                      RWF {Number(product.price).toLocaleString()}
                    </span>

                    {product.price > 0 && (
                      <span className="price-installment">
                        or 3 payments of RWF{' '}
                        {Math.ceil(
                          product.price / 3
                        ).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="price-request">
                    Price on Request
                  </span>
                )}
              </div>

              <div className="product-description">
                <p>
                  {product.description ||
                    'No description available for this product.'}
                </p>
              </div>

              {/* Tabs */}
              <div className="product-tabs">
                <div className="tab-header">

                  <button
                    className={`tab-btn ${
                      activeTab === 'description'
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setActiveTab('description')
                    }
                  >
                    📄 Description
                  </button>

                  {product.specifications &&
                    Object.keys(product.specifications).length >
                      0 && (
                      <button
                        className={`tab-btn ${
                          activeTab === 'specifications'
                            ? 'active'
                            : ''
                        }`}
                        onClick={() =>
                          setActiveTab('specifications')
                        }
                      >
                        🔧 Specifications
                      </button>
                    )}
                </div>

                <div className="tab-content">

                  {activeTab === 'description' && (
                    <div className="description-content">
                      <p>
                        {product.description ||
                          'No description available.'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'specifications' &&
                    product.specifications && (
                      <div className="specs-grid">
                        {Object.entries(
                          product.specifications
                        ).map(([key, value]) =>
                          value ? (
                            <div
                              className="spec-item"
                              key={key}
                            >
                              <span className="spec-label">
                                {key}
                              </span>

                              <span className="spec-value">
                                {value}
                              </span>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Stock Info */}
              {isInStock && (
                <div className="stock-info">
                  <span className="stock-dot"></span>

                  <span className="stock-text">
                    {product.stock} units available
                  </span>
                </div>
              )}

              {/* Actions */}
              {isInStock && (
                <div className="product-actions">

                  <div className="quantity-selector">
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.max(1, quantity - 1)
                        )
                      }
                      className="qty-btn"
                      disabled={quantity <= 1}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock}
                      className="qty-input"
                    />

                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            product.stock || 999,
                            quantity + 1
                          )
                        )
                      }
                      className="qty-btn"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>

                  <div className="action-buttons">

                    <button
                      onClick={addToCart}
                      className="btn-add-to-cart"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>

                      Add to Cart
                    </button>

                    {product.price > 0 && (
                      <button
                        onClick={handlePayNow}
                        className="btn-buy-now"
                      >
                        💳 Buy Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="product-actions-secondary">

                <button className="btn-wishlist">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>

                  Wishlist
                </button>

                <Link
                  to="/contact"
                  className="btn-inquiry"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>

                  Ask Question
                </Link>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="related-products">
              <h2 className="related-title">
                You May Also Like
              </h2>

              <div className="related-grid">
                {relatedProducts.map((related) => {
                  const relatedImageUrl =
                    getImageUrl(related.image_url);

                  return (
                    <Link
                      to={`/marketplace/${related.id}`}
                      className="related-card"
                      key={related.id}
                    >
                      <div className="related-image">

                        {related.image_url ? (
                          <img
                            src={relatedImageUrl}
                            alt={related.name}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              console.error(
                                '❌ Related product image failed:',
                                related.image_url
                              );

                              e.target.style.display = 'none';

                              if (
                                e.target.parentElement
                              ) {
                                e.target.parentElement.innerHTML =
                                  '<span class="related-emoji">📦</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className="related-emoji">
                            📦
                          </span>
                        )}
                      </div>

                      <div className="related-info">
                        <h4>{related.name}</h4>

                        <p className="related-price">
                          {related.price
                            ? `RWF ${Number(
                                related.price
                              ).toLocaleString()}`
                            : 'Price on Request'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <style>{`
          /* ============================================
             PROFESSIONAL UI STYLES
             ============================================ */

          .product-details-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 20px 0 60px;
          }

          .product-details-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
          }

          /* Toast Notification */

          .toast-notification {
            position: fixed;
            top: 80px;
            right: 24px;
            background: #1a1a2e;
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.95rem;
            border-left: 4px solid #2E7D32;
            animation: slideInRight 0.3s ease;
          }

          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }

            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .toast-icon {
            font-size: 1.2rem;
          }

          /* Breadcrumb */

          .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: #6B7280;
            margin-bottom: 30px;
            flex-wrap: wrap;
            padding: 12px 0;
          }

          .breadcrumb a {
            color: #6A1B9A;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }

          .breadcrumb a:hover {
            color: #4A1370;
          }

          .breadcrumb .separator {
            color: #d1d5db;
          }

          .breadcrumb .current {
            color: #002B5C;
            font-weight: 600;
          }

          /* Main Product Layout */

          .product-main {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            border: 1px solid #f0f0f0;
            margin-bottom: 50px;
          }

          /* Product Gallery */

          .product-gallery {
            position: relative;
          }

          .product-image-wrapper {
            position: relative;
            background: #faf8fc;
            border-radius: 16px;
            overflow: hidden;
            aspect-ratio: 1 / 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #f0f0f0;
          }

          .product-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: opacity 0.3s ease;
            padding: 20px;
          }

          .product-image.hidden {
            opacity: 0;
          }

          .product-image.visible {
            opacity: 1;
          }

          .image-loader {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #faf8fc;
            z-index: 2;
          }

          .loader-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #e8d5f0;
            border-top: 3px solid #6A1B9A;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .image-placeholder {
            font-size: 4rem;
            text-align: center;
            color: #bbb;
          }

          .image-placeholder p {
            font-size: 0.85rem;
            color: #999;
            margin-top: 8px;
          }

          .badge {
            position: absolute;
            top: 16px;
            right: 16px;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            z-index: 3;
            backdrop-filter: blur(4px);
          }

          .badge-low-stock {
            background: rgba(255, 152, 0, 0.9);
          }

          .badge-out-of-stock {
            background: rgba(211, 47, 47, 0.9);
          }

          /* Product Info */

          .product-info {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .product-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .category-badge {
            display: inline-block;
            padding: 4px 14px;
            background: #f0eaf5;
            color: #6A1B9A;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .stock-badge {
            font-size: 0.8rem;
            font-weight: 500;
            padding: 4px 12px;
            border-radius: 20px;
          }

          .stock-badge.in-stock {
            color: #2E7D32;
            background: #e8f5e9;
          }

          .stock-badge.out-of-stock {
            color: #D32F2F;
            background: #fce4ec;
          }

          .product-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: #002B5C;
            margin: 0;
            line-height: 1.2;
          }

          .product-price {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 16px 0;
            border-top: 1px solid #f0f0f0;
            border-bottom: 1px solid #f0f0f0;
          }

          .price-amount {
            font-size: 2.2rem;
            font-weight: 700;
            color: #6A1B9A;
          }

          .price-installment {
            font-size: 0.9rem;
            color: #6B7280;
          }

          .price-request {
            font-size: 1.4rem;
            font-weight: 600;
            color: #6A1B9A;
          }

          .product-description p {
            color: #4B5563;
            line-height: 1.8;
            margin: 0;
            font-size: 0.95rem;
          }

          /* Tabs */

          .product-tabs {
            border: 1px solid #f0f0f0;
            border-radius: 12px;
            overflow: hidden;
            margin-top: 4px;
          }

          .tab-header {
            display: flex;
            gap: 0;
            background: #faf8fc;
            border-bottom: 1px solid #f0f0f0;
          }

          .tab-btn {
            flex: 1;
            padding: 12px 20px;
            background: none;
            border: none;
            font-weight: 500;
            color: #6B7280;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            border-bottom: 2px solid transparent;
          }

          .tab-btn:hover {
            color: #002B5C;
            background: #f5f0f8;
          }

          .tab-btn.active {
            color: #6A1B9A;
            border-bottom-color: #6A1B9A;
            background: white;
            font-weight: 600;
          }

          .tab-content {
            padding: 20px 24px;
            background: white;
          }

          .tab-content p {
            color: #4B5563;
            line-height: 1.8;
            margin: 0;
          }

          .specs-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 24px;
          }

          .spec-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #f5f0f8;
          }

          .spec-label {
            color: #6B7280;
            font-weight: 500;
          }

          .spec-value {
            color: #002B5C;
            font-weight: 500;
          }

          /* Stock Info */

          .stock-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
          }

          .stock-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2E7D32;
            animation: pulse-dot 2s infinite;
          }

          @keyframes pulse-dot {
            0%, 100% {
              opacity: 1;
            }

            50% {
              opacity: 0.5;
            }
          }

          .stock-text {
            color: #2E7D32;
            font-size: 0.9rem;
            font-weight: 500;
          }

          /* Product Actions */

          .product-actions {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            padding-top: 8px;
          }

          .quantity-selector {
            display: flex;
            align-items: center;
            border: 2px solid #e8d5f0;
            border-radius: 10px;
            overflow: hidden;
            background: white;
          }

          .qty-btn {
            padding: 10px 16px;
            background: #faf8fc;
            border: none;
            cursor: pointer;
            font-size: 1.2rem;
            font-weight: 600;
            color: #002B5C;
            transition: all 0.2s;
            min-width: 44px;
          }

          .qty-btn:hover:not(:disabled) {
            background: #e8d5f0;
          }

          .qty-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }

          .qty-input {
            width: 50px;
            text-align: center;
            border: none;
            padding: 10px 0;
            font-size: 1rem;
            font-weight: 600;
            outline: none;
            background: white;
            color: #002B5C;
          }

          .qty-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
          }

          .action-buttons {
            display: flex;
            gap: 10px;
            flex: 1;
          }

          .btn-add-to-cart {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 14px 28px;
            background: linear-gradient(
              135deg,
              #002B5C,
              #6A1B9A
            );
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-add-to-cart:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(106,27,154,0.3);
          }

          .btn-buy-now {
            flex: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px 28px;
            background: #FFD100;
            color: #002B5C;
            border: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-buy-now:hover {
            background: #e6bc00;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(255,209,0,0.3);
          }

          .product-actions-secondary {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .btn-wishlist,
          .btn-inquiry {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: white;
            border: 2px solid #f0f0f0;
            border-radius: 10px;
            font-weight: 500;
            color: #4B5563;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            font-size: 0.9rem;
          }

          .btn-wishlist:hover {
            border-color: #D32F2F;
            color: #D32F2F;
            background: #fef0f0;
          }

          .btn-inquiry:hover {
            border-color: #6A1B9A;
            color: #6A1B9A;
            background: #f0eaf5;
          }

          /* Related Products */

          .related-products {
            margin-top: 10px;
          }

          .related-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #002B5C;
            margin: 0 0 24px 0;
          }

          .related-grid {
            display: grid;
            grid-template-columns: repeat(
              auto-fill,
              minmax(200px, 1fr)
            );
            gap: 20px;
          }

          .related-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          .related-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 40px rgba(106,27,154,0.1);
            border-color: #6A1B9A;
          }

          .related-image {
            height: 160px;
            background: #faf8fc;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .related-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .related-emoji {
            font-size: 2.5rem;
          }

          .related-info {
            padding: 14px 16px;
          }

          .related-info h4 {
            margin: 0 0 4px 0;
            color: #002B5C;
            font-size: 0.95rem;
            font-weight: 600;
          }

          .related-price {
            margin: 0;
            color: #6A1B9A;
            font-weight: 600;
            font-size: 0.9rem;
          }

          /* Responsive */

          @media (max-width: 968px) {
            .product-main {
              grid-template-columns: 1fr;
              gap: 30px;
              padding: 30px;
            }

            .product-image-wrapper {
              aspect-ratio: 4 / 3;
            }

            .product-title {
              font-size: 1.8rem;
            }

            .price-amount {
              font-size: 1.8rem;
            }

            .specs-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 600px) {
            .product-details-container {
              padding: 0 16px;
            }

            .product-main {
              padding: 20px;
            }

            .product-actions {
              flex-direction: column;
              align-items: stretch;
            }

            .quantity-selector {
              justify-content: center;
            }

            .action-buttons {
              flex-direction: column;
            }

            .btn-add-to-cart,
            .btn-buy-now {
              width: 100%;
              justify-content: center;
            }

            .related-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .product-title {
              font-size: 1.5rem;
            }

            .price-amount {
              font-size: 1.5rem;
            }

            .toast-notification {
              top: 70px;
              right: 16px;
              left: 16px;
              font-size: 0.85rem;
            }
          }

          @media (max-width: 400px) {
            .related-grid {
              grid-template-columns: 1fr;
            }

            .tab-header {
              flex-direction: column;
            }

            .tab-btn {
              border-bottom: 1px solid #f0f0f0;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ProductDetails;
