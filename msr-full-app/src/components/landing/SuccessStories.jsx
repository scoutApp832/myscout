
// src/components/landing/SuccessStories.jsx

import React, { useEffect, useState } from 'react';

import { useLanguage } from '../../contexts/LanguageContext';

import photo1 from './5R9A9956.JPG.jpeg';
import photo2 from './5R9A9996.JPG.jpeg';
import photo3 from './WhatsApp Image 2026-05-25 at 3.42.06 PM.jpeg';
import photo4 from './WhatsApp Image 2026-05-25 at 3.52.51 PM.jpeg';

// ============================================================
// GENERAL TRANSLATIONS
// ============================================================

const translations = {
  en: {
    impact: 'OUR IMPACT',
    storiesOf: 'Stories of',
    change: 'Change',

    description:
      'Discover how scouting is helping young people develop leadership skills, serve their communities, and create positive change across Rwanda.',

    readMore: 'Read More',
    readMoreSuccessStories: 'Read More Success Stories',

    successStory: 'SUCCESS STORY',
    journeyTitle: 'A Journey of Leadership and Service',

    keyAchievements: 'Key Achievements',

    closeStory: 'Close Story',

    location: 'Location',
  },

  rw: {
    impact: 'UMUSARURO WACU',
    storiesOf: 'Inkuru z',
    change: 'Impinduka',

    description:
      'Menya uko Ubuskuti bufasha urubyiruko guteza imbere ubushobozi bwo kuyobora, gukorera abaturage no guteza imbere impinduka nziza mu Rwanda.',

    readMore: 'Soma Ibindi',
    readMoreSuccessStories: 'Soma Izindi Nkuru z’Intsinzi',

    successStory: 'INKURU Y’INTSINZI',
    journeyTitle: 'Urugendo rwo Kuyobora no Gukorera Abandi',

    keyAchievements: 'Ibyo Yagezeho',

    closeStory: 'Funga Inkuru',

    location: 'Aho atuye',
  },
};

// ============================================================
// SUCCESS STORIES DATA
// ============================================================

