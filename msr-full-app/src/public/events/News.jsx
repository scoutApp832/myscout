
// src/public/events/News.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ============================================================
// API
// ============================================================

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BACKEND_URL = API_URL.replace(/\/api\/?$/, '');

// ============================================================
// MSR COLORS
// ============================================================

const SCOUT = {
  purple: '#6A1B9A',
  purpleDark: '#4A148C',
  purpleLight: '#F3E5F5',
  blue: '#002B5C',
  blueDark: '#001B3A',
  blueLight: '#EAF2FA',
  gold: '#FFD100',
  goldDark: '#E5B900',
  green: '#2E7D32',
  red: '#C62828',
  white: '#FFFFFF',
  black: '#111827',
  gray50: '#F8F9FA',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
};

// ============================================================
// SOCIAL PLATFORMS
// ============================================================

const SCOUT_PLATFORMS = [
  {
    name: 'YouTube',
    icon: '▶',
    description:
      'Watch Rwanda Scouts Association videos, activities and stories.',
    action: 'Watch Videos',
    url: 'https://www.youtube.com/@rwandascouts',
    className: 'youtube',
  },
  {
    name: 'X',
    icon: '𝕏',
    description:
      'Follow Rwanda Scouts Association news and updates on X.',
    action: 'Follow Us',
    url: 'https://x.com/rwandascouts',
    className: 'x',
  },
  {
    name: 'Facebook',
    icon: 'f',
    description:
      'Connect with the Rwanda Scouts Association community.',
    action: 'Follow Us',
    url: 'https://www.facebook.com/rwandascout',
    className: 'facebook',
  },
  {
    name: 'Instagram',
    icon: '◎',
    description:
      'See Rwanda Scouts Association activities, photos and stories.',
    action: 'Follow Us',
    url: 'https://www.instagram.com/rwanda_scouts/',
    className: 'instagram',
  },
  {
    name: 'TikTok',
    icon: '♪',
    description:
      'Watch Rwanda Scouts Association short videos and activities.',
    action: 'Follow Us',
    url: 'https://www.tiktok.com/search?q=rwanda%20scouts%20association',
    className: 'tiktok',
  },
  {
    name: 'Scout Website',
    icon: '🌐',
    description:
      'Visit the official Rwanda Scouts Association website.',
    action: 'Visit RSA Website',
    url: 'https://myscout.onrender.com/',
    className: 'website',
  },
];

// ============================================================
// IMAGE HELPER
// ============================================================

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  const value = String(imageUrl).trim();

  if (!value) return null;

  // Cloudinary or any other complete HTTP/HTTPS URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Data URL
  if (value.startsWith('data:')) {
    return value;
  }

  // Protocol-relative URL
  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  // Old backend-relative image
  // Example: /uploads/news/image.jpg
  if (value.startsWith('/')) {
    return `${BACKEND_URL}${value}`;
  }

  // Old database value without leading slash
  return `${BACKEND_URL}/${value.replace(/^\/+/, '')}`;
};

// ============================================================
// DATE
// ============================================================

