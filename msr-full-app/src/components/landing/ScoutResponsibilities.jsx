import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const ScoutResponsibilities = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Scout Responsibilities',
      subtitle:
        'The core duties every scout lives by — guiding principles for life.',
      dutiesTitle:
        'Duty to God · Duty to Others · Duty to Self',

      duties: [
        {
          icon: 'fa-hands-praying',
          title: 'Duty to God',
          description:
            'Faithfulness, reverence, and spiritual growth',
        },
        {
          icon: 'fa-users',
          title: 'Duty to Others',
          description:
            'Service, kindness, and community leadership',
        },
        {
          icon: 'fa-user-check',
          title: 'Duty to Self',
          description:
            'Discipline, integrity, and personal development',
        },
      ],

      badge: 'Core Value',
    },

    rw: {
      title: 'Inshingano z’Umuskuti',
      subtitle:
        'Inshingano z’ingenzi buri Muscuti agenderaho — amahame amufasha mu buzima.',
      dutiesTitle:
        'Inshingano ku Mana · Inshingano ku BandI · Inshingano Kuri We',

      duties: [
        {
          icon: 'fa-hands-praying',
          title: 'Inshingano ku Mana',
          description:
            'Kwizera, kubaha Imana no gukura mu by’umwuka',
        },
        {
          icon: 'fa-users',
          title: 'Inshingano ku BandI',
          description:
            'Gufasha, kugira neza no kuyobora umuryango',
        },
        {
          icon: 'fa-user-check',
          title: 'Inshingano Kuri We',
          description:
            'Kwigirira discipline, ubunyangamugayo no kwiteza imbere',
        },
      ],

      badge: 'Agaciro k’Ingenzi',
    },
  };

  const text = content[language] || content.en;

  // Duplicate for seamless loop
  const allDuties = [...text.duties, ...text.duties];

  return (
    <div className="container">

      <h2 className="section-title">
        <i className="fas fa-shield-alt"></i>{' '}
        {text.title}
      </h2>

      <p className="section-sub">
        {text.subtitle}
      </p>

      <div className="duty-scroll-wrapper">

        <h3>
          <i
            className="fas fa-arrow-right"
            style={{ marginRight: '10px' }}
          ></i>

          {text.dutiesTitle}
        </h3>

        <div className="duty-scroll-track">

          {allDuties.map((duty, index) => (
            <div
              key={index}
              className="duty-scroll-item"
            >

              <i
                className={`fas ${duty.icon}`}
              ></i>

              <h4>
                {duty.title}
              </h4>

              <p>
                {duty.description}
              </p>

              <span className="badge-duty">
                {text.badge}
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default ScoutResponsibilities;