const stories = [
  {
    id: 1,

    name: 'John Doe',

    location: {
      en: 'Kigali · Gasabo',
      rw: 'Kigali · Gasabo',
    },

    role: {
      en: 'Scout Leader',
      rw: 'Umuyobozi w’Abaskuti',
    },

    image: photo1,

    quote: {
      en: 'Scouting gave me purpose. I now have the confidence and skills to lead young scouts and create positive change in my community.',

      rw: 'Ubukuti bwampaye intego. Ubu mfite icyizere n’ubushobozi bwo kuyobora abaskuti bato no guteza imbere impinduka nziza mu muryango wanjye.',
    },

    fullStory: {
      en: 'Through scouting, John discovered his passion for leadership and community service. His journey started with participating in local scouting activities, where he learned the importance of discipline, teamwork, responsibility, and service to others.',

      rw: 'Binyuze mu Bukuti, John yavumbuye ko akunda kuyobora no gukorera abaturage. Urugendo rwe rwatangiriye mu bikorwa by’Abaskuti aho yize akamaro k’ikinyabupfura, gukorera hamwe, kugira inshingano no gukorera abandi.',
    },

    impact: {
      en: 'Today, John actively supports young scouts in his community. He helps organize activities, mentors younger members, and encourages them to develop confidence and leadership skills.',

      rw: 'Uyu munsi, John afasha cyane abaskuti bato bo mu muryango we. Afasha gutegura ibikorwa, atoza abanyamuryango bato kandi akabatera inkunga yo kugira icyizere n’ubushobozi bwo kuyobora.',
    },

    achievements: {
      en: [
        'Developed strong leadership skills',
        'Mentors young scouts',
        'Participates in community service',
        'Supports youth development activities',
      ],

      rw: [
        'Yateje imbere ubushobozi bwo kuyobora',
        'Atoza abaskuti bato',
        'Yitabira ibikorwa byo gukorera abaturage',
        'Afasha mu bikorwa biteza imbere urubyiruko',
      ],
    },
  },

  {
    id: 2,

    name: 'Alice Uwase',

    location: {
      en: 'Kigali · Nyarugenge',
      rw: 'Kigali · Nyarugenge',
    },

    role: {
      en: 'Community Volunteer',
      rw: 'Umukorerabushake mu Muryango',
    },

    image: photo2,

    quote: {
      en: 'Being a Scout taught me that small actions can make a big difference in our community.',

      rw: 'Kuba Umuskuti byanyigishije ko ibikorwa bito bishobora guteza impinduka nini mu muryango wacu.',
    },

    fullStory: {
      en: 'Alice joined scouting with a desire to learn new skills and meet other young people. Through different scouting activities, she learned how teamwork and service can bring positive change to communities.',

      rw: 'Alice yinjiye mu Bukuti ashaka kwiga ubumenyi bushya no guhura n’abandi rubyiruko. Binyuze mu bikorwa bitandukanye by’Abaskuti, yize uko gukorera hamwe no gukorera abandi bishobora guteza impinduka nziza mu muryango.',
    },

    impact: {
      en: 'Alice regularly participates in community service activities. She uses the skills she gained through scouting to support people around her and inspire other young people to volunteer.',

      rw: 'Alice ahora yitabira ibikorwa byo gukorera abaturage. Akoresha ubumenyi yakuye mu Bukuti mu gufasha abantu bamukikije no gushishikariza abandi rubyiruko gukora ibikorwa by’ubukorerabushake.',
    },

    achievements: {
      en: [
        'Active community volunteer',
        'Participates in service projects',
        'Promotes teamwork among young people',
        'Encourages youth participation',
      ],

      rw: [
        'Ni umukorerabushake ukora cyane mu muryango',
        'Yitabira imishinga yo gukorera abaturage',
        'Ashishikariza urubyiruko gukorera hamwe',
        'Ashishikariza urubyiruko kugira uruhare mu bikorwa',
      ],
    },
  },

  {
    id: 3,

    name: 'Eric Niyonzima',

    location: {
      en: 'Southern Province',
      rw: 'Intara y’Amajyepfo',
    },

    role: {
      en: 'Scout Mentor',
      rw: 'Umutoza w’Abaskuti',
    },

    image: photo3,

    quote: {
      en: 'Scouting helped me discover my leadership potential and gave me the opportunity to inspire others.',

      rw: 'Ubukuti bwamfashije kuvumbura ubushobozi bwanjye bwo kuyobora kandi bumpa amahirwe yo gutera abandi imbaraga.',
    },

    fullStory: {
      en: 'Eric developed his leadership abilities through scouting programs and activities. The experience helped him understand how important mentorship, teamwork, discipline, and responsibility are in developing young people.',

      rw: 'Eric yateje imbere ubushobozi bwe bwo kuyobora binyuze muri gahunda n’ibikorwa by’Abaskuti. Ibyo yanyuzemo byamufashije gusobanukirwa akamaro ko gutoza abandi, gukorera hamwe, kugira ikinyabupfura no kugira inshingano mu guteza imbere urubyiruko.',
    },

    impact: {
      en: 'Eric now uses his experience to mentor younger scouts. He supports youth activities and encourages young people to take responsibility and contribute positively to their communities.',

      rw: 'Eric ubu akoresha ubunararibonye afite mu gutoza abaskuti bato. Afasha mu bikorwa by’urubyiruko kandi agashishikariza urubyiruko kugira inshingano no kugira uruhare mu iterambere ry’imiryango yabo.',
    },

    achievements: {
      en: [
        'Experienced scout mentor',
        'Supports youth leadership programs',
        'Organizes teamwork activities',
        'Mentors younger scouts',
      ],

      rw: [
        'Ni umutoza w’Abaskuti ufite ubunararibonye',
        'Afasha muri gahunda zo guteza imbere ubuyobozi bw’urubyiruko',
        'Ategura ibikorwa byo gukorera hamwe',
        'Atoza abaskuti bato',
      ],
    },
  },

  {
    id: 4,

    name: 'Diane Mukamana',

    location: {
      en: 'Northern Province',
      rw: 'Intara y’Amajyaruguru',
    },

    role: {
      en: 'Young Scout Leader',
      rw: 'Umuyobozi Mukiri w’Abaskuti',
    },

    image: photo4,

    quote: {
      en: 'Scouting has given me confidence, friendship, and the courage to serve my community.',

      rw: 'Ubukuti bwampaye icyizere, ubucuti n’ubutwari bwo gukorera umuryango wanjye.',
    },

    fullStory: {
      en: 'Diane became actively involved in scouting through youth and community activities. Her scouting journey helped her build confidence, develop friendships, and discover her ability to lead and serve others.',

      rw: 'Diane yagize uruhare rugaragara mu Bukuti binyuze mu bikorwa by’urubyiruko n’ibikorwa by’umuryango. Urugendo rwe mu Bukuti rwamufashije kugira icyizere, guteza imbere ubucuti no kuvumbura ubushobozi afite bwo kuyobora no gukorera abandi.',
    },

    impact: {
      en: 'Diane now encourages other young people to participate in scouting. She believes that young people can create meaningful change when they work together and serve their communities.',

      rw: 'Diane ubu ashishikariza abandi rubyiruko kugira uruhare mu Bukuti. Yizera ko urubyiruko rushobora guteza impinduka zifatika iyo rukorera hamwe kandi rugakorera imiryango yarwo.',
    },

    achievements: {
      en: [
        'Developed confidence and leadership',
        'Active youth leader',
        'Participates in community activities',
        'Encourages young people to join scouting',
      ],

      rw: [
        'Yateje imbere icyizere n’ubushobozi bwo kuyobora',
        'Ni umuyobozi ukora cyane mu rubyiruko',
        'Yitabira ibikorwa by’umuryango',
        'Ashishikariza urubyiruko kwinjira mu Bukuti',
      ],
    },
  },
];