const formatDate = (date) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable';
  }

  return parsedDate.toLocaleDateString('en-RW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// ============================================================
// CATEGORY
// ============================================================

const getCategory = (item) => {
  return (
    item?.category ||
    item?.type ||
    item?.news_category ||
    'News'
  );
};

// ============================================================
// EXCERPT
// ============================================================

const getExcerpt = (item, maxLength = 160) => {
  if (item?.excerpt) return item.excerpt;

  if (!item?.content) {
    return 'Read the latest update from the Scout community.';
  }

  const cleanText = item.content
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  return `${cleanText.substring(0, maxLength)}...`;
};

// ============================================================
// NEWS IMAGE
// ============================================================

const getNewsImage = (item) => {
  if (!item) return null;

  return getImageUrl(
    item.image_url ||
      item.image ||
      item.featured_image ||
      item.thumbnail
  );
};

// ============================================================
// COMPONENT
// ============================================================

const News = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articleLoading, setArticleLoading] = useState(false);
  const [error, setError] = useState('');
  const [articleError, setArticleError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [heroIndex, setHeroIndex] = useState(0);

  // ==========================================================
  // FETCH NEWS
  // ==========================================================

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_URL}/public/news`
      );

      const receivedNews =
        response.data?.news ||
        response.data?.data ||
        [];

      setNews(
        Array.isArray(receivedNews)
          ? receivedNews
          : []
      );
    } catch (err) {
      console.error('Error fetching news:', err);

      setError(
        err.response?.data?.message ||
          'Failed to load news. Please try again.'
      );

      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ARTICLES WITH IMAGES
  // ==========================================================

  const heroNews = useMemo(() => {
    return news
      .filter((item) => getNewsImage(item))
      .slice(0, 5);
  }, [news]);

  // ==========================================================
  // HERO AUTO SLIDER
  // ==========================================================

  useEffect(() => {
    if (heroNews.length <= 1) return;

    const timer = setInterval(() => {
      setHeroIndex((prev) => {
        return (prev + 1) % heroNews.length;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [heroNews.length]);

  useEffect(() => {
    if (heroIndex >= heroNews.length) {
      setHeroIndex(0);
    }
  }, [heroIndex, heroNews.length]);

  // ==========================================================
  // SINGLE ARTICLE
  // ==========================================================

  useEffect(() => {
    if (!id) {
      setSelectedArticle(null);
      setArticleError('');
      return;
    }

    const existingArticle = news.find(
      (item) => String(item.id) === String(id)
    );

    if (existingArticle) {
      setSelectedArticle(existingArticle);
      setArticleError('');
      return;
    }

    if (!loading) {
      fetchSingleArticle(id);
    }
  }, [id, news, loading]);

  const fetchSingleArticle = async (articleId) => {
    try {
      setArticleLoading(true);
      setArticleError('');

      const response = await axios.get(
        `${API_URL}/public/news/${articleId}`
      );

      const article =
        response.data?.news ||
        response.data?.data ||
        response.data;

      if (!article || !article.id) {
        throw new Error('Article not found');
      }

      setSelectedArticle(article);
    } catch (err) {
      console.error('Error fetching article:', err);

      setSelectedArticle(null);

      setArticleError(
        err.response?.data?.message ||
          'News article could not be found.'
      );
    } finally {
      setArticleLoading(false);
    }
  };

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const values = news.map((item) =>
      getCategory(item)
    );

    return [
      'All',
      ...Array.from(new Set(values)),
    ];
  }, [news]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const title =
        item.title?.toLowerCase() || '';

      const content =
        item.content?.toLowerCase() || '';

      const excerpt =
        item.excerpt?.toLowerCase() || '';

      const itemCategory =
        getCategory(item).toLowerCase();

      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        content.includes(searchValue) ||
        excerpt.includes(searchValue);

      const matchesCategory =
        category === 'All' ||
        itemCategory === category.toLowerCase();

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [news, search, category]);

  // ==========================================================
  // FEATURED ARTICLE
  // ==========================================================

  const featuredArticle =
    filteredNews.length > 0
      ? filteredNews[0]
      : null;

  // ==========================================================
  // RELATED NEWS
  // ==========================================================

  const relatedNews = useMemo(() => {
    if (!selectedArticle) return [];

    return news
      .filter(
        (item) =>
          String(item.id) !==
          String(selectedArticle.id)
      )
      .filter(
        (item) =>
          getCategory(item) ===
          getCategory(selectedArticle)
      )
      .slice(0, 3);
  }, [news, selectedArticle]);

  // ==========================================================
  // ARTICLE CONTENT
  // ==========================================================

  const renderArticleContent = (article) => {
    if (!article?.content) {
      return (
        <p className="article-no-content">
          No detailed content is available for this
          article.
        </p>
      );
    }

    if (
      article.content.includes('<p>') ||
      article.content.includes('<div>') ||
      article.content.includes('<br')
    ) {
      return (
        <div
          className="article-html"
          dangerouslySetInnerHTML={{
            __html: article.content,
          }}
        />
      );
    }

    return article.content
      .split(/\n\s*\n/)
      .map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && !id) {
    return (
      <>
        <div className="modern-news-loading">
          <div className="loading-ring"></div>

          <h3>Loading MSR News</h3>

          <p>
            Bringing you the latest Scout stories
            and updates...
          </p>
        </div>

        <NewsStyles />
      </>
    );
  }

  // ==========================================================
  // ARTICLE LOADING
  // ==========================================================

  if (id && articleLoading) {
    return (
      <>
        <div className="modern-news-loading">
          <div className="loading-ring"></div>

          <h3>Loading Article</h3>

          <p>Please wait...</p>
        </div>

        <NewsStyles />
      </>
    );
  }

  // ==========================================================
  // ARTICLE NOT FOUND
  // ==========================================================

  if (id && (articleError || !selectedArticle)) {
    return (
      <>
        <div className="modern-news-page">
          <section className="article-not-found">
            <div className="article-not-found-inner">
              <div className="not-found-icon">
                📰
              </div>

              <span className="small-label">
                MSR NEWS
              </span>

              <h1>Article Not Found</h1>

              <p>
                {articleError ||
                  'The requested news article is not available.'}
              </p>

              <button
                className="gold-button"
                onClick={() =>
                  navigate('/news')
                }
              >
                ← Back to News
              </button>
            </div>
          </section>
        </div>

        <NewsStyles />
      </>
    );
  }

  // ==========================================================
  // ARTICLE PAGE
  // ==========================================================

  if (id && selectedArticle) {
    const articleImage =
      getNewsImage(selectedArticle);

    return (
      <>
        <div className="modern-news-page">
          {/* ARTICLE HERO */}

          <section className="article-top">
            <div className="article-top-overlay"></div>

            <div className="news-container article-top-inner">
              <button
                className="article-back"
                onClick={() =>
                  navigate('/news')
                }
              >
                ← Back to News
              </button>

              <div className="article-label">
                {getCategory(selectedArticle)}
              </div>

              <h1>
                {selectedArticle.title}
              </h1>

              <div className="article-meta">
                <span>
                  📅{' '}
                  {formatDate(
                    selectedArticle.created_at ||
                      selectedArticle.createdAt ||
                      selectedArticle.date
                  )}
                </span>

                <span>•</span>

                <span>
                  🏕 MyScout Rwanda
                </span>
              </div>
            </div>
          </section>

          {/* ARTICLE BODY */}

          <main className="article-main">
            <div className="news-container">
              <article className="article-main-card">
                {articleImage ? (
                  <div className="article-cover">
                    <img
                      src={articleImage}
                      alt={selectedArticle.title}
                      onError={(e) => {
                        e.currentTarget.style.display =
                          'none';

                        e.currentTarget.parentElement.classList.add(
                          'article-cover-error'
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="article-cover-placeholder">
                    <span>🏕</span>

                    <strong>
                      MyScout Rwanda
                    </strong>
                  </div>
                )}

                <div className="article-main-body">
                  {selectedArticle.excerpt && (
                    <div className="article-lead">
                      {selectedArticle.excerpt}
                    </div>
                  )}

                  <div className="article-content">
                    {renderArticleContent(
                      selectedArticle
                    )}
                  </div>
                </div>
              </article>
            </div>
          </main>

          {/* RELATED */}

          {relatedNews.length > 0 && (
            <section className="related-news-section">
              <div className="news-container">
                <div className="section-title-row">
                  <div>
                    <span>
                      KEEP READING
                    </span>

                    <h2>
                      Related News
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      navigate('/news')
                    }
                  >
                    View All →
                  </button>
                </div>

                <div className="modern-news-grid">
                  {relatedNews.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SOCIAL */}

          <SocialSection />

          <div className="back-news-bottom">
            <button
              className="gold-button"
              onClick={() =>
                navigate('/news')
              }
            >
              ← Back to All News
            </button>
          </div>
        </div>

        <NewsStyles />
      </>
    );
  }

  // ==========================================================
  // NEWS LIST PAGE
  // ==========================================================

  return (
    <>
      <div className="modern-news-page">
        {/* ====================================================
            PHOTO HERO
        ==================================================== */}

        <section className="news-photo-hero">
          {heroNews.length > 0 ? (
            heroNews.map((item, index) => {
              const image =
                getNewsImage(item);

              const active =
                index === heroIndex;

              return (
                <div
                  key={item.id}
                  className={`hero-slide ${
                    active
                      ? 'hero-slide-active'
                      : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={item.title}
                    className="hero-slide-image"
                  />

                  <div className="hero-dark"></div>

                  <div className="hero-shape"></div>
                </div>
              );
            })
          ) : (
            <div className="hero-fallback"></div>
          )}

          <div className="news-container hero-content">
            <div className="hero-badge">
              MSR NEWS
            </div>

            <h1>
              Stories That
              <br />
              <span>Inspire.</span>
            </h1>

            <p>
              Discover the latest Scout activities,
              community stories, events and
              achievements from MyScout Rwanda.
            </p>

            {featuredArticle && (
              <Link
                to={`/news/${featuredArticle.id}`}
                className="hero-button"
              >
                Read Latest Story
                <span>→</span>
              </Link>
            )}
          </div>

          {/* SLIDER DOTS */}

          {heroNews.length > 1 && (
            <div className="hero-dots">
              {heroNews.map((item, index) => (
                <button
                  key={item.id}
                  className={
                    index === heroIndex
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setHeroIndex(index)
                  }
                  aria-label={`Slide ${
                    index + 1
                  }`}
                />
              ))}
            </div>
          )}

          <div className="hero-bottom-wave"></div>
        </section>

        {/* ====================================================
            LATEST NEWS
        ==================================================== */}

        <section className="latest-section">
          <div className="news-container">
            <div className="latest-heading">
              <div>
                <span className="section-label">
                  MYSCOUT RWANDA
                </span>

                <h2>
                  Latest News
                </h2>

                <p>
                  Stay informed about what is
                  happening across the Scout
                  community.
                </p>
              </div>

              <div className="news-count">
                <strong>
                  {filteredNews.length}
                </strong>

                <span>
                  {filteredNews.length === 1
                    ? 'Story'
                    : 'Stories'}
                </span>
              </div>
            </div>

            {/* SEARCH */}

            <div className="modern-news-tools">
              <div className="modern-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search news, stories or activities..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch('')
                    }
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="category-scroll">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={
                      category === item
                        ? 'category-active'
                        : ''
                    }
                    onClick={() =>
                      setCategory(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="modern-error">
                <div className="error-icon">
                  !
                </div>

                <div>
                  <strong>
                    Unable to load news
                  </strong>

                  <p>{error}</p>
                </div>

                <button
                  onClick={fetchNews}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* FEATURED STORY */}

            {!error &&
              !search &&
              category === 'All' &&
              featuredArticle && (
                <section className="featured-story">
                  <div className="featured-image">
                    {getNewsImage(
                      featuredArticle
                    ) ? (
                      <img
                        src={getNewsImage(
                          featuredArticle
                        )}
                        alt={
                          featuredArticle.title
                        }
                      />
                    ) : (
                      <div className="featured-placeholder">
                        📰
                      </div>
                    )}

                    <div className="featured-badge">
                      FEATURED STORY
                    </div>
                  </div>

                  <div className="featured-content">
                    <div className="featured-category">
                      {getCategory(
                        featuredArticle
                      )}
                    </div>

                    <div className="featured-date">
                      {formatDate(
                        featuredArticle.created_at ||
                          featuredArticle.createdAt ||
                          featuredArticle.date
                      )}
                    </div>

                    <h2>
                      {featuredArticle.title}
                    </h2>

                    <p>
                      {getExcerpt(
                        featuredArticle,
                        260
                      )}
                    </p>

                    <Link
                      to={`/news/${featuredArticle.id}`}
                      className="featured-link"
                    >
                      Read Full Story
                      <span>→</span>
                    </Link>
                  </div>
                </section>
              )}

            {/* RESULTS */}

            {filteredNews.length === 0 ? (
              <div className="modern-empty">
                <div className="empty-symbol">
                  📰
                </div>

                <h2>
                  No News Found
                </h2>

                <p>
                  {news.length === 0
                    ? 'Check back later for news and updates from the Scout community.'
                    : 'Try changing your search or category filter.'}
                </p>

                {(search ||
                  category !== 'All') && (
                  <button
                    className="purple-button"
                    onClick={() => {
                      setSearch('');
                      setCategory('All');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid-heading">
                  <h3>
                    {search
                      ? 'Search Results'
                      : 'More Stories'}
                  </h3>

                  <span>
                    {filteredNews.length}{' '}
                    articles
                  </span>
                </div>

                <div className="modern-news-grid">
                  {filteredNews
                    .slice(
                      search ||
                        category !== 'All'
                        ? 0
                        : 1
                    )
                    .map((item) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ====================================================
            CONNECT
        ==================================================== */}

        <SocialSection />
      </div>

      <NewsStyles />
    </>
  );
};

// ============================================================
// NEWS CARD
// ============================================================

const NewsCard = ({ item }) => {
  const image = getNewsImage(item);

  return (
    <article className="modern-news-card">
      <Link
        to={`/news/${item.id}`}
        className="modern-card-image"
      >
        {image ? (
          <img
            src={image}
            alt={item.title}
            onError={(e) => {
              e.currentTarget.style.display =
                'none';

              e.currentTarget.parentElement.classList.add(
                'modern-card-image-error'
              );
            }}
          />
        ) : (
          <div className="modern-card-placeholder">
            <span>📰</span>

            <small>
              MyScout Rwanda
            </small>
          </div>
        )}

        <span className="modern-card-category">
          {getCategory(item)}
        </span>

        <span className="card-arrow">
          →
        </span>
      </Link>

      <div className="modern-card-content">
        <div className="modern-card-date">
          {formatDate(
            item.created_at ||
              item.createdAt ||
              item.date
          )}
        </div>

        <h2>
          <Link
            to={`/news/${item.id}`}
          >
            {item.title}
          </Link>
        </h2>

        <p>
          {getExcerpt(item, 145)}
        </p>

        <Link
          to={`/news/${item.id}`}
          className="modern-read-more"
        >
          Read More
          <span>→</span>
        </Link>
      </div>
    </article>
  );
};

// ============================================================
// SOCIAL SECTION
// ============================================================

const SocialSection = () => (
  <section className="social-section">
    <div className="news-container">
      <div className="social-heading">
        <span>
          FOLLOW MSR
        </span>

        <h2>
          Stay Connected
        </h2>

        <p>
          Follow MyScout Rwanda for more
          Scout stories, activities, videos
          and community updates.
        </p>
      </div>

      <div className="social-grid">
        {SCOUT_PLATFORMS.map(
          (platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-card ${platform.className}`}
            >
              <div className="social-icon">
                {platform.icon}
              </div>

              <div>
                <h3>
                  {platform.name}
                </h3>

                <p>
                  {platform.description}
                </p>

                <strong>
                  {platform.action}
                  <span> →</span>
                </strong>
              </div>
            </a>
          )
        )}
      </div>
    </div>
  </section>
);

// ============================================================
// COMPLETE CSS
// ============================================================

const NewsStyles = () => (
  <style>{`
/* ============================================================
   GLOBAL
============================================================ */

.modern-news-page {
  min-height: 100vh;
  background: ${SCOUT.gray50};
  color: ${SCOUT.black};
  overflow-x: hidden;
}

.modern-news-page *,
.modern-news-page *::before,
.modern-news-page *::after {
  box-sizing: border-box;
}

.news-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

button,
input {
  font-family: inherit;
}

/* ============================================================
   PHOTO HERO
============================================================ */

.news-photo-hero {
  position: relative;
  min-height: 620px;
  height: min(680px, 78vh);
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blueDark},
      ${SCOUT.purpleDark}
    );
}

.hero-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 1.2s ease,
    visibility 1.2s ease;
}

.hero-slide-active {
  opacity: 1;
  visibility: visible;
}

.hero-slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.05);
  transition:
    transform 7s ease;
}

.hero-slide-active .hero-slide-image {
  transform: scale(1);
}

.hero-dark {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(0, 27, 58, 0.92) 0%,
      rgba(0, 43, 92, 0.72) 38%,
      rgba(74, 20, 140, 0.25) 75%,
      rgba(0, 0, 0, 0.15) 100%
    );
}

.hero-shape {
  position: absolute;
  right: -8%;
  top: -20%;
  width: 55%;
  height: 150%;
  background:
    linear-gradient(
      135deg,
      rgba(106, 27, 154, 0.72),
      rgba(106, 27, 154, 0.05)
    );
  transform: rotate(8deg);
}

.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  min-height: 620px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 17px;
  border-radius: 30px;
  background: ${SCOUT.gold};
  color: ${SCOUT.blue};
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 1.5px;
  margin-bottom: 20px;
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.15);
}

.hero-badge::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${SCOUT.purple};
}

.hero-content h1 {
  margin: 0;
  max-width: 720px;
  color: white;
  font-size: clamp(3.2rem, 7vw, 6.3rem);
  line-height: 0.98;
  letter-spacing: -3px;
  font-weight: 900;
}

.hero-content h1 span {
  color: ${SCOUT.gold};
}

.hero-content p {
  max-width: 610px;
  margin: 24px 0 30px;
  color: rgba(255,255,255,0.88);
  font-size: 18px;
  line-height: 1.75;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 15px 22px;
  border-radius: 10px;
  background: ${SCOUT.gold};
  color: ${SCOUT.blue};
  text-decoration: none;
  font-weight: 900;
  font-size: 14px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.hero-button span {
  font-size: 20px;
  transition: transform 0.25s ease;
}

.hero-button:hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 28px rgba(0,0,0,0.25);
}

.hero-button:hover span {
  transform: translateX(4px);
}

.hero-dots {
  position: absolute;
  z-index: 10;
  left: 50%;
  bottom: 55px;
  transform: translateX(-50%);
  display: flex;
  gap: 9px;
}

.hero-dots button {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 20px;
  background: rgba(255,255,255,0.45);
  cursor: pointer;
  transition:
    width 0.3s ease,
    background 0.3s ease;
}

.hero-dots button.active {
  width: 30px;
  background: ${SCOUT.gold};
}

.hero-bottom-wave {
  position: absolute;
  z-index: 8;
  bottom: -1px;
  left: -5%;
  width: 110%;
  height: 45px;
  background: ${SCOUT.gray50};
  clip-path:
    ellipse(58% 100% at 50% 100%);
}

/* ============================================================
   LATEST
============================================================ */

.latest-section {
  padding: 78px 0 95px;
  background: ${SCOUT.gray50};
}

.latest-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 35px;
}

