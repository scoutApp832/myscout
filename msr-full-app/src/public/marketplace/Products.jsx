// src/public/marketplace/Products.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ✅ API URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// ✅ Backend URL (remove /api from API_URL)
const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// ✅ Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, prepend backend URL
  if (imagePath.startsWith('/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // Otherwise, add /uploads/ prefix
  return `${BACKEND_URL}/uploads/${imagePath}`;
};

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [imageErrors, setImageErrors] = useState({});

  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    fetchProducts();
  }, [category, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/public/marketplace/products?category=${category}&sort=${sortBy}`
      );
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // ✅ Handle Pay Now - Navigate to Payment System with product data
  const handlePayNow = (product) => {
    const paymentData = {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productDescription: product.description,
      productCategory: product.category,
      productImage: product.image_url,
      isProductPurchase: true
    };
    sessionStorage.setItem('productPaymentData', JSON.stringify(paymentData));
    
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

  if (loading) {
    return (
      <div className="products-loading">
        <div className="products-spinner"></div>
        <p>Loading products...</p>
        <style>{`
          .products-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: #6A1B9A;
          }
          .products-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e8d5f0;
            border-top: 4px solid #6A1B9A;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .products-loading p { margin-top: 12px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="products-page">
      <section className="products-hero">
        <div className="products-container">
          <Link to="/marketplace" className="products-back">← Back to Marketplace</Link>
          <span className="products-eyebrow">🛍️ PRODUCTS</span>
          <h1>All Products</h1>
          <p>Browse our complete collection of scout merchandise and supplies</p>
        </div>
      </section>

      <section className="products-section">
        <div className="products-container">
          <div className="products-toolbar">
            <div className="products-count">
              {products.length} product{products.length !== 1 ? 's' : ''} found
              {category !== 'all' && (
                <span className="category-filter-badge">
                  in {category}
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="remove-filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div className="products-sort">
              <label>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="products-error">{error}</div>
          )}

          {products.length === 0 ? (
            <div className="products-empty">
              <span className="empty-icon">🔍</span>
              <h3>No Products Found</h3>
              <p>Try adjusting your filters or search criteria.</p>
              <Link to="/products" className="clear-filters-btn">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => {
                // ✅ Get the full image URL
                const imageUrl = getImageUrl(product.image_url);
                const hasImageError = imageErrors[product.id];
                console.log(`🖼️ Product: ${product.name}, Image URL:`, imageUrl);
                
                return (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.image_url && !hasImageError ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          onError={() => handleImageError(product.id)}
                          loading="lazy"
                        />
                      ) : (
                        <span className="product-emoji">📦</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-price">
                        {product.price ? `RWF ${Number(product.price).toLocaleString()}` : 'Price on Request'}
                      </div>
                      <div className="product-category">
                        <span className="category-tag">{product.category || 'General'}</span>
                      </div>
                      <div className="product-actions">
                        <Link to={`/marketplace/${product.id}`} className="product-btn">
                          View Details →
                        </Link>
                        {product.price > 0 && (
                          <button
                            onClick={() => handlePayNow(product)}
                            className="pay-now-btn"
                          >
                            💳 Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .products-page {
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }
        .products-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .products-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .products-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 8px 0;
        }
        .products-hero p {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          opacity: 0.9;
          max-width: 600px;
        }
        .products-back {
          color: #FFD100;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 16px;
        }
        .products-back:hover { text-decoration: underline; }
        .products-eyebrow {
          display: inline-block;
          background: #FFD100;
          color: #002B5C;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .products-section { padding: 30px 0; }
        .products-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e8d5f0;
          margin-bottom: 24px;
        }
        .products-count {
          color: #002B5C;
          font-weight: 500;
        }
        .category-filter-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-left: 12px;
          padding: 2px 8px;
          background: #f0eaf5;
          border-radius: 12px;
          font-size: 0.8rem;
        }
        .remove-filter {
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
          font-size: 1rem;
          padding: 0 4px;
        }
        .remove-filter:hover { color: #D32F2F; }
        .products-sort {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .products-sort label {
          color: #6B7280;
          font-size: 0.9rem;
        }
        .sort-select {
          padding: 6px 12px;
          border: 1px solid #e8d5f0;
          border-radius: 6px;
          background: white;
          outline: none;
          cursor: pointer;
        }
        .sort-select:focus {
          border-color: #6A1B9A;
        }

        .products-error {
          background: #fee;
          color: #c00;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }

        .products-empty {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e8d5f0;
        }
        .empty-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
        .products-empty h3 { color: #002B5C; margin: 0; }
        .products-empty p { color: #6B7280; margin: 8px 0 16px 0; }
        .clear-filters-btn {
          display: inline-block;
          padding: 8px 24px;
          background: #6A1B9A;
          color: white;
          border: none;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .clear-filters-btn:hover {
          background: #5a1580;
          transform: translateY(-2px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 30px rgba(106,27,154,0.15);
          border-color: #6A1B9A;
        }
        .product-image {
          background: #f8f0fa;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-emoji { font-size: 4rem; }
        .product-info { padding: 20px; }
        .product-info h3 {
          color: #002B5C;
          margin: 0 0 4px 0;
          font-size: 1.1rem;
        }
        .product-desc {
          color: #6B7280;
          font-size: 0.9rem;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-price {
          color: #6A1B9A;
          font-weight: 700;
          font-size: 1.2rem;
          margin: 8px 0;
        }
        .product-category { margin: 8px 0; }
        .category-tag {
          display: inline-block;
          padding: 2px 12px;
          background: #f0eaf5;
          color: #6A1B9A;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .product-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }
        .product-btn {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 6px;
          background: #6A1B9A;
          color: white;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          flex: 1;
          text-align: center;
        }
        .product-btn:hover {
          background: #5a1580;
          transform: translateX(4px);
        }

        .pay-now-btn {
          padding: 8px 20px;
          border-radius: 6px;
          border: 2px solid #FFD100;
          background: #FFD100;
          color: #002B5C;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pay-now-btn:hover {
          background: #e6bc00;
          border-color: #e6bc00;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255,209,0,0.3);
        }

        @media (max-width: 768px) {
          .products-hero { padding: 40px 20px; }
          .products-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .products-grid { grid-template-columns: 1fr 1fr; }
          .product-actions {
            flex-direction: column;
          }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr; }
          .product-image { height: 140px; }
        }
      `}</style>
    </div>
  );
};

export default Products;