// src/public/About/RSA/Mission.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Mission = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'Rwanda Scout Association',
      title: 'Our Mission',
      subtitle: 'Empowering young people through Scouting and community service.',
      back: '← Back to About',
      missionTitle: 'Mission Statement',
      missionText: 'To contribute to the education of young people through a value-based system that helps them become responsible, self-reliant and active citizens who contribute positively to their communities and society.',
      pillars: [
        { icon: '👨‍🎓', title: 'Youth Development', desc: 'Supporting young people to develop knowledge, skills and confidence.' },
        { icon: '🚩', title: 'Leadership', desc: 'Preparing young people to become effective leaders.' },
        { icon: '🤝', title: 'Service', desc: 'Encouraging Scouts to serve their communities.' },
        { icon: '🌱', title: 'Community & Environment', desc: 'Promoting responsibility towards communities and nature.' }
      ],
      quote: '"Scouting helps young people learn by doing, lead by serving and grow by working together."'
    },
    kin: {
      eyebrow: 'Ishyirahamwe ry\'Abaskuti mu Rwanda',
      title: 'Intego',
      subtitle: 'Gutera imbere ku rubyiruko binyuze mu buhanga n\'umurimo w\'abaturage.',
      back: '← Subira ku Ibijyeyo',
      missionTitle: 'Intego y\'Ishyirahamwe',
      missionText: 'Gufasha urubyiruko kwiga binyuze mu gahunda y\'indangagaciro igafasha kuba abanyarwanda bakwiye, bishoboye kandi bakorera abaturage.',
      pillars: [
        { icon: '👨‍🎓', title: 'Iterambere ry\'Urubyiruko', desc: 'Gufasha urubyiruko guteza imbere ubumenyi n\'ubushobozi.' },
        { icon: '🚩', title: 'Ubuyobozi', desc: 'Gutegura urubyiruko kuba abayobozi beza.' },
        { icon: '🤝', title: 'Gukorera', desc: 'Gushishikariza Abaskuti gukora ibikorwa by\'abaturage.' },
        { icon: '🌱', title: 'Abaturage n\'Ibidukikije', desc: 'Guteza imbere kwita ku baturage n\'ibidukikije.' }
      ],
      quote: '"Skouti ifasha urubyiruko kwiga binyuze mu bikorwa, kuyobora binyuze mu gukorera no gukura binyuze mu gukorera hamwe."'
    }
  };

  const t = content[language];

  return (
    <div className="mission-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="mission-hero">
        <div className="mission-container">
          <Link to="/about" className="mission-back">{t.back}</Link>
          <span className="mission-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="mission-section">
        <div className="mission-container">
          <div className="mission-box">
            <div className="mission-icon">🎯</div>
            <h2>{t.missionTitle}</h2>
            <p>{t.missionText}</p>
          </div>

          <div className="mission-pillars">
            {t.pillars.map((pillar, i) => (
              <div className="mission-pillar" key={i}>
                <span>{pillar.icon}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
              </div>
            ))}
          </div>

          <div className="mission-quote">
            <p>{t.quote}</p>
          </div>
        </div>
      </section>

      <style>{`
        .mission-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .mission-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

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

        .mission-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .mission-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .mission-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .mission-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .mission-back:hover { text-decoration: underline; }
        .mission-eyebrow {
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

        .mission-section { padding: 50px 0; }
        .mission-box {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          border-left: 5px solid #6A1B9A;
          margin-bottom: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .mission-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
        .mission-box h2 { color: #002B5C; font-size: clamp(1.3rem, 2vw, 1.8rem); margin: 0 0 12px 0; }
        .mission-box p { color: #4B5563; font-size: clamp(0.95rem, 1.2vw, 1.1rem); line-height: 1.8; max-width: 700px; margin: 0 auto; }

        .mission-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .mission-pillar {
          background: white;
          padding: 24px;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #e8d5f0;
        }
        .mission-pillar span { font-size: 2.5rem; display: block; margin-bottom: 8px; }
        .mission-pillar h3 { color: #002B5C; margin: 0 0 6px 0; }
        .mission-pillar p { color: #6B7280; margin: 0; }

        .mission-quote {
          background: #f0eaf5;
          padding: 30px 40px;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #e8d5f0;
        }
        .mission-quote p { font-size: clamp(1rem, 1.5vw, 1.2rem); font-style: italic; color: #002B5C; margin: 0; }

        @media (max-width: 768px) {
          .mission-box { padding: 24px; }
          .mission-pillars { grid-template-columns: 1fr 1fr; }
          .lang-switcher { justify-content: center; }
          .mission-hero { padding: 40px 20px; }
          .mission-quote { padding: 20px; }
        }
        @media (max-width: 480px) {
          .mission-pillars { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Mission;