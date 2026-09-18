// src/public/About/RSA/VisionValues.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const VisionValues = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'Rwanda Scout Association',
      title: 'Vision & Values',
      subtitle: 'Guiding principles that shape the Scout movement in Rwanda.',
      back: '← Back to About',
      visionLabel: 'OUR VISION',
      visionTitle: 'A strong Scout movement empowering young people to become responsible citizens and leaders who contribute to a better Rwanda and a better world.',
      visionDesc: 'We envision a Scouting movement where every young person has opportunities to learn, lead, serve and reach their full potential.',
      valuesEyebrow: 'WHAT GUIDES US',
      valuesTitle: 'Our Core Values',
      valuesDesc: 'These values are at the heart of our work with Scouts, leaders and partners.',
      values: [
        { icon: '❤️', title: 'Service', desc: 'Encouraging Scouts to serve others and contribute positively to their communities.' },
        { icon: '🛡️', title: 'Integrity', desc: 'Promoting honesty, trustworthiness, responsibility and strong moral character.' },
        { icon: '👥', title: 'Teamwork', desc: 'Believing that cooperation and mutual respect help young people achieve more together.' },
        { icon: '💡', title: 'Innovation', desc: 'Encouraging creativity, problem-solving and new ideas that improve society.' },
        { icon: '🤝', title: 'Respect', desc: 'Valuing respect for people, communities, cultures, nature and different perspectives.' },
        { icon: '🌱', title: 'Personal Growth', desc: 'Supporting continuous learning and development of young people.' }
      ],
      principles: ['Learn by doing', 'Lead by serving', 'Work together', 'Respect others', 'Protect our environment']
    },
    kin: {
      eyebrow: 'Ishyirahamwe ry\'Abaskuti mu Rwanda',
      title: 'Ihame n\'Indangagaciro',
      subtitle: 'Amahame ayobora Ishyirahamwe ry\'Abaskuti mu Rwanda.',
      back: '← Subira ku Ibijyeyo',
      visionLabel: 'INTEGO YACU',
      visionTitle: 'Ishyirahamwe rikomeye ry\'Abaskuti rifasha urubyiruko kuba abanyarwanda bakwiye kandi bakaba abayobozi batera imbere u Rwanda n\'isi.',
      visionDesc: 'Dusaba ko buri mwana w\'urubyiruko agira amahirwe yo kwiga, kuyobora, gukorera no kugera ku byo ashoboye.',
      valuesEyebrow: 'IBIYOBORA',
      valuesTitle: 'Indangagaciro Zacu',
      valuesDesc: 'Izi ndangagaciro ni zo shingiro ry\'akazi kacu n\'Abaskuti, abayobozi n\'abafatanyabikorwa.',
      values: [
        { icon: '❤️', title: 'Gukorera', desc: 'Gushishikariza Abaskuti gukorera abandi no gutera imbere abaturage.' },
        { icon: '🛡️', title: 'Kwirinda', desc: 'Guteza imbere ukuri, kwizerwa, inshingano n\'imyitwarire myiza.' },
        { icon: '👥', title: 'Gukorera Hamwe', desc: 'Kwemera ko gukorana n\'ubwuzu bifasha urubyiruko kugera ku byinshi.' },
        { icon: '💡', title: 'Ubuhanga', desc: 'Gushishikariza ubuhanga, gukemura ibibazo n\'ibitekerezo bishya.' },
        { icon: '🤝', title: 'Kubaha', desc: 'Kubaha abantu, abaturage, imico, ibidukikije n\'ibitekerezo bitandukanye.' },
        { icon: '🌱', title: 'Iterambere', desc: 'Gushyigikira kwiga no guteza imbere urubyiruko.' }
      ],
      principles: ['Kwiga binyuze mu bikorwa', 'Kuyobora binyuze mu gukorera', 'Gukorera hamwe', 'Kubaha abandi', 'Kurengera ibidukikije']
    }
  };

  const t = content[language];

  return (
    <div className="vision-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="vision-hero">
        <div className="vision-container">
          <Link to="/about" className="vision-back">{t.back}</Link>
          <span className="vision-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="vision-section">
        <div className="vision-container">
          <div className="vision-box">
            <div className="vision-icon">👁️</div>
            <span className="vision-label">{t.visionLabel}</span>
            <h2>{t.visionTitle}</h2>
            <p>{t.visionDesc}</p>
          </div>

          <div className="values-header">
            <span className="values-eyebrow">{t.valuesEyebrow}</span>
            <h2>{t.valuesTitle}</h2>
            <p>{t.valuesDesc}</p>
          </div>

          <div className="values-grid">
            {t.values.map((value, i) => (
              <div className="value-card" key={i}>
                <span className="value-number">{String(i + 1).padStart(2, '0')}</span>
                <span className="value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>

          <div className="values-principles">
            {t.principles.map((principle, i) => (
              <span className="principle" key={i}>{principle}</span>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .vision-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .vision-container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }

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

        .vision-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .vision-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .vision-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .vision-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .vision-back:hover { text-decoration: underline; }
        .vision-eyebrow {
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

        .vision-section { padding: 50px 0; }
        .vision-box {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          border-left: 5px solid #6A1B9A;
          margin-bottom: 50px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .vision-icon { font-size: 3rem; display: block; margin-bottom: 8px; }
        .vision-label {
          display: inline-block;
          background: #6A1B9A;
          color: white;
          padding: 2px 16px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .vision-box h2 { color: #002B5C; font-size: clamp(1.1rem, 2vw, 1.5rem); margin: 0 0 12px 0; line-height: 1.4; }
        .vision-box p { color: #4B5563; font-size: clamp(0.9rem, 1.2vw, 1rem); line-height: 1.8; max-width: 700px; margin: 0 auto; }

        .values-header { text-align: center; margin-bottom: 40px; }
        .values-eyebrow {
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
        .values-header h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0; }
        .values-header p { color: #6B7280; margin: 4px 0 0 0; }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .value-card {
          background: white;
          padding: 24px;
          border-radius: 10px;
          border: 1px solid #e8d5f0;
          position: relative;
          transition: all 0.3s ease;
        }
        .value-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(106,27,154,0.12);
          border-color: #6A1B9A;
        }
        .value-number { position: absolute; top: 12px; right: 16px; color: #d4c4e0; font-weight: 700; font-size: 0.9rem; }
        .value-icon { font-size: 2rem; display: block; margin-bottom: 8px; }
        .value-card h3 { color: #002B5C; margin: 0 0 6px 0; }
        .value-card p { color: #6B7280; margin: 0; }

        .values-principles {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e8d5f0;
        }
        .principle {
          padding: 6px 16px;
          background: #f0eaf5;
          border-radius: 20px;
          font-size: clamp(0.8rem, 1vw, 0.9rem);
          color: #002B5C;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .vision-box { padding: 24px; }
          .values-grid { grid-template-columns: 1fr 1fr; }
          .lang-switcher { justify-content: center; }
          .vision-hero { padding: 40px 20px; }
        }
        @media (max-width: 480px) {
          .values-grid { grid-template-columns: 1fr; }
          .values-principles { gap: 8px; }
          .principle { font-size: 0.8rem; padding: 4px 12px; }
        }
      `}</style>
    </div>
  );
};

export default VisionValues;