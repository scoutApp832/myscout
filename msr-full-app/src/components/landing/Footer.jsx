import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  const currentLanguage =
    language === 'rw' || language === 'en' ? language : 'en';

  // ============================================================
  // TRANSLATIONS
  // ============================================================

  const translations = {
    en: {
      aboutMSR: 'About MSR',

      description:
        'MyScout Rwanda (MSR) is the official digital platform of the Rwanda Scout Association, empowering young people through leadership, service, education, and SDG action.',

      columns: [
        {
          title: 'About MSR',
          links: [
            'Rwanda Scout Association',
            'Our History',
            'Mission & Vision',
            'Organization Structure',
            'MSR Development Team',
          ],
        },

        {
          title: 'Programs',
          links: [
            'Scout Courses',
            'Leadership Training',
            'Community Service',
            'SDG Action',
            'Messengers of Peace',
          ],
        },

        {
          title: 'Resources',
          links: [
            'Member Dashboard',
            'Reports & Statistics',
            'News & Updates',
            'Photo Gallery',
            'FAQs',
          ],
        },

        {
          title: 'Get Involved',
          links: [
            'Become a Scout',
            'Volunteer',
            'Donate',
            'Become a Partner',
            'Sponsor an Event',
          ],
        },

        {
          title: 'Contact',
          links: [
            'Email Us',
            'Phone',
            'Visit Us',
            'Support Center',
            'Feedback',
          ],
        },
      ],

      message: 'Message',
      flower: 'Flower',

      platform: 'MSR PLATFORM',
      platformSub: 'MyScout Rwanda Digital Hub',

      followUs: 'Follow Rwanda Scouts Association',

      copyright:
        '© 2026 MyScout Rwanda (MSR). All Rights Reserved.',

      support:
        'Built with the support of the global scouting community.',
    },

    rw: {
      aboutMSR: 'Ibyerekeye MSR',

      description:
        'MyScout Rwanda (MSR) ni urubuga rwa digitale rwemewe rw’Urugaga rw’Abaskuti mu Rwanda, rugamije guteza imbere urubyiruko binyuze mu buyobozi, umurimo w’ubwitange, uburezi no gushyigikira ibikorwa bigamije kugera ku Ntego z’Iterambere Rirambye (SDGs).',

      columns: [
        {
          title: 'Ibyerekeye MSR',
          links: [
            'Urugaga rw’Abaskuti mu Rwanda',
            'Amateka Yacu',
            'Intego n’Icyerekezo',
            'Imiterere y’Umuryango',
            'Itsinda ry’Abateza Imbere MSR',
          ],
        },

        {
          title: 'Gahunda',
          links: [
            'Amasomo y’Abaskuti',
            'Amahugurwa y’Ubuyobozi',
            'Serivisi ku Muryango',
            'Ibikorwa bya SDGs',
            'Intumwa z’Amahoro',
          ],
        },

        {
          title: 'Amakuru',
          links: [
            'Dashboard y’Umunyamuryango',
            'Raporo n’Imibare',
            'Amakuru n’Amavugurura',
            'Amafoto',
            'Ibibazo Bikunze Kubazwa',
          ],
        },

        {
          title: 'Gira Uruhare',
          links: [
            'Ba Umuskuti',
            'Kora Ubwitange',
            'Tanga Inkunga',
            'Ba Umufatanyabikorwa',
            'Shyigikira Igikorwa',
          ],
        },

        {
          title: 'Twandikire',
          links: [
            'Twandikire kuri Email',
            'Telefone',
            'Dusure',
            'Ikigo cy’Ubufasha',
            'Ibitekerezo',
          ],
        },
      ],

      message: 'Ubutumwa',
      flower: 'Indabyo',

      platform: 'URUBUGA RWA MSR',
      platformSub: 'Ikigo cya MyScout Rwanda Digital',

      followUs: 'Dukurikire kuri Rwanda Scouts Association',

      copyright:
        '© 2026 MyScout Rwanda (MSR). Uburenganzira bwose burabitswe.',

      support:
        'Yubatswe ku bufatanye n’umuryango w’Abaskuti ku isi.',
    },
  };

  const t = translations[currentLanguage];

  // ============================================================
  // FOOTER COLUMNS
  // ============================================================

  const footerColumns = [
    {
      title: t.columns[0].title,
      links: t.columns[0].links,
      originalLinks: [
        'Rwanda Scout Association',
        'Our History',
        'Mission & Vision',
        'Organization Structure',
        'MSR Development Team',
      ],
    },

    {
      title: t.columns[1].title,
      links: t.columns[1].links,
      originalLinks: [
        'Scout Courses',
        'Leadership Training',
        'Community Service',
        'SDG Action',
        'Messengers of Peace',
      ],
    },

    {
      title: t.columns[2].title,
      links: t.columns[2].links,
      originalLinks: [
        'Member Dashboard',
        'Reports & Statistics',
        'News & Updates',
        'Photo Gallery',
        'FAQs',
      ],
    },

    {
      title: t.columns[3].title,
      links: t.columns[3].links,
      originalLinks: [
        'Become a Scout',
        'Volunteer',
        'Donate',
        'Become a Partner',
        'Sponsor an Event',
      ],
    },

    {
      title: t.columns[4].title,
      links: t.columns[4].links,
      originalLinks: [
        'Email Us',
        'Phone',
        'Visit Us',
        'Support Center',
        'Feedback',
      ],
    },
  ];

  // ============================================================
  // RWANDA SCOUT ASSOCIATION SOCIAL PLATFORMS
  // ============================================================
  //
  // These are the RSA social accounts identified from
  // Rwanda Scouts Association's official website.
  //
  // X/Twitter: @rwandascouts
  // Instagram: @rwanda_scouts
  //
  // Facebook/LinkedIn/YouTube should be replaced with the
  // exact official organization URLs once confirmed.
  //
  // ============================================================

  const socialLinks = [
    {
      name: 'Facebook',
      icon: 'fa-facebook-f',
      url: 'https://www.facebook.com/rwandascouts',
    },

    {
      name: 'X',
      icon: 'fa-x-twitter',
      url: 'https://twitter.com/rwandascouts',
    },

    {
      name: 'Instagram',
      icon: 'fa-instagram',
      url: 'https://www.instagram.com/rwanda_scouts/',
    },

    {
      name: 'LinkedIn',
      icon: 'fa-linkedin-in',
      url: 'https://www.linkedin.com/company/rwanda-scouts-association/',
    },

    {
      name: 'YouTube',
      icon: 'fa-youtube',
      url: 'https://www.youtube.com/',
    },
  ];

  // ============================================================
  // INTERNAL ROUTES
  // ============================================================

  const routeMap = {
    'Rwanda Scout Association': '/about',
    'Our History': '/about/history',
    'Mission & Vision': '/about/mission',
    'Organization Structure': '/about/organization',
    'MSR Development Team': '/about/developer',

    'Scout Courses': '/courses',
    'Leadership Training': '/courses',
    'Community Service': '/programs',
    'SDG Action': '/programs/sdg',
    'Messengers of Peace': '/programs/mop',

    'Member Dashboard': '/dashboard',
    'Reports & Statistics': '/reports',
    'News & Updates': '/news',
    'Photo Gallery': '/gallery',
    FAQs: '/faq',

    'Become a Partner': '/contact',
    'Sponsor an Event': '/events',

    'Email Us': '/contact',
    Phone: '/contact',
    'Visit Us': '/contact',
    'Support Center': '/contact',
    Feedback: '/contact',
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <footer className="footer">
      <div className="container">

        {/* ======================================================
            ABOUT MSR
        ====================================================== */}

        <div className="footer-about">
          <h4>{t.aboutMSR}</h4>

          <p>
            {t.description}
          </p>
        </div>

        {/* ======================================================
            FOOTER GRID
        ====================================================== */}

        <div className="footer-grid">

          {footerColumns.map((col, index) => (
            <div
              key={index}
              className="footer-col"
            >
              <h5>{col.title}</h5>

              <ul>
                {col.links.map((link, i) => {
                  const originalLink = col.originalLinks[i];

                  // Login-protected links
                  if (
                    originalLink === 'Donate' ||
                    originalLink === 'Become a Scout' ||
                    originalLink === 'Volunteer'
                  ) {
                    return (
                      <li key={i}>
                        <Link to="/login">
                          {link}
                        </Link>
                      </li>
                    );
                  }

                  // Internal application routes
                  const route = routeMap[originalLink];

                  return (
                    <li key={i}>
                      {route ? (
                        <Link to={route}>
                          {link}
                        </Link>
                      ) : (
                        <a href="#">
                          {link}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* ======================================================
            FOOTER PHOTOS
        ====================================================== */}

        <div className="footer-photos">

          <div className="footer-photo-item">
            <img
              src="message.jpg"
              alt={t.message}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            <span>
              {t.message}
            </span>
          </div>

          <div className="footer-photo-divider"></div>

          <div className="footer-photo-item">
            <img
              src="flower.jpg"
              alt={t.flower}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            <span>
              {t.flower}
            </span>
          </div>

        </div>

        {/* ======================================================
            PLATFORM + SOCIAL
        ====================================================== */}

        <div className="footer-bottom-row">

          {/* MSR PLATFORM */}

          <div className="platform-small">

            <div className="icon">
              <i className="fas fa-shield-alt"></i>
            </div>

            <div>
              <div className="title">
                {t.platform}
              </div>

              <div className="sub">
                {t.platformSub}
              </div>
            </div>

          </div>

          {/* SOCIAL PLATFORMS */}

          <div
            className="social-small"
            aria-label={t.followUs}
          >

            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
              >
                <i
                  className={`fab ${social.icon}`}
                ></i>
              </a>
            ))}

          </div>

        </div>

        {/* ======================================================
            COPYRIGHT
        ====================================================== */}

        <div className="footer-copy">

          <p>
            {t.copyright}
          </p>

          <small>
            {t.support}
          </small>

        </div>

      </div>
    </footer>
  );
};

export default Footer;