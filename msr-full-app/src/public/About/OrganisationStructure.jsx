// src/public/About/OrganisationStructure.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OrganisationStructure = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'RSA ORGANIZATION',
      title: 'Organization Structure',
      subtitle: 'Discover how the Scout movement is organized from national to local level.',
      back: '← Back to About',
      national: { title: 'National Level', role: 'National Commissioner', desc: 'Provides national leadership, strategy and coordination.' },
      district: { title: 'District Level', role: 'District Commissioner', desc: 'Coordinates Scout activities and leaders within the district.' },
      unit: { title: 'Unit Level', role: 'Unit Leader', desc: 'Leads and supports Scouts within the local unit.' },
      troop: { title: 'Troop Level', role: 'Troop Leader', desc: 'Coordinates members and activities within the troop.' },
      scouts: { title: 'Scout Members', role: 'Scouts & Members', desc: 'Participate in activities, learning and community projects.' }
    },
    kin: {
      eyebrow: 'IMITERERE Y\'ISHYIRAHAMWE',
      title: 'Imiterere y\'Ishyirahamwe',
      subtitle: 'Menya uko Ishyirahamwe ry\'Abaskuti ritegurwa kuva ku rwego rw\'igihugu kugeza ku karere.',
      back: '← Subira ku Ibijyeyo',
      national: { title: 'Urwego rw\'Igihugu', role: 'Komiseri w\'Igihugu', desc: 'Atanga ubuyobozi, ingamba n\'ubuhuzabikorwa.' },
      district: { title: 'Urwego rw\'Akarere', role: 'Komiseri w\'Akarere', desc: 'Ahuzabikorwa by\'Abaskuti n\'abayobozi mu karere.' },
      unit: { title: 'Urwego rw\'Ishami', role: 'Umuyobozi w\'Ishami', desc: 'Ayobora kandi ashigikira Abaskuti mu ishami.' },
      troop: { title: 'Urwego rw\'Itsinda', role: 'Umuyobozi w\'Itsinda', desc: 'Ahuzabikorwa by\'Abaskuti mu itsinda.' },
      scouts: { title: 'Abaskuti', role: 'Abaskuti n\'Abanyamuryango', desc: 'Bagira uruhare mu bikorwa, kwiga no gukorera abaturage.' }
    }
  };

  const t = content[language];

  return (
    <div className="structure-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="structure-hero">
        <div className="structure-container">
          <Link to="/about" className="structure-back">{t.back}</Link>
          <span className="structure-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="structure-section">
        <div className="structure-container">
          <div className="structure-flow">
            {/* National */}
            <div className="structure-level">
              <div className="structure-card national">
                <span className="structure-icon">🏛️</span>
                <h3>{t.national.title}</h3>
                <p>{t.national.role}</p>
                <small>{t.national.desc}</small>
              </div>
            </div>

            <div className="structure-arrow">↓</div>

            {/* District */}
            <div className="structure-level">
              <div className="structure-card">
                <span className="structure-icon">🏢</span>
                <h3>{t.district.title}</h3>
                <p>{t.district.role}</p>
                <small>{t.district.desc}</small>
              </div>
            </div>

            <div className="structure-arrow">↓</div>

            {/* Unit & Troop */}
            <div className="structure-level structure-two">
              <div className="structure-card">
                <span className="structure-icon">👥</span>
                <h3>{t.unit.title}</h3>
                <p>{t.unit.role}</p>
                <small>{t.unit.desc}</small>
              </div>
              <div className="structure-card">
                <span className="structure-icon">🏕️</span>
                <h3>{t.troop.title}</h3>
                <p>{t.troop.role}</p>
                <small>{t.troop.desc}</small>
              </div>
            </div>

            <div className="structure-arrow">↓</div>

            {/* Scouts */}
            <div className="structure-level">
              <div className="structure-card scout">
                <span className="structure-icon">🎯</span>
                <h3>{t.scouts.title}</h3>
                <p>{t.scouts.role}</p>
                <small>{t.scouts.desc}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .structure-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .structure-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

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

        .structure-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .structure-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .structure-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .structure-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .structure-back:hover { text-decoration: underline; }
        .structure-eyebrow {
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

        .structure-section { padding: 50px 0; }
        .structure-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .structure-level {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          width: 100%;
        }
        .structure-two { gap: 20px; }
        .structure-card {
          background: white;
          padding: 30px 24px;
          border-radius: 12px;
          text-align: center;
          min-width: 200px;
          flex: 1;
          max-width: 320px;
          border-top: 4px solid #6A1B9A;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .structure-card.national {
          border-top-color: #FFD100;
          background: #002B5C;
          color: white;
        }
        .structure-card.national h3 { color: #FFD100; }
        .structure-card.national p { color: rgba(255,255,255,0.9); }
        .structure-card.national small { color: rgba(255,255,255,0.7); }
        .structure-card.scout { border-top-color: #2E7D32; }
        .structure-icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
        .structure-card h3 { color: #002B5C; margin: 0 0 4px 0; font-size: 1.1rem; }
        .structure-card p { color: #4B5563; margin: 0 0 4px 0; font-weight: 500; }
        .structure-card small { color: #6B7280; font-size: 0.85rem; }
        .structure-arrow { color: #6A1B9A; font-size: 1.5rem; font-weight: 700; }

        @media (max-width: 768px) {
          .structure-level { flex-direction: column; align-items: center; }
          .structure-two { flex-direction: column; }
          .structure-card { max-width: 100%; width: 100%; }
          .lang-switcher { justify-content: center; }
          .structure-hero { padding: 40px 20px; }
        }
        @media (max-width: 480px) {
          .structure-card { padding: 20px; }
          .structure-icon { font-size: 2rem; }
          .structure-arrow { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
};

export default OrganisationStructure;