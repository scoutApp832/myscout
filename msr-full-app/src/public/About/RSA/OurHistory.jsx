// src/public/About/RSA/OurHistory.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OurHistory = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'Rwanda Scout Association',
      title: 'Our History',
      subtitle: 'Discover the journey of Scouting in Rwanda from its foundation to today.',
      back: '← Back to About',
      sectionTitle: 'Scouting in Rwanda',
      sectionText: [
        'Scouting in Rwanda is part of a worldwide youth movement that promotes character development, leadership, teamwork, service, responsibility and practical life skills.',
        'Through the Rwanda Scout Association, young people are encouraged to become active members of their communities and to contribute positively to the development of Rwanda.',
        'Over the years, Scouting has continued to create opportunities for young people to learn through experience, participate in community service and develop leadership skills.'
      ],
      timelineTitle: 'Key Milestones',
      milestones: [
        { year: '1993', title: 'Foundation', desc: 'Rwanda Scout Association established, joining WOSM.' },
        { year: '1994', title: 'Rebuilding', desc: 'Scouting played a role in community healing and reconciliation.' },
        { year: '2000', title: 'Expansion', desc: 'Scouting expanded across all 30 districts of Rwanda.' },
        { year: '2010', title: 'Community Impact', desc: 'Focus on community development and environmental projects.' },
        { year: '2020', title: 'Digital Transformation', desc: 'MyScout Rwanda (MSR) platform launched.' },
        { year: '2024', title: 'Present Day', desc: 'MSR continues to empower thousands of young people.' }
      ]
    },
    kin: {
      eyebrow: 'Ishyirahamwe ry\'Abaskuti mu Rwanda',
      title: 'Amateka',
      subtitle: 'Menya amateka ya Skouti mu Rwanda kuva yatangira kugeza ubu.',
      back: '← Subira ku Ibijyeyo',
      sectionTitle: 'Skouti mu Rwanda',
      sectionText: [
        'Skouti mu Rwanda ni umutwe mpuzamahanga w\'urubyiruko utera imbere imico, ubuyobozi, gukorera hamwe, gukora ibikorwa by\'abaturage n\'ubumenyi.',
        'Binyuze mu Ishyirahamwe ry\'Abaskuti mu Rwanda, urubyiruko rurashishikarizwa kugira uruhare mu iterambere ry\'u Rwanda.',
        'Ubu Skouti ikomeje guha urubyiruko amahirwe yo kwiga binyuze mu by\'umwuga, gukorera abaturage no guteza imbere ubumenyi bw\'ubuyobozi.'
      ],
      timelineTitle: 'Ibikorwa by\'Ingirakamaro',
      milestones: [
        { year: '1993', title: 'Gushingwa', desc: 'Ishyirahamwe ry\'Abaskuti mu Rwanda ryashinzwe, rihuza na WOSM.' },
        { year: '1994', title: 'Kuvugurura', desc: 'Skouti yagize uruhare mu kuvugurura abaturage no kubana.' },
        { year: '2000', title: 'Kwaguka', desc: 'Skouti yakwirakwiriye mu turere 30 tw\'u Rwanda.' },
        { year: '2010', title: 'Ingaruka ku Baturage', desc: 'Hibandwa ku iterambere ry\'abaturage n\'ibidukikije.' },
        { year: '2020', title: 'Kuvugurura Ikoranabuhanga', desc: 'Urubuga MyScout Rwanda (MSR) rwashyizweho.' },
        { year: '2024', title: 'Ubu', desc: 'MSR ikomeje guteza imbere ibibiri by\'urubyiruko.' }
      ]
    }
  };

  const t = content[language];

  return (
    <div className="history-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="history-hero">
        <div className="history-container">
          <Link to="/about" className="history-back">{t.back}</Link>
          <span className="history-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="history-section">
        <div className="history-container">
          <div className="history-content">
            <div className="history-text">
              <h2>{t.sectionTitle}</h2>
              {t.sectionText.map((text, i) => <p key={i}>{text}</p>)}
            </div>
            <div className="history-image">
              <div className="history-logo"><span>🏕️</span><p>RSA</p></div>
            </div>
          </div>

          <div className="history-timeline">
            <h2>{t.timelineTitle}</h2>
            <div className="history-timeline-items">
              {t.milestones.map((item, i) => (
                <div className="history-timeline-item" key={i}>
                  <span className="history-timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .history-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .history-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

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

        .history-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .history-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .history-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .history-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .history-back:hover { text-decoration: underline; }
        .history-eyebrow {
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

        .history-section { padding: 50px 0; }
        .history-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          align-items: center;
          margin-bottom: 50px;
        }
        .history-text h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin-top: 0; }
        .history-text p { color: #4B5563; line-height: 1.8; }
        .history-logo {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          border-radius: 12px;
          padding: 60px 30px;
          text-align: center;
          color: white;
        }
        .history-logo span { font-size: 4rem; display: block; margin-bottom: 12px; }
        .history-logo p { font-size: 1.1rem; font-weight: 600; margin: 0; }

        .history-timeline h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin-bottom: 30px; }
        .history-timeline-items {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .history-timeline-item {
          background: white;
          padding: 24px;
          border-radius: 10px;
          border-left: 4px solid #6A1B9A;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .history-timeline-year {
          display: inline-block;
          background: #6A1B9A;
          color: white;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .history-timeline-item h3 { color: #002B5C; margin: 8px 0 4px 0; }
        .history-timeline-item p { color: #6B7280; margin: 0; }

        @media (max-width: 768px) {
          .history-content { grid-template-columns: 1fr; }
          .history-timeline-items { grid-template-columns: 1fr; }
          .lang-switcher { justify-content: center; }
          .history-hero { padding: 40px 20px; }
        }
        @media (max-width: 480px) {
          .history-logo { padding: 40px 20px; }
          .history-logo span { font-size: 3rem; }
        }
      `}</style>
    </div>
  );
};

export default OurHistory;