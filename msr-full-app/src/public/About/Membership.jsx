// src/public/About/Membership.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Membership = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'JOIN THE MOVEMENT',
      title: 'Membership',
      subtitle: 'Become part of the Rwanda Scout community and discover opportunities to learn, lead and serve.',
      whoCanJoin: 'WHO CAN JOIN?',
      joinTitle: 'Scout Membership',
      memberships: [
        { icon: '🎯', title: 'Scout Member', desc: 'Participate in Scout activities, training, events, projects and community service.' },
        { icon: '👥', title: 'Leader', desc: 'Support, guide and develop Scout members through leadership and service.' },
        { icon: '🏕️', title: 'Troop Leader', desc: 'Help coordinate Scout members and activities at troop level.' },
        { icon: '🤝', title: 'Supporter', desc: 'Support the Scout movement through partnerships, volunteering and contributions.' }
      ],
      benefitsLabel: 'BENEFITS',
      benefitsTitle: 'Why Become a Member?',
      benefits: [
        { title: 'Leadership Development', desc: 'Build confidence and leadership skills.' },
        { title: 'Training & Learning', desc: 'Access Scout courses and learning opportunities.' },
        { title: 'Community Service', desc: 'Participate in meaningful community projects.' },
        { title: 'Events & Activities', desc: 'Take part in national, district and troop activities.' },
        { title: 'Scout Community', desc: 'Connect with Scouts and leaders across Rwanda.' },
        { title: 'Digital Membership', desc: 'Manage your Scout information through MSR.' }
      ],
      ctaTitle: 'Ready to Join?',
      ctaDesc: 'Create your MSR account and start your Scout journey.',
      ctaBtn: 'Register Now'
    },
    kin: {
      eyebrow: 'ISHYIRAHAMWE',
      title: 'Kuba Umunyamuryango',
      subtitle: 'Ishyirahamwe ry\'Abaskuti mu Rwanda ritanga amahirwe yo kwiga, kuyobora no gukorera.',
      whoCanJoin: 'NI ANDE USHOBORA KWINJIRA?',
      joinTitle: 'Kuba Umunyamuryango wa Skouti',
      memberships: [
        { icon: '🎯', title: 'Umunyamuryango', desc: 'Gira uruhare mu bikorwa bya Skouti, amahugurwa, ibirori, imishinga n\'umurimo w\'abaturage.' },
        { icon: '👥', title: 'Umuyobozi', desc: 'Fasha, ayobore kandi uteze imbere Abaskuti binyuze mu buyobozi n\'umurimo.' },
        { icon: '🏕️', title: 'Umuyobozi w\'Itsinda', desc: 'Fasha guhuza Abaskuti n\'ibikorwa mu itsinda.' },
        { icon: '🤝', title: 'Umunyantege', desc: 'Gushyigikira Skouti binyuze mu bufatanyabikorwa, gukora ku bushake n\'inkunga.' }
      ],
      benefitsLabel: 'INGORABUZIMA',
      benefitsTitle: 'Kuki Uba Umunyamuryango?',
      benefits: [
        { title: 'Iterambere ry\'Ubuyobozi', desc: 'Kubaka icyizere n\'ubumenyi bw\'ubuyobozi.' },
        { title: 'Amahugurwa n\'Ubumenyi', desc: 'Kubona amahugurwa ya Skouti n\'amahirwe yo kwiga.' },
        { title: 'Gukorera Abaturage', desc: 'Gira uruhare mu mishinga y\'abaturage.' },
        { title: 'Ibirori n\'Ibikorwa', desc: 'Gira uruhare mu bikorwa by\'igihugu, akarere n\'itsinda.' },
        { title: 'Umuryango wa Skouti', desc: 'Huza n\'Abaskuti n\'abayobozi bo mu Rwanda hose.' },
        { title: 'Kuba Umunyamuryango wa MSR', desc: 'Kugenzura amakuru yawe ya Skouti binyuze muri MSR.' }
      ],
      ctaTitle: 'Uteganya Kwinjira?',
      ctaDesc: 'Kora konti yawe ya MSR utangire urugendo rwawe rwa Skouti.',
      ctaBtn: 'Iyandikishe'
    }
  };

  const t = content[language];

  return (
    <div className="membership-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="membership-hero">
        <div className="membership-container">
          <Link to="/about" className="membership-back">← {language === 'en' ? 'Back to About' : 'Subira ku Ibijyeyo'}</Link>
          <span className="membership-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="membership-section">
        <div className="membership-container">
          <div className="membership-heading">
            <span className="membership-label">👥 {t.whoCanJoin}</span>
            <h2>{t.joinTitle}</h2>
          </div>

          <div className="membership-grid">
            {t.memberships.map((item, index) => (
              <div className="membership-card" key={index}>
                <span className="membership-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-heading">
            <span className="benefits-label">⭐ {t.benefitsLabel}</span>
            <h2>{t.benefitsTitle}</h2>
          </div>

          <div className="benefits-grid">
            {t.benefits.map((benefit, index) => (
              <div className="benefit-item" key={index}>
                <span className="benefit-check">✓</span>
                <div>
                  <strong>{benefit.title}</strong>
                  <span>{benefit.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaDesc}</p>
          <Link to="/register" className="cta-btn">{t.ctaBtn}</Link>
        </div>
      </section>

      <style>{`
        .membership-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .membership-container, .benefits-container, .cta-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

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

        .membership-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .membership-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .membership-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .membership-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .membership-back:hover { text-decoration: underline; }
        .membership-eyebrow {
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

        .membership-section { padding: 50px 0; }
        .membership-heading { text-align: center; margin-bottom: 40px; }
        .membership-label {
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
        .membership-heading h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0; }

        .membership-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .membership-card {
          background: white;
          padding: 30px 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .membership-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(106,27,154,0.12);
          border-color: #6A1B9A;
        }
        .membership-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
        .membership-card h3 { color: #002B5C; margin: 0 0 6px 0; }
        .membership-card p { color: #6B7280; margin: 0; }

        .benefits-section { padding: 50px 0; background: white; }
        .benefits-heading { text-align: center; margin-bottom: 30px; }
        .benefits-label {
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
        .benefits-heading h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0; }

        .benefits-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .benefit-item {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e8d5f0;
          align-items: flex-start;
        }
        .benefit-check {
          flex-shrink: 0;
          color: #6A1B9A;
          font-weight: 700;
          font-size: 1.2rem;
        }
        .benefit-item div {
          display: flex;
          flex-direction: column;
        }
        .benefit-item strong { color: #002B5C; }
        .benefit-item span { color: #6B7280; font-size: 0.9rem; }

        .cta-section {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px;
          text-align: center;
          color: white;
        }
        .cta-section h2 { font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0 0 8px 0; }
        .cta-section p { opacity: 0.9; margin-bottom: 24px; }
        .cta-btn {
          display: inline-block;
          background: #FFD100;
          color: #002B5C;
          padding: 14px 40px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255,209,0,0.4);
        }

        @media (max-width: 768px) {
          .lang-switcher { justify-content: center; }
          .membership-hero { padding: 40px 20px; }
          .benefits-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .membership-grid { grid-template-columns: 1fr; }
          .benefit-item { flex-direction: column; align-items: center; text-align: center; }
          .cta-btn { width: 100%; max-width: 280px; }
        }
      `}</style>
    </div>
  );
};

export default Membership;