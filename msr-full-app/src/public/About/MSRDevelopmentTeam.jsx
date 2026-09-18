// src/public/About/MSRDevelopmentTeam.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MSRDevelopmentTeam = () => {
  const [language, setLanguage] = useState('en');

  const content = {
    en: {
      eyebrow: 'MYSCOUT RWANDA',
      title: 'MSR Development Team',
      subtitle: 'The people and technical team behind the MyScout Rwanda digital platform.',
      aboutLabel: 'ABOUT MSR',
      aboutTitle: 'Building a Digital Scout Community',
      aboutDesc: 'MyScout Rwanda is designed to make Scout management, communication, learning, events, projects and membership services more accessible through a modern digital platform.',
      teamValues: [
        { icon: '💻', title: 'Technology', desc: 'Developing reliable and accessible digital services for the Scout community.' },
        { icon: '🚀', title: 'Innovation', desc: 'Using technology to improve how Scouts connect, learn and collaborate.' },
        { icon: '🤝', title: 'Collaboration', desc: 'Working with Scout leaders and members to improve the platform.' }
      ],
      workLabel: 'OUR WORK',
      workTitle: 'What the Development Team Builds',
      workItems: ['🔐 Secure Member Accounts', '🎯 Scout Membership Management', '📅 Events Management', '💬 Scout Community Communication', '🎓 Scout Courses', '💡 Scout Ideas & Projects', '💰 Donation Management', '🛍️ Scout Marketplace', '📊 Reports & Statistics', '📢 Announcements'],
      ctaTitle: 'Have an Idea?',
      ctaDesc: 'We welcome ideas that can make the Scout experience better.',
      ctaBtn: 'Contact the Team'
    },
    kin: {
      eyebrow: 'MYSCOUT RWANDA',
      title: 'Itsinda rya MSR',
      subtitle: 'Abakoze urubuga rwa MyScout Rwanda.',
      aboutLabel: 'IBIJYEYE MSR',
      aboutTitle: 'Kubaka Umuryango wa Skouti mu Ikoranabuhanga',
      aboutDesc: 'MyScout Rwanda yashyizweho kugira ngo ishyire imbere imiyoborere ya Skouti, itumanaho, kwiga, ibirori, imishinga n\'ubumenyi binyuze mu ikoranabuhanga.',
      teamValues: [
        { icon: '💻', title: 'Ikoranabuhanga', desc: 'Kubaka serivisi zizewe kandi zikorwa kuri Skouti.' },
        { icon: '🚀', title: 'Ubuhanga', desc: 'Gukoresha ikoranabuhanga mu guhuza no guteza imbere Abaskuti.' },
        { icon: '🤝', title: 'Gukorana', desc: 'Gukorana n\'abayobozi n\'Abaskuti mu guteza imbere urubuga.' }
      ],
      workLabel: 'IBIKORWA',
      workTitle: 'Ibikorwa by\'Itsinda rya MSR',
      workItems: ['🔐 Umutekano w\'Abanyamuryango', '🎯 Imiyoborere ya Skouti', '📅 Imiyoborere y\'Ibirori', '💬 Itumanaho rya Skouti', '🎓 Amahugurwa ya Skouti', '💡 Ibitekerezo n\'Imishinga', '💰 Imiyoborere y\'Inkunga', '🛍️ Isoko rya Skouti', '📊 Raporo n\'Imibare', '📢 Amatangazo'],
      ctaTitle: 'Ufite Igitekerezo?',
      ctaDesc: 'Twakira ibitekerezo bishobora guteza imbere Skouti.',
      ctaBtn: 'Twandikire'
    }
  };

  const t = content[language];

  return (
    <div className="team-page">
      <div className="lang-switcher">
        <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>English</button>
        <button onClick={() => setLanguage('kin')} className={language === 'kin' ? 'active' : ''}>Kinyarwanda</button>
      </div>

      <section className="team-hero">
        <div className="team-container">
          <Link to="/about" className="team-back">← {language === 'en' ? 'Back to About' : 'Subira ku Ibijyeyo'}</Link>
          <span className="team-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </section>

      <section className="team-section">
        <div className="team-container">
          <div className="team-heading">
            <span className="team-label">🚀 {t.aboutLabel}</span>
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutDesc}</p>
          </div>

          <div className="team-values">
            {t.teamValues.map((value, index) => (
              <div className="team-value" key={index}>
                <span className="team-value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="work-section">
        <div className="work-container">
          <div className="work-heading">
            <span className="work-label">📋 {t.workLabel}</span>
            <h2>{t.workTitle}</h2>
          </div>

          <div className="work-grid">
            {t.workItems.map((item, index) => (
              <div className="work-item" key={index}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaDesc}</p>
          <Link to="/contact" className="cta-btn">{t.ctaBtn}</Link>
        </div>
      </section>

      <style>{`
        .team-page { background: #f8f9fa; min-height: calc(100vh - 200px); }
        .team-container, .work-container, .cta-container {
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

        .team-hero {
          background: linear-gradient(135deg, #002B5C, #6A1B9A);
          padding: 60px 20px 50px;
          color: white;
        }
        .team-hero h1 { font-size: clamp(2rem, 4vw, 3rem); margin: 8px 0; }
        .team-hero p { font-size: clamp(0.95rem, 1.5vw, 1.1rem); opacity: 0.9; max-width: 600px; }
        .team-back { color: #FFD100; text-decoration: none; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        .team-back:hover { text-decoration: underline; }
        .team-eyebrow {
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

        .team-section { padding: 50px 0; }
        .team-heading { text-align: center; margin-bottom: 40px; }
        .team-label {
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
        .team-heading h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0; }
        .team-heading p { color: #6B7280; max-width: 700px; margin: 8px auto 0; line-height: 1.8; }

        .team-values {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        .team-value {
          background: white;
          padding: 30px 24px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .team-value:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(106,27,154,0.12);
          border-color: #6A1B9A;
        }
        .team-value-icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
        .team-value h3 { color: #002B5C; margin: 0 0 6px 0; }
        .team-value p { color: #6B7280; margin: 0; }

        .work-section { padding: 50px 0; background: white; }
        .work-heading { text-align: center; margin-bottom: 30px; }
        .work-label {
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
        .work-heading h2 { color: #002B5C; font-size: clamp(1.5rem, 2.5vw, 2rem); margin: 0; }

        .work-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .work-item {
          background: #f8f9fa;
          padding: 16px 20px;
          border-radius: 10px;
          text-align: center;
          font-weight: 500;
          color: #002B5C;
          border: 1px solid #e8d5f0;
          transition: all 0.3s ease;
        }
        .work-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(106,27,154,0.1);
          border-color: #6A1B9A;
        }

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
          .team-hero { padding: 40px 20px; }
          .work-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 480px) {
          .team-values { grid-template-columns: 1fr; }
          .work-grid { grid-template-columns: 1fr; }
          .cta-btn { width: 100%; max-width: 280px; }
        }
      `}</style>
    </div>
  );
};

export default MSRDevelopmentTeam;