.section-label,
.social-heading > span {
  display: inline-block;
  color: ${SCOUT.purple};
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 2px;
}

.latest-heading h2 {
  margin: 8px 0 7px;
  color: ${SCOUT.blue};
  font-size: clamp(2.1rem, 4vw, 3rem);
  letter-spacing: -1px;
}

.latest-heading p {
  margin: 0;
  color: ${SCOUT.gray500};
  font-size: 15px;
  line-height: 1.6;
}

.news-count {
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  border-left: 3px solid ${SCOUT.gold};
  padding-left: 18px;
}

.news-count strong {
  color: ${SCOUT.purple};
  font-size: 32px;
  line-height: 1;
}

.news-count span {
  margin-top: 5px;
  color: ${SCOUT.gray500};
  font-size: 12px;
  font-weight: 700;
}

/* ============================================================
   SEARCH
============================================================ */

.modern-news-tools {
  margin-bottom: 38px;
}

.modern-search {
  max-width: 720px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  border-radius: 13px;
  padding: 0 17px;
  box-shadow:
    0 5px 20px rgba(0,0,0,0.04);
}

.modern-search > span {
  color: ${SCOUT.purple};
  font-size: 29px;
  line-height: 1;
  transform: rotate(-20deg);
}

.modern-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: ${SCOUT.black};
  font-size: 14px;
}

