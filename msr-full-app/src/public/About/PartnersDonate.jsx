// src/public/About/PartnersDonate.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PartnersDonate = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'PARTNERSHIP & SUPPORT',
      title: 'Partners & Donate',
      subtitle: 'Strong partnerships help us create more opportunities for young people and communities.',
      partnersTitle: 'Working Together for Impact',
      partnersDesc: 'We welcome organizations, institutions, companies, development partners and individuals who share our commitment to youth development and community service.',
      partners: [
        { icon: '🏢', title: 'Organizations', desc: 'Partner with us on youth development and community programs.' },
        { icon: '🎓', title: 'Education', desc: 'Support learning, leadership and skills development programs.' },
        { icon: '💼', title: 'Businesses', desc: 'Support Scout projects through sponsorship and corporate partnerships.' },
        { icon: '🌍', title: 'Development Partners', desc: 'Collaborate on sustainable development and community initiatives.' }
      ],
      donateEyebrow: 'SUPPORT SCOUTING',
      donateTitle: 'Make a Difference Today',
      donateDesc: 'Your contribution can support Scout training, community projects, environmental activities, youth leadership and educational programs.',
      donateBtn: 'Become a Supporter',
      contactBtn: 'Contact Us',
      supportTitle: 'Areas You Can Support',
      supportItems: ['🎓 Scout Education', '🌱 Environmental Projects', '🤝 Community Service', '🏕️ Scout Camps', '💻 Digital Transformation', '👨‍👩‍👧 Youth Development']
    },
    kin: {
      eyebrow: 'UBUFATANYABIKORWA N\'INKUNGA',
      title: 'Abafatanyabikorwa n\'Inkunga',
      subtitle: 'Ubufatanyabikorwa bukomeye budufasha guha amahirwe menshi urubyiruko n\'abaturage.',
      partnersTitle: 'Gukorera Hamwe kugira Ngo Dute Imbere',
      partnersDesc: 'Twakira amashyirahamwe, ibigo, amasosiyete, abafatanyabikorwa mu iterambere n\'abantu bavuga ko bashyigikira iterambere ry\'urubyiruko n\'umurimo w\'abaturage.',
      partners: [
        { icon: '🏢', title: 'Amashyirahamwe', desc: 'Korana natwe mu gushyigikira urubyiruko n\'abaturage.' },
        { icon: '🎓', title: 'Uburezi', desc: 'Gushyigikira kwiga, ubuyobozi n\'ubumenyi.' },
        { icon: '💼', title: 'Amasosiyete', desc: 'Gushyigikira imishinga ya Skouti binyuze mu inkunga.' },
        { icon: '🌍', title: 'Abafatanyabikorwa', desc: 'Korana ku bikorwa by\'iterambere rirambye.' }
      ],
      donateEyebrow: 'GUSHYIGIKIRA SKOUTI',
      donateTitle: 'Tera Imbere Uyu Munsi',
      donateDesc: 'Inkunga yawe ishobora gufasha amahugurwa ya Skouti, imishinga y\'abaturage, ibikorwa by\'ibidukikije, ubuyobozi bw\'urubyiruko n\'ubumenyi.',
      donateBtn: 'Kuba Umunyamuryango',
      contactBtn: 'Twandikire',
      supportTitle: 'Ibishobora Gushyigikirwa',
      supportItems: ['🎓 Uburezi bwa Skouti', '🌱 Imishinga y\'Ibidukikije', '🤝 Gukorera Abaturage', '🏕️ Amakambi ya Skouti', '💻 Iterambere ry\'Ikoranabuhanga', '👨‍👩‍👧 Iterambere ry\'Urubyiruko']
    }
  };

  const t = content[language];

  return (
    <div className="partners-page">
      {/* Language Switcher */}
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      {/* Hero */}
      <section className="partners-hero">
        <div className="partners-container">
          <Link to="/about" className="partners-back">← {language === 'en' ? 'Back to About' : 'Subira ku Ibijyeyo'}</Link>
          <span className="partners-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="partners-container">
          <div className="partners-heading">
            <span className="partners-label">🤝 {language === 'en' ? 'PARTNERS' : 'ABAFATANYABIKORWA'}</span>
            <h2>{t.partnersTitle}</h2>
            <p>{t.partnersDesc}</p>
          </div>

          <div className="partners-grid">
            {t.partners.map((partner, index) => (
              <div className="partners-card" key={index}>
                <span className="partners-card-icon">{partner.icon}</span>
                <h3>{partner.title}</h3>
                <p>{partner.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donate Section */}
      <section className="donate-section">
        <div className="donate-container">
          <div className="donate-content">
            <div className="donate-text">
              <span className="donate-eyebrow">{t.donateEyebrow}</span>
              <h2>{t.donateTitle}</h2>
              <p>{t.donateDesc}</p>
            </div>
            <div className="donate-actions">
              <Link to="/register" className="donate-btn primary">
                <span>❤️</span> {t.donateBtn}
              </Link>
              <Link to="/contact" className="donate-btn secondary">
                {t.contactBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support Areas */}
      <section className="support-section">
        <div className="support-container">
          <div className="support-heading">
            <span className="support-label">📋 {language === 'en' ? 'WHERE SUPPORT GOES' : 'AHO INKUNGA IGIJA'}</span>
            <h2>{t.supportTitle}</h2>
          </div>

          <div className="support-grid">
            {t.supportItems.map((item, index) => (
              <div className="support-item" key={index}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .partners-page {
          background: #f8f9fa;
          min-height: calc(100vh - 200px);
        }
        .partners-container, .donate-container, .support-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

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
        .lang-switcher button:hover { background: #f0eaf5; }
        .lang-switcher button.active { background: #6A1B9A; color: white; }

        /* Hero */
        .partners-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .partners-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          margin: 8px 0;
        }
        .partners-hero p {
          font-size: clamp(0.95rem, 1.5vw, 1.1rem);
          opacity: 0.9;
          max-width: 600px;
        }
        .partners-back {
          color: #FFD100;
          text-decoration: none;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 16px;
        }
        .partners-back:hover { text-decoration: underline; }
        .partners-eyebrow {
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

        /* Partners Section */
        .partners-section { padding: 50px 0; }
        .partners-heading {
          text-align: center;
          margin-bottom: 40px;
        }
        .partners-label {
          display: inline-block;
          background: #6A1B9A;
          color: white;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .partners-heading h2 {
          color: #002B5C;
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          margin: 0;
        }
        .partners-heading p {
          color: #6B7280;
          max-width: 700px;
          margin: 8px auto 0;
          line-height: 1.8;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .partners-card {
          background: white;
          padding: 30px 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .partners-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(106,27,154,0.12);
          border-color: #6A1B9A;
        }
        .partners-card-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
        .partners-card h3 { color: #002B5C; margin: 0 0 6px 0; }
        .partners-card p { color: #6B7280; margin: 0; }

        /* Donate Section */
        .donate-section {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px;
          color: white;
        }
        .donate-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          align-items: center;
        }
        .donate-eyebrow {
          display: inline-block;
          background: #FFD100;
          color: #002B5C;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .donate-text h2 {
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          margin: 0 0 12px 0;
        }
        .donate-text p {
          opacity: 0.9;
          line-height: 1.8;
          margin: 0;
        }
        .donate-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .donate-btn {
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
        }
        .donate-btn.primary {
          background: #FFD100;
          color: #002B5C;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .donate-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255,209,0,0.4);
        }
        .donate-btn.secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }
        .donate-btn.secondary:hover {
          background: rgba(255,255,255,0.1);
        }

        /* Support Section */
        .support-section { padding: 50px 0; }
        .support-heading {
          text-align: center;
          margin-bottom: 30px;
        }
        .support-label {
          display: inline-block;
          background: #6A1B9A;
          color: white;
          padding: 3px 14px;
          border-radius: 16px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .support-heading h2 {
          color: #002B5C;
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          margin: 0;
        }

        .support-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .support-item {
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          font-weight: 500;
          color: #002B5C;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .support-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(106,27,154,0.1);
          border-color: #6A1B9A;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lang-switcher { justify-content: center; }
          .partners-hero { padding: 40px 20px; }
          .donate-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .donate-actions {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
          }
          .partners-grid { grid-template-columns: 1fr 1fr; }
          .support-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .partners-grid { grid-template-columns: 1fr; }
          .support-grid { grid-template-columns: 1fr; }
          .donate-btn { width: 100%; justify-content: center; }
          .donate-actions { flex-direction: column; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PartnersDonate;