// ============================================================
// COMPONENT
// ============================================================

const SuccessStories = () => {
  const { language } = useLanguage();

  const currentLanguage =
    language === 'rw' || language === 'en' ? language : 'en';

  const t = translations[currentLanguage];

  const [selectedStory, setSelectedStory] = useState(null);

  // ==========================================================
  // PREVENT BACKGROUND SCROLLING WHEN MODAL IS OPEN
  // ==========================================================

  useEffect(() => {
    if (selectedStory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStory]);

  // ==========================================================
  // CLOSE MODAL WITH ESC KEY
  // ==========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedStory(null);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // ==========================================================
  // OPEN STORY
  // ==========================================================

  const openStory = (story) => {
    setSelectedStory(story);
  };

  // ==========================================================
  // CLOSE STORY
  // ==========================================================

  const closeStory = () => {
    setSelectedStory(null);
  };

  return (
    <>
      {/* ======================================================
          SUCCESS STORIES SECTION
      ====================================================== */}

      <section
        className="success-stories"
        id="success-stories"
        aria-labelledby="success-stories-title"
      >
        <div className="success-container">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="success-header">

            <span className="success-label">
              {t.impact}
            </span>

            <h2 id="success-stories-title">
              {t.storiesOf}{' '}
              <span>{t.change}</span>
            </h2>

            <p>
              {t.description}
            </p>

          </div>

          {/* ==================================================
              STORY CARDS
          ================================================== */}

          <div className="stories-grid">

            {stories.map((story) => (

              <article
                className="story-card"
                key={story.id}
              >

                {/* ==================================================
                    IMAGE
                ================================================== */}

                <div className="story-image-wrapper">

                  <img
                    src={story.image}
                    alt={`${story.name} - ${story.role[currentLanguage]}`}
                    className="story-image"
                    loading="lazy"
                  />

                  <div
                    className="image-overlay"
                    aria-hidden="true"
                  />

                  <span className="story-role">
                    {story.role[currentLanguage]}
                  </span>

                </div>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div className="story-content">

                  {/* LOCATION */}

                  <div className="story-location">

                    <span
                      className="location-dot"
                      aria-hidden="true"
                    />

                    <span>
                      {story.location[currentLanguage]}
                    </span>

                  </div>

                  {/* NAME */}

                  <h3>
                    {story.name}
                  </h3>

                  {/* QUOTE */}

                  <p className="story-quote">
                    “{story.quote[currentLanguage]}”
                  </p>

                  {/* READ MORE */}

                  <div className="story-footer">

                    <button
                      type="button"
                      className="story-read-more"
                      onClick={() => openStory(story)}
                      aria-label={`${t.readMore}: ${story.name}`}
                    >

                      <span>
                        {t.readMore}
                      </span>

                      <span
                        className="read-arrow"
                        aria-hidden="true"
                      >
                        →
                      </span>

                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

          {/* ==================================================
              BOTTOM BUTTON
          ================================================== */}

          <div className="success-actions">

            <button
              type="button"
              className="view-stories-btn"
              onClick={() => openStory(stories[0])}
            >

              <span>
                {t.readMoreSuccessStories}
              </span>

              <span
                className="main-arrow"
                aria-hidden="true"
              >
                →
              </span>

            </button>

          </div>

        </div>
      </section>

      {/* ======================================================
          COMPLETE STORY MODAL
      ====================================================== */}

      {selectedStory && (

        <div
          className="story-modal-overlay"
          onClick={closeStory}
          role="presentation"
        >

          <div
            className="story-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-modal-title"
          >

            {/* ==================================================
                CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              className="story-modal-close"
              onClick={closeStory}
              aria-label={t.closeStory}
            >
              ×
            </button>

            {/* ==================================================
                MODAL IMAGE
            ================================================== */}

            <div className="modal-image-wrapper">

              <img
                src={selectedStory.image}
                alt={`${selectedStory.name} - ${selectedStory.role[currentLanguage]}`}
                className="modal-image"
              />

              <div
                className="modal-image-overlay"
                aria-hidden="true"
              />

              <div className="modal-image-info">

                <span className="modal-role">
                  {selectedStory.role[currentLanguage]}
                </span>

                <h2 id="story-modal-title">
                  {selectedStory.name}
                </h2>

                <p>
                  ● {selectedStory.location[currentLanguage]}
                </p>

              </div>

            </div>

            {/* ==================================================
                MODAL CONTENT
            ================================================== */}

            <div className="modal-content">

              <span className="modal-section-label">
                {t.successStory}
              </span>

              <h3>
                {t.journeyTitle}
              </h3>

              {/* ==================================================
                  QUOTE
              ================================================== */}

              <blockquote>
                “{selectedStory.quote[currentLanguage]}”
              </blockquote>

              {/* ==================================================
                  FULL STORY
              ================================================== */}

              <div className="story-text">

                <p>
                  {selectedStory.fullStory[currentLanguage]}
                </p>

                <p>
                  {selectedStory.impact[currentLanguage]}
                </p>

              </div>

              {/* ==================================================
                  ACHIEVEMENTS
              ================================================== */}

              <div className="achievements">

                <h4>
                  {t.keyAchievements}
                </h4>

                <div className="achievement-list">

                  {selectedStory.achievements[currentLanguage].map(
                    (achievement, index) => (

                      <div
                        className="achievement-item"
                        key={index}
                      >

                        <span
                          className="achievement-check"
                          aria-hidden="true"
                        >
                          ✓
                        </span>

                        <span>
                          {achievement}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={closeStory}
                >
                  {t.closeStory}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* ========================================================
          ALL CSS
      ======================================================== */}

      <style>{`

        /* ======================================================
           SECTION
        ====================================================== */

        .success-stories {
          width: 100%;
          padding: 100px 20px;
          background: #f8faf9;
          box-sizing: border-box;
        }


        .success-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }


        /* ======================================================
           HEADER
        ====================================================== */

        .success-header {
          max-width: 760px;
          margin: 0 auto 55px;
          text-align: center;
        }


        .success-label {
          display: inline-block;

          margin-bottom: 14px;
          padding: 7px 16px;

          color: #006a4e;
          background: rgba(0, 106, 78, 0.09);

          border-radius: 30px;

          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }


        .success-header h2 {
          margin: 0 0 18px;

          color: #17251f;

          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.1;
          font-weight: 800;
        }


        .success-header h2 span {
          color: #006a4e;
        }


        .success-header p {
          max-width: 680px;
          margin: 0 auto;

          color: #66736d;

          font-size: 16px;
          line-height: 1.8;
        }


        /* ======================================================
           GRID
        ====================================================== */

        .stories-grid {
          display: grid;

          grid-template-columns:
            repeat(4, minmax(0, 1fr));

          gap: 24px;
        }


        /* ======================================================
           CARD
        ====================================================== */

        .story-card {
          display: flex;
          flex-direction: column;

          min-width: 0;
          overflow: hidden;

          background: #ffffff;

          border: 1px solid #e7eeea;
          border-radius: 18px;

          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.05);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }


        .story-card:hover {
          transform: translateY(-8px);

          border-color:
            rgba(0, 106, 78, 0.25);

          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.1);
        }


        /* ======================================================
           IMAGE
        ====================================================== */

        .story-image-wrapper {
          position: relative;

          width: 100%;
          height: 270px;

          overflow: hidden;

          background: #dfe9e4;
        }


        .story-image {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform 0.5s ease;
        }


        .story-card:hover .story-image {
          transform: scale(1.07);
        }


        .image-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.02),
              rgba(0, 0, 0, 0.55)
            );

          pointer-events: none;
        }


        /* ======================================================
           ROLE
        ====================================================== */

        .story-role {
          position: absolute;

          left: 16px;
          bottom: 16px;

          padding: 7px 13px;

          color: #ffffff;
          background: #006a4e;

          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;

          box-shadow:
            0 5px 15px rgba(0, 0, 0, 0.15);
        }


        /* ======================================================
           CONTENT
        ====================================================== */

        .story-content {
          display: flex;
          flex: 1;
          flex-direction: column;

          padding: 23px;
        }


        .story-location {
          display: flex;
          align-items: center;

          gap: 8px;

          margin-bottom: 10px;

          color: #78847f;

          font-size: 12px;
          font-weight: 600;
        }


        .location-dot {
          width: 7px;
          height: 7px;

          flex-shrink: 0;

          background: #006a4e;

          border-radius: 50%;
        }


        .story-content h3 {
          margin: 0 0 13px;

          color: #17251f;

          font-size: 21px;
          line-height: 1.3;
          font-weight: 800;
        }


        .story-quote {
          margin: 0;

          color: #5d6964;

          font-size: 14px;
          line-height: 1.7;

          font-style: italic;
        }


        /* ======================================================
           INDIVIDUAL READ MORE
        ====================================================== */

        .story-footer {
          margin-top: auto;
          padding-top: 22px;
        }


        .story-read-more {
          display: inline-flex;
          align-items: center;

          gap: 8px;

          padding: 0;

          border: none;
          background: transparent;

          color: #006a4e;

          font-family: inherit;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;

          transition:
            color 0.2s ease,
            gap 0.2s ease;
        }


        .story-read-more:hover {
          gap: 13px;

          color: #004f3a;
        }


        .story-read-more:focus-visible {
          outline: 3px solid
            rgba(0, 106, 78, 0.25);

          outline-offset: 5px;

          border-radius: 4px;
        }


        .read-arrow {
          font-size: 20px;

          transition:
            transform 0.2s ease;
        }


        .story-read-more:hover .read-arrow {
          transform: translateX(5px);
        }


        /* ======================================================
           BOTTOM BUTTON
        ====================================================== */

        .success-actions {
          display: flex;
          justify-content: center;

          margin-top: 50px;
        }


        .view-stories-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 12px;

          min-height: 52px;

          padding: 0 27px;

          border: 2px solid #006a4e;
          border-radius: 10px;

          background: #006a4e;
          color: #ffffff;

          font-family: inherit;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(0, 106, 78, 0.16);

          transition:
            background 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }


        .view-stories-btn:hover {
          background: #00543e;

          transform: translateY(-3px);

          box-shadow:
            0 12px 28px rgba(0, 106, 78, 0.25);
        }


        .view-stories-btn:focus-visible {
          outline: 3px solid
            rgba(0, 106, 78, 0.25);

          outline-offset: 4px;
        }


        .main-arrow {
          font-size: 20px;

          transition:
            transform 0.25s ease;
        }


        .view-stories-btn:hover .main-arrow {
          transform: translateX(5px);
        }


        /* ======================================================
           MODAL OVERLAY
        ====================================================== */

        .story-modal-overlay {
          position: fixed;

          inset: 0;

          z-index: 99999;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 25px;

          background:
            rgba(8, 20, 15, 0.78);

          backdrop-filter: blur(7px);

          animation:
            modalFadeIn 0.25s ease;
        }


        @keyframes modalFadeIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }


        /* ======================================================
           MODAL
        ====================================================== */

        .story-modal {
          position: relative;

          width: 100%;
          max-width: 850px;

          max-height: 92vh;

          overflow-y: auto;

          background: #ffffff;

          border-radius: 22px;

          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.3);

          animation:
            modalSlideUp 0.3s ease;

          scrollbar-width: thin;

          scrollbar-color:
            #b9c9c2
            transparent;
        }


        @keyframes modalSlideUp {

          from {
            opacity: 0;
            transform:
              translateY(30px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ======================================================
           CLOSE BUTTON
        ====================================================== */

        .story-modal-close {
          position: absolute;

          top: 16px;
          right: 16px;

          z-index: 10;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 42px;
          height: 42px;

          border: 1px solid
            rgba(255, 255, 255, 0.3);

          border-radius: 50%;

          background:
            rgba(0, 0, 0, 0.45);

          color: #ffffff;

          font-size: 28px;
          line-height: 1;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }


        .story-modal-close:hover {
          background: #006a4e;

          transform: rotate(90deg);
        }


        .story-modal-close:focus-visible {
          outline: 3px solid #ffffff;

          outline-offset: 3px;
        }


        /* ======================================================
           MODAL IMAGE
        ====================================================== */

        .modal-image-wrapper {
          position: relative;

          width: 100%;
          height: 360px;

          overflow: hidden;
        }


        .modal-image {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;
        }


        .modal-image-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.05),
              rgba(0, 0, 0, 0.75)
            );
        }


        .modal-image-info {
          position: absolute;

          left: 35px;
          right: 70px;
          bottom: 30px;

          color: #ffffff;
        }


        .modal-role {
          display: inline-block;

          margin-bottom: 10px;

          padding: 7px 13px;

          background: #006a4e;

          border-radius: 20px;

          font-size: 11px;
          font-weight: 700;
        }


        .modal-image-info h2 {
          margin: 0 0 8px;

          font-size: 34px;
          line-height: 1.2;
          font-weight: 800;
        }


        .modal-image-info p {
          margin: 0;

          font-size: 14px;

          opacity: 0.9;
        }


        /* ======================================================
           MODAL CONTENT
        ====================================================== */

        .modal-content {
          padding: 40px;
        }


        .modal-section-label {
          display: inline-block;

          margin-bottom: 12px;

          color: #006a4e;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 1.5px;
        }


        .modal-content h3 {
          margin: 0 0 22px;

          color: #17251f;

          font-size: 28px;
          line-height: 1.3;
          font-weight: 800;
        }


        /* ======================================================
           QUOTE
        ====================================================== */

        .modal-content blockquote {
          position: relative;

          margin: 0 0 28px;

          padding: 22px 25px;

          background: #f1f7f4;

          border-left: 4px solid #006a4e;

          border-radius:
            0 12px 12px 0;

          color: #315047;

          font-size: 17px;
          line-height: 1.7;

          font-style: italic;
        }


        /* ======================================================
           STORY TEXT
        ====================================================== */

        .story-text p {
          margin: 0 0 18px;

          color: #5d6964;

          font-size: 15px;

          line-height: 1.85;
        }


        .story-text p:last-child {
          margin-bottom: 0;
        }


        /* ======================================================
           ACHIEVEMENTS
        ====================================================== */

        .achievements {
          margin-top: 30px;

          padding-top: 28px;

          border-top: 1px solid #e7eeea;
        }


        .achievements h4 {
          margin: 0 0 18px;

          color: #17251f;

          font-size: 18px;
          font-weight: 800;
        }


        .achievement-list {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 12px;
        }


        .achievement-item {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 13px;

          background: #f8faf9;

          border-radius: 9px;

          color: #52615b;

          font-size: 13px;

          line-height: 1.5;
        }


        .achievement-check {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 22px;
          height: 22px;

          flex-shrink: 0;

          background: #006a4e;

          color: #ffffff;

          border-radius: 50%;

          font-size: 12px;
          font-weight: 800;
        }


        /* ======================================================
           MODAL FOOTER
        ====================================================== */

        .modal-footer {
          display: flex;
          justify-content: flex-end;

          margin-top: 30px;

          padding-top: 25px;

          border-top: 1px solid #e7eeea;
        }


        .modal-close-btn {
          padding: 12px 22px;

          background: #006a4e;

          color: #ffffff;

          border: none;

          border-radius: 9px;

          font-family: inherit;

          font-size: 13px;

          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }


        .modal-close-btn:hover {
          background: #00543e;

          transform: translateY(-2px);
        }


        .modal-close-btn:focus-visible {
          outline: 3px solid
            rgba(0, 106, 78, 0.25);

          outline-offset: 4px;
        }


        /* ======================================================
           TABLET
        ====================================================== */

        @media (max-width: 1100px) {

          .stories-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }


          .story-image-wrapper {
            height: 300px;
          }

        }


        /* ======================================================
           MOBILE
        ====================================================== */

        @media (max-width: 600px) {

          .success-stories {
            padding: 65px 16px;
          }


          .success-header {
            margin-bottom: 35px;
          }


          .success-header h2 {
            font-size: 34px;
          }


          .success-header p {
            font-size: 14px;
          }


          .stories-grid {
            grid-template-columns: 1fr;

            gap: 20px;
          }


          .story-image-wrapper {
            height: 290px;
          }


          .story-content {
            padding: 21px;
          }


          .success-actions {
            margin-top: 35px;
          }


          .view-stories-btn {
            width: 100%;
          }


          /* ================================================
             MODAL
          ================================================ */

          .story-modal-overlay {
            align-items: flex-end;

            padding: 0;
          }


          .story-modal {
            max-height: 94vh;

            border-radius:
              22px 22px 0 0;
          }


          .modal-image-wrapper {
            height: 270px;
          }


          .modal-image-info {
            left: 22px;
            right: 60px;
            bottom: 22px;
          }


          .modal-image-info h2 {
            font-size: 27px;
          }


          .modal-content {
            padding: 28px 21px;
          }


          .modal-content h3 {
            font-size: 23px;
          }


          .modal-content blockquote {
            padding: 18px;

            font-size: 15px;
          }


          .achievement-list {
            grid-template-columns: 1fr;
          }


          .modal-footer {
            justify-content: stretch;
          }


          .modal-close-btn {
            width: 100%;
          }

        }


        /* ======================================================
           SMALL MOBILE
        ====================================================== */

        @media (max-width: 380px) {

          .success-stories {
            padding-left: 13px;
            padding-right: 13px;
          }


          .success-header h2 {
            font-size: 30px;
          }


          .modal-image-wrapper {
            height: 240px;
          }


          .modal-image-info h2 {
            font-size: 24px;
          }


          .modal-content {
            padding: 24px 17px;
          }

        }


        /* ======================================================
           REDUCED MOTION
        ====================================================== */

        @media (prefers-reduced-motion: reduce) {

          .story-card,
          .story-image,
          .story-read-more,
          .read-arrow,
          .view-stories-btn,
          .main-arrow,
          .story-modal,
          .story-modal-overlay,
          .story-modal-close,
          .modal-close-btn {
            transition: none !important;
            animation: none !important;
          }


          .story-card:hover {
            transform: none;
          }


          .story-card:hover .story-image {
            transform: none;
          }

        }

      `}</style>
    </>
  );
};

export default SuccessStories;