.modern-search input::placeholder {
  color: ${SCOUT.gray400};
}

.modern-search button {
  width: 29px;
  height: 29px;
  border: 0;
  border-radius: 50%;
  background: ${SCOUT.gray100};
  color: ${SCOUT.gray600};
  cursor: pointer;
  font-size: 18px;
}

.category-scroll {
  display: flex;
  gap: 9px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 5px;
  scrollbar-width: thin;
}

.category-scroll button {
  flex: 0 0 auto;
  border: 1px solid ${SCOUT.gray200};
  border-radius: 30px;
  background: white;
  color: ${SCOUT.gray600};
  padding: 9px 17px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.category-scroll button:hover {
  border-color: ${SCOUT.purple};
  color: ${SCOUT.purple};
}

.category-scroll button.category-active {
  border-color: ${SCOUT.purple};
  background: ${SCOUT.purple};
  color: white;
}

/* ============================================================
   FEATURED STORY
============================================================ */

.featured-story {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  min-height: 390px;
  margin-bottom: 65px;
  overflow: hidden;
  border-radius: 20px;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  box-shadow:
    0 12px 35px rgba(0,0,0,0.08);
}

.featured-image {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blue},
      ${SCOUT.purple}
    );
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.featured-story:hover .featured-image img {
  transform: scale(1.04);
}

