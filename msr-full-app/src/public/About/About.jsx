// src/public/About/About.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'ABOUT MSR RWANDA',
      title: 'MyScout Rwanda',
      subtitle: 'Empowering young people through Scouting, technology, and community service to build a better Rwanda.',
      joinBtn: 'Join the Movement',
      learnBtn: 'Learn More',
      cards: [
        { icon: '🏕️', title: 'Rwanda Scout Association', desc: 'History, Mission & Vision of RSA' },
        { icon: '🏛️', title: 'Organization Structure', desc: 'Leadership & governance' },
        { icon: '🤝', title: 'Partners & Donate', desc: 'Support the movement' },
        { icon: '👥', title: 'Membership', desc: 'Join the Scout community' },
        { icon: '💻', title: 'MSR Development Team', desc: 'The team behind the platform' }
      ]
    },
    kin: {
      eyebrow: 'IBIJYEYE MSR RWANDA',
      title: 'MyScout Rwanda',
      subtitle: 'Gutera imbere ku rubyiruko binyuze mu buhanga, ubumenyi n\'umurimo w\'abaturage.',
      joinBtn: 'Ishyirahamwe',
      learnBtn: 'Menya byinshi',
      cards: [
        { icon: '🏕️', title: 'Ishyirahamwe ry\'Abaskuti', desc: 'Amateka, Intego n\'Ihame' },
        { icon: '🏛️', title: 'Imiterere y\'Ishyirahamwe', desc: 'Ubuyobozi n\'imiyoborere' },
        { icon: '🤝', title: 'Abafatanyabikorwa', desc: 'Gutera inkunga' },
        { icon: '👥', title: 'Kuba Umunyamuryango', desc: 'Ishyirahamwe rya Skouti' },
        { icon: '💻', title: 'Itsinda rya MSR', desc: 'Abakoze urubuga' }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="about-page">
      {/* Language Switcher */}
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      {/* Hero */}
      <section className="about-hero">
        <div className="about-container">
          <span className="about-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <div className="about-hero-buttons">
            <Link to="/register" className="about-btn primary">{t.joinBtn}</Link>
            <Link to="/about/rsa" className="about-btn secondary">{t.learnBtn}</Link>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-grid">
            {t.cards.map((card, index) => (
              <Link to={`/about/${card.title.toLowerCase().replace(/\s/g, '-')}`} className="about-card" key={index}>
                <span className="about-card-icon">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .about-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .about-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

        /* Language Switcher */
        .lang-switcher {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #e8d5f0;
          position: sticky;
          top: 0;
          z-index: 100;
          flex-wrap: wrap;
        }
        .lang-switcher button {
          padding: 6px 16px;
          border: 1px solid #6A1B9A;
          border-radius: 20px;
          background: white;
          color: #6A1B9A;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }
        .lang-switcher button:hover {
          background: #f0eaf5;
        }
        .lang-switcher button.active {
          background: #6A1B9A;
          color: white;
        }

        /* Hero */
        .about-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 80px 20px;
          text-align: center;
          color: white;
        }
        .about-hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 12px 0; font-weight: 700; }
        .about-hero p { font-size: clamp(1rem, 2vw, 1.2rem); max-width: 600px; margin: 0 auto 30px; opacity: 0.9; }
        .about-eyebrow {
          display: inline-block;
          background: #FFD100;
          color: #002B5C;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .about-hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .about-btn {
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .about-btn.primary { background: #FFD100; color: #002B5C; }
        .about-btn.primary:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(255,209,0,0.4); }
        .about-btn.secondary { background: transparent; color: white; border: 2px solid white; }
        .about-btn.secondary:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* Cards */
        .about-section { padding: 60px 0; }
        .about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .about-card {
          background: white;
          padding: 30px 24px;
          border-radius: 12px;
          text-decoration: none;
          color: #333;
          text-align: center;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .about-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 8px 30px rgba(106,27,154,0.15);
          border-color: #6A1B9A;
        }
        .about-card-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
        .about-card h3 { color: #002B5C; font-size: 1.1rem; margin: 0 0 6px 0; }
        .about-card p { color: #6B7280; font-size: 0.9rem; margin: 0; }

        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr 1fr; }
          .about-hero { padding: 50px 20px; }
          .lang-switcher { justify-content: center; }
        }
        @media (max-width: 480px) {
          .about-grid { grid-template-columns: 1fr; }
          .about-hero-buttons { flex-direction: column; align-items: center; }
          .about-btn { width: 100%; max-width: 280px; text-align: center; }
        }
      `}</style>
    </div>
  );
};

export default About;