.featured-badge {
  position: absolute;
  left: 20px;
  top: 20px;
  padding: 8px 13px;
  border-radius: 30px;
  background: ${SCOUT.gold};
  color: ${SCOUT.blue};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
}

.featured-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 45px;
}

.featured-category {
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 11px;
  border-radius: 20px;
  background: ${SCOUT.purpleLight};
  color: ${SCOUT.purple};
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.featured-date {
  color: ${SCOUT.gray400};
  font-size: 11px;
  margin-bottom: 13px;
}

.featured-content h2 {
  margin: 0 0 15px;
  color: ${SCOUT.blue};
  font-size: clamp(1.6rem, 3vw, 2.35rem);
  line-height: 1.2;
  letter-spacing: -0.6px;
}

.featured-content p {
  margin: 0 0 25px;
  color: ${SCOUT.gray500};
  font-size: 14px;
  line-height: 1.75;
}

.featured-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  align-self: flex-start;
  color: ${SCOUT.purple};
  text-decoration: none;
  font-size: 13px;
  font-weight: 900;
}

.featured-link span {
  font-size: 20px;
  transition: transform 0.2s ease;
}

.featured-link:hover span {
  transform: translateX(5px);
}

/* ============================================================
   GRID HEADING
============================================================ */

.grid-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.grid-heading h3 {
  margin: 0;
  color: ${SCOUT.blue};
  font-size: 23px;
}

.grid-heading span {
  color: ${SCOUT.gray500};
  font-size: 12px;
}

/* ============================================================
   NEWS GRID
============================================================ */

.modern-news-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.modern-news-card {
  overflow: hidden;
  border-radius: 16px;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  box-shadow:
    0 5px 18px rgba(0,0,0,0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.modern-news-card:hover {
  transform: translateY(-7px);
  box-shadow:
    0 17px 35px rgba(106,27,154,0.14);
}

.modern-card-image {
  position: relative;
  height: 220px;
  display: block;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blue},
      ${SCOUT.purple}
    );
}

.modern-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.modern-news-card:hover
.modern-card-image img {
  transform: scale(1.07);
}

.modern-card-category {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 11px;
  border-radius: 30px;
  background: ${SCOUT.gold};
  color: ${SCOUT.blue};
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.card-arrow {
  position: absolute;
  right: 15px;
  bottom: 15px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: white;
  color: ${SCOUT.purple};
  font-size: 19px;
  opacity: 0;
  transform: translateY(8px);
  transition: 0.25s ease;
  box-shadow:
    0 5px 15px rgba(0,0,0,0.18);
}

.modern-news-card:hover
.card-arrow {
  opacity: 1;
  transform: translateY(0);
}

.modern-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.modern-card-placeholder span {
  font-size: 48px;
}

.modern-card-placeholder small {
  margin-top: 8px;
  opacity: 0.75;
}

.modern-card-image-error {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-card-content {
  padding: 22px;
}

.modern-card-date {
  color: ${SCOUT.gray400};
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 9px;
}

.modern-card-content h2 {
  margin: 0 0 10px;
}

.modern-card-content h2 a {
  color: ${SCOUT.blue};
  text-decoration: none;
  font-size: 19px;
  line-height: 1.35;
  transition: color 0.2s ease;
}

.modern-card-content h2 a:hover {
  color: ${SCOUT.purple};
}

.modern-card-content p {
  margin: 0 0 18px;
  color: ${SCOUT.gray500};
  font-size: 13px;
  line-height: 1.7;
}

.modern-read-more {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: ${SCOUT.purple};
  text-decoration: none;
  font-size: 12px;
  font-weight: 900;
}

.modern-read-more span {
  font-size: 18px;
  transition: transform 0.2s ease;
}

.modern-read-more:hover span {
  transform: translateX(5px);
}

/* ============================================================
   EMPTY
============================================================ */

.modern-empty {
  padding: 80px 20px;
  text-align: center;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  border-radius: 18px;
}

.empty-symbol {
  width: 82px;
  height: 82px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${SCOUT.purpleLight};
  font-size: 38px;
}

.modern-empty h2 {
  margin: 0 0 8px;
  color: ${SCOUT.blue};
}

.modern-empty p {
  max-width: 500px;
  margin: 0 auto 23px;
  color: ${SCOUT.gray500};
  line-height: 1.7;
}

.purple-button,
.gold-button {
  border: 0;
  padding: 13px 21px;
  border-radius: 9px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
}

.purple-button {
  background: ${SCOUT.purple};
  color: white;
}

.gold-button {
  background: ${SCOUT.gold};
  color: ${SCOUT.blue};
}

.purple-button:hover,
.gold-button:hover {
  transform: translateY(-2px);
}

/* ============================================================
   ERROR
============================================================ */

.modern-error {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding: 18px;
  border-radius: 13px;
  background: #FFF5F5;
  border: 1px solid #F3C4C4;
}

.error-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${SCOUT.red};
  color: white;
  font-weight: 900;
}

.modern-error strong {
  color: ${SCOUT.red};
}

.modern-error p {
  margin: 3px 0 0;
  color: ${SCOUT.gray600};
  font-size: 12px;
}

.modern-error button {
  margin-left: auto;
  border: 0;
  border-radius: 8px;
  background: ${SCOUT.red};
  color: white;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 800;
}

/* ============================================================
   SOCIAL
============================================================ */

.social-section {
  padding: 80px 0;
  background:
    linear-gradient(
      135deg,
      #F7F0FA,
      white
    );
  border-top: 1px solid ${SCOUT.gray200};
}

.social-heading {
  text-align: center;
  max-width: 650px;
  margin: 0 auto 38px;
}

.social-heading h2 {
  margin: 9px 0 10px;
  color: ${SCOUT.blue};
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.social-heading p {
  margin: 0;
  color: ${SCOUT.gray500};
  font-size: 14px;
  line-height: 1.7;
}

.social-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.social-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 18px;
  border-radius: 14px;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  text-decoration: none;
  transition: 0.25s ease;
}

.social-card:hover {
  transform: translateY(-4px);
  border-color: ${SCOUT.purple};
  box-shadow:
    0 10px 25px rgba(106,27,154,0.1);
}

.social-icon {
  width: 52px;
  height: 52px;
  min-width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: ${SCOUT.purpleLight};
  color: ${SCOUT.purple};
  font-size: 23px;
  font-weight: 900;
}

.social-card h3 {
  margin: 0 0 4px;
  color: ${SCOUT.blue};
  font-size: 16px;
}

.social-card p {
  margin: 0 0 7px;
  color: ${SCOUT.gray500};
  font-size: 11px;
  line-height: 1.45;
}

.social-card strong {
  color: ${SCOUT.purple};
  font-size: 11px;
}

.social-card.youtube .social-icon {
  background: #FFF0F0;
  color: #FF0000;
}

.social-card.x .social-icon {
  background: #F1F1F1;
  color: #000;
}

.social-card.facebook .social-icon {
  background: #EEF4FF;
  color: #1877F2;
}

.social-card.instagram .social-icon {
  background: #FFF0F5;
  color: #C13584;
}

.social-card.tiktok .social-icon {
  background: #F1F1F1;
  color: #111;
}

.social-card.website .social-icon {
  background: ${SCOUT.blueLight};
  color: ${SCOUT.blue};
}

/* ============================================================
   ARTICLE HERO
============================================================ */

.article-top {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blueDark},
      ${SCOUT.purpleDark}
    );
  color: white;
  padding: 65px 0 75px;
}

.article-top::after {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  right: -180px;
  top: -280px;
  border-radius: 50%;
  background:
    rgba(255,209,0,0.08);
}

.article-top-inner {
  position: relative;
  z-index: 2;
}

.article-back {
  border: 0;
  background: transparent;
  color: ${SCOUT.gold};
  padding: 0;
  margin-bottom: 25px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.article-back:hover {
  color: white;
}

.article-label {
  display: inline-block;
  margin-bottom: 15px;
  padding: 7px 13px;
  border-radius: 30px;
  background: rgba(255,255,255,0.13);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.article-top h1 {
  max-width: 920px;
  margin: 0 0 20px;
  color: white;
  font-size: clamp(2.1rem, 5vw, 4.4rem);
  line-height: 1.08;
  letter-spacing: -1.5px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  color: rgba(255,255,255,0.78);
  font-size: 13px;
}

/* ============================================================
   ARTICLE BODY
============================================================ */

.article-main {
  padding: 65px 0;
  background: ${SCOUT.gray50};
}

.article-main-card {
  max-width: 930px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 20px;
  background: white;
  border: 1px solid ${SCOUT.gray200};
  box-shadow:
    0 12px 35px rgba(0,0,0,0.07);
}

.article-cover {
  width: 100%;
  max-height: 560px;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blue},
      ${SCOUT.purple}
    );
}

.article-cover img {
  width: 100%;
  max-height: 560px;
  object-fit: cover;
  display: block;
}

.article-cover-placeholder {
  height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blue},
      ${SCOUT.purple}
    );
  color: white;
}

.article-cover-placeholder span {
  font-size: 65px;
  margin-bottom: 10px;
}

.article-main-body {
  padding: 45px;
}

.article-lead {
  margin-bottom: 28px;
  padding-bottom: 27px;
  border-bottom: 1px solid ${SCOUT.gray200};
  color: ${SCOUT.blue};
  font-size: 19px;
  font-weight: 600;
  line-height: 1.75;
}

.article-content {
  color: ${SCOUT.gray600};
  font-size: 16px;
  line-height: 1.95;
}

.article-content p {
  margin: 0 0 22px;
}

.article-content h1,
.article-content h2,
.article-content h3 {
  color: ${SCOUT.blue};
  margin-top: 35px;
  margin-bottom: 13px;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
}

.article-content a {
  color: ${SCOUT.purple};
  font-weight: 800;
}

.article-no-content {
  color: ${SCOUT.gray500};
  text-align: center;
}

/* ============================================================
   RELATED
============================================================ */

.related-news-section {
  padding: 75px 0;
  background: white;
}

.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}

.section-title-row span {
  color: ${SCOUT.purple};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.section-title-row h2 {
  margin: 7px 0 0;
  color: ${SCOUT.blue};
  font-size: 29px;
}

.section-title-row button {
  border: 0;
  background: transparent;
  color: ${SCOUT.purple};
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
}

/* ============================================================
   BACK BUTTON
============================================================ */

.back-news-bottom {
  padding: 5px 0 75px;
  text-align: center;
  background: white;
}

/* ============================================================
   ARTICLE NOT FOUND
============================================================ */

.article-not-found {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 70px 20px;
  background:
    linear-gradient(
      135deg,
      ${SCOUT.blueDark},
      ${SCOUT.purpleDark}
    );
}

.article-not-found-inner {
  max-width: 620px;
  padding: 50px;
  text-align: center;
  border-radius: 22px;
  background: white;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.2);
}

.not-found-icon {
  font-size: 55px;
  margin-bottom: 10px;
}

.small-label {
  color: ${SCOUT.purple};
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 2px;
}

.article-not-found h1 {
  margin: 10px 0;
  color: ${SCOUT.blue};
}

.article-not-found p {
  margin: 0 auto 25px;
  color: ${SCOUT.gray500};
  line-height: 1.7;
}

/* ============================================================
   LOADING
============================================================ */

.modern-news-loading {
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: ${SCOUT.gray50};
}

.loading-ring {
  width: 55px;
  height: 55px;
  border: 5px solid ${SCOUT.purpleLight};
  border-top-color: ${SCOUT.purple};
  border-radius: 50%;
  animation:
    msrNewsSpin 0.8s linear infinite;
}

.modern-news-loading h3 {
  margin: 20px 0 5px;
  color: ${SCOUT.blue};
}

.modern-news-loading p {
  margin: 0;
  color: ${SCOUT.gray500};
}

@keyframes msrNewsSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   TABLET
============================================================ */

@media (max-width: 1000px) {
  .modern-news-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .social-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .featured-story {
    grid-template-columns: 1fr;
  }

  .featured-image {
    min-height: 350px;
  }
}

/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 700px) {
  .news-container {
    padding-left: 16px;
    padding-right: 16px;
  }

  .news-photo-hero {
    min-height: 590px;
    height: 78vh;
  }

  .hero-content {
    min-height: 590px;
  }

  .hero-dark {
    background:
      linear-gradient(
        90deg,
        rgba(0,27,58,0.9),
        rgba(74,20,140,0.55)
      );
  }

  .hero-content h1 {
    font-size: 3.35rem;
    letter-spacing: -2px;
  }

  .hero-content p {
    max-width: 500px;
    font-size: 15px;
  }

  .latest-section {
    padding: 55px 0 65px;
  }

  .latest-heading {
    align-items: flex-start;
  }

  .news-count {
    display: none;
  }

  .modern-news-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .modern-card-image {
    height: 230px;
  }

  .featured-content {
    padding: 28px 23px;
  }

  .featured-image {
    min-height: 270px;
  }

  .social-section {
    padding: 60px 0;
  }

  .social-grid {
    grid-template-columns: 1fr;
  }

  .article-top {
    padding: 45px 0 55px;
  }

  .article-top h1 {
    font-size: 2.1rem;
  }

  .article-main {
    padding: 35px 0;
  }

  .article-main-body {
    padding: 27px 20px;
  }

  .article-content {
    font-size: 15px;
  }

  .article-cover-placeholder {
    height: 250px;
  }

  .section-title-row {
    align-items: flex-start;
    gap: 15px;
  }

  .section-title-row h2 {
    font-size: 25px;
  }

  .modern-error {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .modern-error button {
    margin-left: 53px;
  }
}

/* ============================================================
   SMALL MOBILE
============================================================ */

@media (max-width: 420px) {
  .hero-content h1 {
    font-size: 2.9rem;
  }

  .hero-content p {
    font-size: 14px;
  }

  .hero-button {
    padding: 13px 17px;
  }

  .featured-image {
    min-height: 230px;
  }

  .featured-content h2 {
    font-size: 1.55rem;
  }

  .modern-card-image {
    height: 205px;
  }

  .social-card {
    padding: 14px;
  }

  .social-icon {
    width: 47px;
    height: 47px;
    min-width: 47px;
  }

  .article-not-found-inner {
    padding: 35px 20px;
  }
}
  `}</style>
);

export default News;
