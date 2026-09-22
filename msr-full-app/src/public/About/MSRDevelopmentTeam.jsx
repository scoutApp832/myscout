
// src/public/About/MSRDevelopmentTeam.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import oscar from "./oscar.png";

const MSRDevelopmentTeam = () => {
  const [language, setLanguage] = useState("en");

  const text = {
    en: {
      brandSubtitle: "Digital Scouting Platform",
      back: "Back to MSR",
      buildingImpact: "Building for Impact",
      eyebrow: "MSR DEVELOPMENT TEAM",
      role:
        "Software Developer • Technology Educator • Digital Solutions Builder",
      heroDescription:
        "A Rwandan Scout passionate about technology, education, and innovation. I build meaningful digital solutions that help people, organizations, and communities grow.",
      mission:
        "“As a Rwandan Scout and technology enthusiast, my mission is to use innovation and education to create meaningful solutions, empower communities, and contribute to a better Rwanda.”",
      contact: "Contact Me",
      explore: "Explore My Work",
      identity: "Rwandan Scout • Technology • Education • Positive Impact",

      msrDevelopment: "MSR Development",
      msrDevelopmentDesc:
        "Building a digital platform for Scouting in Rwanda",
      digitalProjects: "Digital Projects",
      digitalProjectsDesc:
        "Solutions created with purpose and real-world value",
      learningInnovation: "Learning & Innovation",
      learningInnovationDesc:
        "Continuously learning, creating, and improving",

      aboutDeveloper: "ABOUT THE DEVELOPER",
      technologyPurpose: "Technology with a",
      purpose: "Purpose",
      aboutIntro:
        "I am Hagenimana Oscar, a Rwandan Scout and Computer Science with Education student with a strong passion for software development, technology, education, and innovation.",
      journey:
        "My journey combines education and technology with a simple purpose: to create solutions that can make people's lives easier and help communities move forward.",
      scoutBelief:
        "As a Scout, I believe technology should be used not only to build applications, but also to create opportunities, connect people, support organizations, and contribute to positive change.",
      myPurpose: "My Purpose",
      purposeText:
        "Build useful solutions. Empower people. Serve communities. Contribute to Rwanda's digital future.",
      myValues: "My Values",
      value1: "Purpose",
      value2: "Innovation",
      value3: "Service",
      value4: "Continuous Learning",
      value5: "Community Impact",

      myscoutRwanda: "MYSCOUT RWANDA",
      buildingFuture: "Building the future of",
      digitalScouting: "Digital Scouting in Rwanda",
      msrDescription1:
        "MyScout Rwanda is a digital platform created to support Scouting activities, connect members, improve communication, organize information, and strengthen digital participation within the Scouting community.",
      msrDescription2:
        "MSR represents a vision of using technology to support people and organizations while contributing to the development of a stronger and more connected Rwanda.",
      quote:
        "Technology becomes meaningful when it creates opportunities and positive change.",
      quoteAuthor: "— MSR Development Vision",
      slogan: "Educate. Empower. Change. Build.",

      selectedWork: "SELECTED WORK",
      projectsPurpose: "Projects built with",
      projectPurpose: "Purpose",

      mainProject: "MAIN PROJECT",
      scoutingPlatform: "SCOUTING • DIGITAL PLATFORM",
      msrProjectDescription:
        "A digital platform designed to support Scouting activities, members, communication, events, community participation, and organizational management across Rwanda.",
      exploreMsr: "Explore MSR →",

      project: "PROJECT",
      hospitality: "HOSPITALITY • DIGITAL SOLUTION",
      rhmsDescription:
        "A digital solution created to support hotel operations, management, and service organization through a modern online platform.",
      openProject: "Open Project →",

      softwareInnovation: "SOFTWARE • INNOVATION",
      pascalDescription:
        "A digital application project focused on creating practical technology solutions and exploring innovative ways of solving real-world challenges.",

      whatIBuild: "WHAT I BUILD",
      ideasSolutions: "Ideas into",
      solutions: "Solutions",

      webApplications: "Web Applications",
      webApplicationsDesc:
        "Modern and practical digital experiences designed around real needs.",
      digitalPlatforms: "Digital Platforms",
      digitalPlatformsDesc:
        "Platforms that help organizations manage activities, information, and people more effectively.",
      educationTechnology: "Education Technology",
      educationTechnologyDesc:
        "Technology-driven ideas that support teaching, learning, and access to knowledge.",
      digitalInnovation: "Digital Innovation",
      digitalInnovationDesc:
        "Creative approaches that turn challenges into opportunities for positive change.",
      communitySolutions: "Community Solutions",
      communitySolutionsDesc:
        "Digital solutions created with people, communities, and meaningful impact in mind.",
      continuousGrowth: "Continuous Growth",
      continuousGrowthDesc:
        "Learning, experimenting, improving, and building better solutions every day.",

      developmentPhilosophy: "MY DEVELOPMENT PHILOSOPHY",
      buildPurpose: "Build with purpose.",
      serveTechnology: "Serve with technology.",
      philosophyText:
        "I believe the best technology is not simply technology that works. It is technology that solves meaningful problems, creates opportunities, empowers people, and leaves a positive impact.",

      letsConnect: "LET'S CONNECT",
      haveIdea: "Have an idea?",
      meaningful: "Let's build something meaningful.",
      contactText:
        "Whether it is a digital project, an educational idea, a community solution, or an opportunity to create positive impact, I would be happy to connect.",
      emailMe: "Email Me",
      developer: "DEVELOPER",
      softwareDeveloper: "Software Developer",
      technologyEducator: "Technology Educator",
      rwandanScout: "Rwandan Scout",

      builtForRwanda: "Built with purpose for Rwanda 🇷🇼",
    },

    rw: {
      brandSubtitle: "Urubuga rw'Ikoranabuhanga rw'Abaskuti",
      back: "Subira kuri MSR",
      buildingImpact: "Kubaka ibisubizo bigira akamaro",
      eyebrow: "ITSINDA RYATEJE IMBERE MSR",
      role:
        "Umuteza imbere porogaramu • Umwigisha w'Ikoranabuhanga • Uteza imbere ibisubizo by'ikoranabuhanga",
      heroDescription:
        "Ndi Umuskuti w'u Rwanda nkunda ikoranabuhanga, uburezi n'udushya. Nteza imbere ibisubizo by'ikoranabuhanga bifite akamaro bifasha abantu, imiryango n'abaturage gutera imbere.",
      mission:
        "“Nkumuskuti w'u Rwanda kandi nkunda ikoranabuhanga, intego yanjye ni ugukoresha udushya n'uburezi mu gukora ibisubizo bifite akamaro, guteza imbere abaturage no kugira uruhare mu kubaka u Rwanda rwiza.”",
      contact: "Vugana nanjye",
      explore: "Reba ibyo nubatse",
      identity: "Umuskuti w'u Rwanda • Ikoranabuhanga • Uburezi • Impinduka Nziza",

      msrDevelopment: "Iterambere rya MSR",
      msrDevelopmentDesc:
        "Kubaka urubuga rw'ikoranabuhanga rw'Ubukuti mu Rwanda",
      digitalProjects: "Imishinga y'Ikoranabuhanga",
      digitalProjectsDesc:
        "Ibisubizo byakozwe bifite intego n'agaciro mu buzima busanzwe",
      learningInnovation: "Kwiga n'Udushya",
      learningInnovationDesc:
        "Gukomeza kwiga, guhanga no kunoza ibisubizo",

      aboutDeveloper: "IBYEREKEYE UTEZA IMBERE MSR",
      technologyPurpose: "Ikoranabuhanga rifite",
      purpose: "Intego",
      aboutIntro:
        "Ndi Hagenimana Oscar, Umuskuti w'u Rwanda kandi niga Computer Science with Education, nkaba mfite ishyaka ryo guteza imbere porogaramu, ikoranabuhanga, uburezi n'udushya.",
      journey:
        "Urugendo rwanjye ruhuza uburezi n'ikoranabuhanga rufite intego yoroshye: gukora ibisubizo byorohereza abantu ubuzima no gufasha abaturage gutera imbere.",
      scoutBelief:
        "Nkumuskuti, nemera ko ikoranabuhanga ritagomba gukoreshwa mu gukora porogaramu gusa, ahubwo rigomba no gutanga amahirwe, guhuza abantu, gufasha imiryango no guteza imbere impinduka nziza.",
      myPurpose: "Intego yanjye",
      purposeText:
        "Gukora ibisubizo bifite akamaro. Guteza imbere abantu. Gukorera abaturage. Gutanga umusanzu mu rugendo rw'ikoranabuhanga mu Rwanda.",
      myValues: "Indangagaciro zanjye",
      value1: "Intego",
      value2: "Udushya",
      value3: "Gukorera abandi",
      value4: "Kwiga buri gihe",
      value5: "Impinduka nziza ku baturage",

      myscoutRwanda: "MYSCOUT RWANDA",
      buildingFuture: "Kubaka ejo hazaza h'",
      digitalScouting: "Ubukuti bw'Ikoranabuhanga mu Rwanda",
      msrDescription1:
        "MyScout Rwanda ni urubuga rw'ikoranabuhanga rwakozwe mu rwego rwo gufasha ibikorwa by'Ubukuti, guhuza Abaskuti, kunoza itumanaho, gutunganya amakuru no guteza imbere uruhare rw'ikoranabuhanga mu muryango w'Abaskuti.",
      msrDescription2:
        "MSR igaragaza icyerekezo cyo gukoresha ikoranabuhanga mu gufasha abantu n'imiryango, no kugira uruhare mu kubaka u Rwanda rukomeye kandi ruhujwe n'ikoranabuhanga.",
      quote:
        "Ikoranabuhanga rigira agaciro iyo ritanga amahirwe kandi rikazana impinduka nziza.",
      quoteAuthor: "— Icyerekezo cy'Iterambere rya MSR",
      slogan: "Educate. Empower. Change. Build.",

      selectedWork: "IMIRIMO NATORANYIJE",
      projectsPurpose: "Imishinga yubatswe ifite",
      projectPurpose: "Intego",

      mainProject: "UMUSHINGA MUKURU",
      scoutingPlatform: "UBUKUTI • URUBUGA RW'IKORANABUHANGA",
      msrProjectDescription:
        "Urubuga rw'ikoranabuhanga rwakozwe mu rwego rwo gufasha ibikorwa by'Ubukuti, Abaskuti, itumanaho, ibikorwa, uruhare rw'abaturage n'imicungire y'umuryango mu Rwanda.",
      exploreMsr: "Reba MSR →",

      project: "UMUSHINGA",
      hospitality: "AMAHOTELI • IGISUBIZO CY'IKORANABUHANGA",
      rhmsDescription:
        "Igisubizo cy'ikoranabuhanga cyakozwe mu gufasha ibikorwa by'amahoteli, imicungire yabyo no kunoza serivisi hifashishijwe urubuga rwa none.",
      openProject: "Fungura umushinga →",

      softwareInnovation: "POROGARAMU • UDUSHYA",
      pascalDescription:
        "Umushinga wa porogaramu ugamije gukora ibisubizo by'ikoranabuhanga bifatika no gushaka uburyo bushya bwo gukemura ibibazo bihari.",

      whatIBuild: "IBYO NTEZA IMBERE",
      ideasSolutions: "Guhindura ibitekerezo",
      solutions: "ibisubizo",

      webApplications: "Porogaramu zo kuri Web",
      webApplicationsDesc:
        "Uburyo bugezweho kandi bufatika bwo gukoresha ikoranabuhanga bwubakiye ku bikenewe.",
      digitalPlatforms: "Imbuga z'Ikoranabuhanga",
      digitalPlatformsDesc:
        "Imbuga zifasha imiryango gucunga ibikorwa, amakuru n'abantu mu buryo bunoze.",
      educationTechnology: "Ikoranabuhanga mu Burezi",
      educationTechnologyDesc:
        "Ibitekerezo bishingiye ku ikoranabuhanga bifasha kwigisha, kwiga no kubona ubumenyi.",
      digitalInnovation: "Udushya mu Ikoranabuhanga",
      digitalInnovationDesc:
        "Uburyo bushya bwo guhindura ibibazo amahirwe yo kuzana impinduka nziza.",
      communitySolutions: "Ibisubizo by'Abaturage",
      communitySolutionsDesc:
        "Ibisubizo by'ikoranabuhanga byubakwa hitawe ku bantu, abaturage n'impinduka zifite akamaro.",
      continuousGrowth: "Gukomeza Gutera Imbere",
      continuousGrowthDesc:
        "Kwiga, kugerageza, kunoza no gukora ibisubizo byiza buri munsi.",

      developmentPhilosophy: "IMYUMVIRE YANJYE MU ITERAMBERE",
      buildPurpose: "Kubaka ufite intego.",
      serveTechnology: "Gukorera abandi ukoresheje ikoranabuhanga.",
      philosophyText:
        "Nemera ko ikoranabuhanga ryiza atari irikora gusa. Ni irikemura ibibazo bifite akamaro, rigatanga amahirwe, rigateza imbere abantu kandi rikazana impinduka nziza.",

      letsConnect: "REKA DUHUZE",
      haveIdea: "Ufite igitekerezo?",
      meaningful: "Reka twubake ikintu gifite akamaro.",
      contactText:
        "Waba ufite umushinga w'ikoranabuhanga, igitekerezo mu burezi, igisubizo kigenewe abaturage, cyangwa amahirwe yo guteza imbere impinduka nziza, nishimira ko twavugana.",
      emailMe: "Nyandikira kuri Email",
      developer: "UTEZA IMBERE MSR",
      softwareDeveloper: "Umuteza imbere porogaramu",
      technologyEducator: "Umwigisha w'Ikoranabuhanga",
      rwandanScout: "Umuskuti w'u Rwanda",

      builtForRwanda: "Byubatswe bifite intego ku Rwanda 🇷🇼",
    },
  };

  const t = text[language];

  return (
    <div style={styles.page}>
      {/* ============================================================
          TOP NAVIGATION
      ============================================================ */}
      <header style={styles.topBar}>
        <div style={styles.brandArea}>
          <div style={styles.logoMark}>MSR</div>

          <div>
            <div style={styles.brandName}>MyScout Rwanda</div>

            <div style={styles.brandSubtitle}>
              {t.brandSubtitle}
            </div>
          </div>
        </div>

        <div style={styles.topRight}>
          <div style={styles.languageSwitcher}>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              style={{
                ...styles.languageButton,
                ...(language === "en" ? styles.languageActive : {}),
              }}
            >
              ENG
            </button>

            <span style={styles.languageDivider}>|</span>

            <button
              type="button"
              onClick={() => setLanguage("rw")}
              style={{
                ...styles.languageButton,
                ...(language === "rw" ? styles.languageActive : {}),
              }}
            >
              KINY
            </button>
          </div>

          <Link to="/" style={styles.backButton}>
            ← {t.back}
          </Link>
        </div>
      </header>

      {/* ============================================================
          HERO
      ============================================================ */}
      <section style={styles.hero}>
        <div style={styles.heroGlowOne}></div>
        <div style={styles.heroGlowTwo}></div>

        <div
          className="msr-hero-container"
          style={styles.heroContainer}
        >
          {/* IMAGE LEFT */}
          <div
            className="msr-image-column"
            style={styles.imageColumn}
          >
            <div
              className="msr-image-outer-ring"
              style={styles.imageOuterRing}
            >
              <div
                className="msr-image-inner-ring"
                style={styles.imageInnerRing}
              >
                <img
                  src={oscar}
                  alt="Hagenimana Oscar"
                  className="msr-profile-image"
                  style={styles.profileImage}
                />
              </div>
            </div>

            <div style={styles.imageBadge}>
              <span style={styles.badgeDot}></span>
              {t.buildingImpact}
            </div>
          </div>

          {/* CONTENT RIGHT */}
          <div
            className="msr-hero-content"
            style={styles.heroContent}
          >
            <div style={styles.eyebrow}>
              <span style={styles.eyebrowLine}></span>
              {t.eyebrow}
            </div>

            <h1
              className="msr-hero-title"
              style={styles.heroTitle}
            >
              Hagenimana{" "}
              <span style={styles.highlight}>Oscar</span>
            </h1>

            <h2
              className="msr-hero-role"
              style={styles.heroRole}
            >
              {t.role}
            </h2>

            <p
              className="msr-hero-description"
              style={styles.heroDescription}
            >
              {t.heroDescription}
            </p>

            <div style={styles.missionBox}>
              <div style={styles.missionIcon}>⚜</div>

              <p style={styles.missionText}>
                {t.mission}
              </p>
            </div>

            <div
              className="msr-hero-actions"
              style={styles.heroActions}
            >
              <a href="#contact" style={styles.primaryButton}>
                {t.contact}
                <span style={styles.buttonArrow}>→</span>
              </a>

              <a href="#projects" style={styles.secondaryButton}>
                {t.explore}
              </a>
            </div>

            <div
              className="msr-scout-identity"
              style={styles.scoutIdentity}
            >
              <span style={styles.scoutIcon}>⚜</span>

              <span>{t.identity}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS
      ============================================================ */}
      <section style={styles.statsSection}>
        <div
          className="msr-stats-container"
          style={styles.statsContainer}
        >
          <div style={styles.statCard}>
            <div style={styles.statNumber}>01</div>

            <div style={styles.statLabel}>
              {t.msrDevelopment}
            </div>

            <div style={styles.statDescription}>
              {t.msrDevelopmentDesc}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>03+</div>

            <div style={styles.statLabel}>
              {t.digitalProjects}
            </div>

            <div style={styles.statDescription}>
              {t.digitalProjectsDesc}
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statNumber}>∞</div>

            <div style={styles.statLabel}>
              {t.learningInnovation}
            </div>

            <div style={styles.statDescription}>
              {t.learningInnovationDesc}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ABOUT ME
      ============================================================ */}
      <section style={styles.section}>
        <div style={styles.sectionContainer}>
          <div
            className="msr-section-heading"
            style={styles.sectionHeading}
          >
            <span
              className="msr-section-number"
              style={styles.sectionNumber}
            >
              01
            </span>

            <div>
              <div style={styles.sectionEyebrow}>
                {t.aboutDeveloper}
              </div>

              <h2
                className="msr-section-title"
                style={styles.sectionTitle}
              >
                {t.technologyPurpose}{" "}
                <span style={styles.highlight}>
                  {t.purpose}
                </span>
              </h2>
            </div>
          </div>

          <div
            className="msr-about-grid"
            style={styles.aboutGrid}
          >
            <div style={styles.aboutMain}>
              <p style={styles.largeParagraph}>
                {t.aboutIntro}
              </p>

              <p style={styles.paragraph}>
                {t.journey}
              </p>

              <p style={styles.paragraph}>
                {t.scoutBelief}
              </p>

              <div style={styles.impactStatement}>
                <span style={styles.impactLine}></span>

                <div>
                  <strong style={styles.impactTitle}>
                    {t.myPurpose}
                  </strong>

                  <p style={styles.impactText}>
                    {t.purposeText}
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.valuesCard}>
              <div style={styles.valuesTop}>
                <span style={styles.valuesIcon}>⚜</span>

                <span style={styles.valuesTitle}>
                  {t.myValues}
                </span>
              </div>

              <div style={styles.valueItem}>
                <span>01</span>
                <strong>{t.value1}</strong>
              </div>

              <div style={styles.valueItem}>
                <span>02</span>
                <strong>{t.value2}</strong>
              </div>

              <div style={styles.valueItem}>
                <span>03</span>
                <strong>{t.value3}</strong>
              </div>

              <div style={styles.valueItem}>
                <span>04</span>
                <strong>{t.value4}</strong>
              </div>

              <div style={styles.valueItem}>
                <span>05</span>
                <strong>{t.value5}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          MSR SECTION
      ============================================================ */}
      <section
        className="msr-section"
        style={styles.msrSection}
      >
        <div
          className="msr-msr-container"
          style={styles.msrContainer}
        >
          <div style={styles.msrContent}>
            <div style={styles.sectionEyebrowLight}>
              {t.myscoutRwanda}
            </div>

            <h2
              className="msr-section-title"
              style={styles.msrTitle}
            >
              {t.buildingFuture}
              <br />
              <span>{t.digitalScouting}</span>
            </h2>

            <p style={styles.msrParagraph}>
              {t.msrDescription1}
            </p>

            <p style={styles.msrParagraph}>
              {t.msrDescription2}
            </p>

            <div style={styles.msrQuote}>
              <span style={styles.quoteMark}>“</span>

              <div>
                <p style={styles.quoteText}>
                  {t.quote}
                </p>

                <span style={styles.quoteAuthor}>
                  {t.quoteAuthor}
                </span>
              </div>
            </div>
          </div>

          <div
            className="msr-msr-visual"
            style={styles.msrVisual}
          >
            <div style={styles.msrLogoLarge}>MSR</div>

            <div style={styles.msrVisualTitle}>
              MyScout Rwanda
            </div>

            <div style={styles.msrVisualSubtitle}>
              {t.slogan}
            </div>

            <div style={styles.colorStrip}>
              <span style={{ background: "#6A1B9A" }}></span>
              <span style={{ background: "#4A148C" }}></span>
              <span style={{ background: "#002B5C" }}></span>
              <span style={{ background: "#FFD100" }}></span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PROJECTS
      ============================================================ */}
      <section
        id="projects"
        style={styles.section}
      >
        <div style={styles.sectionContainer}>
          <div
            className="msr-section-heading"
            style={styles.sectionHeading}
          >
            <span
              className="msr-section-number"
              style={styles.sectionNumber}
            >
              02
            </span>

            <div>
              <div style={styles.sectionEyebrow}>
                {t.selectedWork}
              </div>

              <h2
                className="msr-section-title"
                style={styles.sectionTitle}
              >
                {t.projectsPurpose}{" "}
                <span style={styles.highlight}>
                  {t.projectPurpose}
                </span>
              </h2>
            </div>
          </div>

          <div
            className="msr-projects-grid"
            style={styles.projectsGrid}
          >
            {/* MSR */}
            <div style={styles.projectCard}>
              <div style={styles.projectTop}>
                <span style={styles.projectNumber}>01</span>

                <span style={styles.projectStatus}>
                  {t.mainProject}
                </span>
              </div>

              <div style={styles.projectIconBox}>⚜</div>

              <div style={styles.projectCategory}>
                {t.scoutingPlatform}
              </div>

              <h3 style={styles.projectTitle}>
                MyScout Rwanda
              </h3>

              <p style={styles.projectDescription}>
                {t.msrProjectDescription}
              </p>

              <div style={styles.projectFooter}>
                <span style={styles.projectTag}>MSR</span>

                <Link to="/" style={styles.projectLink}>
                  {t.exploreMsr}
                </Link>
              </div>
            </div>

            {/* RHMS */}
            <div style={styles.projectCard}>
              <div style={styles.projectTop}>
                <span style={styles.projectNumber}>02</span>

                <span style={styles.projectStatus}>
                  {t.project}
                </span>
              </div>

              <div style={styles.projectIconBox}>🏨</div>

              <div style={styles.projectCategory}>
                {t.hospitality}
              </div>

              <h3 style={styles.projectTitle}>
                Rwanda Hotel Management System
              </h3>

              <p style={styles.projectDescription}>
                {t.rhmsDescription}
              </p>

              <div style={styles.projectFooter}>
                <span style={styles.projectTag}>RHMS</span>

                <a
                  href="https://rhms-frontend-blush.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.projectLink}
                >
                  {t.openProject}
                </a>
              </div>
            </div>

            {/* PASCAL */}
            <div style={styles.projectCard}>
              <div style={styles.projectTop}>
                <span style={styles.projectNumber}>03</span>

                <span style={styles.projectStatus}>
                  {t.project}
                </span>
              </div>

              <div style={styles.projectIconBox}>💡</div>

              <div style={styles.projectCategory}>
                {t.softwareInnovation}
              </div>

              <h3 style={styles.projectTitle}>
                Pascal App
              </h3>

              <p style={styles.projectDescription}>
                {t.pascalDescription}
              </p>

              <div style={styles.projectFooter}>
                <span style={styles.projectTag}>
                  PASCAL
                </span>

                <a
                  href="https://pascal-app.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.projectLink}
                >
                  {t.openProject}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT I BUILD
      ============================================================ */}
      <section style={styles.capabilitiesSection}>
        <div style={styles.sectionContainer}>
          <div
            className="msr-section-heading"
            style={styles.sectionHeading}
          >
            <span
              className="msr-section-number"
              style={styles.sectionNumber}
            >
              03
            </span>

            <div>
              <div style={styles.sectionEyebrow}>
                {t.whatIBuild}
              </div>

              <h2
                className="msr-section-title"
                style={styles.sectionTitle}
              >
                {t.ideasSolutions}{" "}
                <span style={styles.highlight}>
                  {t.solutions}
                </span>
              </h2>
            </div>
          </div>

          <div
            className="msr-capabilities-grid"
            style={styles.capabilitiesGrid}
          >
            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>01</span>
              <div style={styles.capabilityIcon}>◈</div>

              <h3>{t.webApplications}</h3>

              <p>{t.webApplicationsDesc}</p>
            </div>

            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>02</span>
              <div style={styles.capabilityIcon}>▣</div>

              <h3>{t.digitalPlatforms}</h3>

              <p>{t.digitalPlatformsDesc}</p>
            </div>

            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>03</span>
              <div style={styles.capabilityIcon}>✦</div>

              <h3>{t.educationTechnology}</h3>

              <p>{t.educationTechnologyDesc}</p>
            </div>

            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>04</span>
              <div style={styles.capabilityIcon}>◇</div>

              <h3>{t.digitalInnovation}</h3>

              <p>{t.digitalInnovationDesc}</p>
            </div>

            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>05</span>
              <div style={styles.capabilityIcon}>◎</div>

              <h3>{t.communitySolutions}</h3>

              <p>{t.communitySolutionsDesc}</p>
            </div>

            <div style={styles.capabilityCard}>
              <span style={styles.capabilityNumber}>06</span>
              <div style={styles.capabilityIcon}>↗</div>

              <h3>{t.continuousGrowth}</h3>

              <p>{t.continuousGrowthDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          PHILOSOPHY
      ============================================================ */}
      <section
        className="msr-philosophy"
        style={styles.philosophySection}
      >
        <div style={styles.philosophyContainer}>
          <div style={styles.philosophyMark}>⚜</div>

          <div style={styles.philosophyEyebrow}>
            {t.developmentPhilosophy}
          </div>

          <h2
            className="msr-philosophy-title"
            style={styles.philosophyTitle}
          >
            {t.buildPurpose}
            <br />
            <span>{t.serveTechnology}</span>
          </h2>

          <p style={styles.philosophyText}>
            {t.philosophyText}
          </p>

          <div
            className="msr-philosophy-slogan"
            style={styles.philosophySlogan}
          >
            <span>EDUCATE</span>
            <i>•</i>
            <span>EMPOWER</span>
            <i>•</i>
            <span>CHANGE</span>
            <i>•</i>
            <span>BUILD</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          CONTACT
      ============================================================ */}
      <section
        id="contact"
        className="msr-contact"
        style={styles.contactSection}
      >
        <div
          className="msr-contact-container"
          style={styles.contactContainer}
        >
          <div style={styles.contactContent}>
            <div style={styles.sectionEyebrowLight}>
              {t.letsConnect}
            </div>

            <h2
              className="msr-contact-title"
              style={styles.contactTitle}
            >
              {t.haveIdea}
              <br />
              <span>{t.meaningful}</span>
            </h2>

            <p style={styles.contactText}>
              {t.contactText}
            </p>

            <div
              className="msr-contact-buttons"
              style={styles.contactButtons}
            >
              <a
                href="https://wa.me/250791970956"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.contactPrimary}
              >
                WhatsApp
                <span>→</span>
              </a>

              <a
                href="mailto:hagenimanaoscar43@gmail.com"
                style={styles.contactSecondary}
              >
                {t.emailMe}
                <span>→</span>
              </a>
            </div>
          </div>

          <div
            className="msr-contact-card"
            style={styles.contactCard}
          >
            <div style={styles.contactCardIcon}>⚜</div>

            <div style={styles.contactCardLabel}>
              {t.developer}
            </div>

            <div style={styles.contactCardName}>
              Hagenimana Oscar
            </div>

            <div style={styles.contactCardRole}>
              {t.softwareDeveloper}
              <br />
              {t.technologyEducator}
              <br />
              {t.rwandanScout}
            </div>

            <div style={styles.contactCardLine}></div>

            <div style={styles.contactCardEmail}>
              hagenimanaoscar43@gmail.com
            </div>

            <div style={styles.contactCardPhone}>
              +250 791 970 956
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer style={styles.footer}>
        <div
          className="msr-footer-container"
          style={styles.footerContainer}
        >
          <div style={styles.footerBrand}>
            <div style={styles.footerLogo}>MSR</div>

            <div>
              <strong>MyScout Rwanda</strong>

              <span>
                Educate. Empower. Change. Build.
              </span>
            </div>
          </div>

          <div style={styles.footerCenter}>
            {t.builtForRwanda}
          </div>

          <div style={styles.footerCopy}>
            © {new Date().getFullYear()} MyScout Rwanda
          </div>
        </div>
      </footer>

      {/* ============================================================
          RESPONSIVE CSS
      ============================================================ */}
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html {
            scroll-behavior: smooth;
          }

          body {
            margin: 0;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
            background: #f8f7fb;
          }

          a {
            text-decoration: none;
          }

          @media (max-width: 900px) {
            .msr-hero-container {
              grid-template-columns: 1fr !important;
              text-align: center !important;
            }

            .msr-image-column {
              order: 1 !important;
            }

            .msr-hero-content {
              order: 2 !important;
            }

            .msr-hero-actions {
              justify-content: center !important;
            }

            .msr-scout-identity {
              justify-content: center !important;
            }

            .msr-about-grid {
              grid-template-columns: 1fr !important;
            }

            .msr-msr-container {
              grid-template-columns: 1fr !important;
            }

            .msr-msr-visual {
              max-width: 500px;
              margin: 20px auto 0;
            }

            .msr-projects-grid {
              grid-template-columns: 1fr !important;
            }

            .msr-capabilities-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }

            .msr-contact-container {
              grid-template-columns: 1fr !important;
            }

            .msr-contact-card {
              max-width: 500px;
              margin: 0 auto;
            }

            .msr-footer-container {
              flex-direction: column !important;
              text-align: center !important;
              gap: 20px !important;
            }
          }

          @media (max-width: 600px) {
            .msr-top-bar {
              padding: 16px 18px !important;
            }

            .msr-brand-subtitle {
              display: none !important;
            }

            .msr-back-button {
              padding: 9px 12px !important;
              font-size: 12px !important;
            }

            .msr-hero {
              padding: 65px 18px 70px !important;
            }

            .msr-hero-title {
              font-size: 42px !important;
              line-height: 1.05 !important;
            }

            .msr-hero-role {
              font-size: 16px !important;
            }

            .msr-hero-description {
              font-size: 15px !important;
            }

            .msr-image-outer-ring {
              width: 255px !important;
              height: 255px !important;
            }

            .msr-image-inner-ring {
              width: 231px !important;
              height: 231px !important;
            }

            .msr-profile-image {
              width: 219px !important;
              height: 219px !important;
            }

            .msr-stats-container {
              grid-template-columns: 1fr !important;
            }

            .msr-section {
              padding: 70px 18px !important;
            }

            .msr-section-title {
              font-size: 34px !important;
            }

            .msr-section-heading {
              gap: 15px !important;
            }

            .msr-section-number {
              font-size: 18px !important;
            }

            .msr-capabilities-grid {
              grid-template-columns: 1fr !important;
            }

            .msr-philosophy {
              padding: 75px 18px !important;
            }

            .msr-philosophy-title {
              font-size: 38px !important;
            }

            .msr-philosophy-slogan {
              flex-wrap: wrap !important;
              gap: 10px !important;
            }

            .msr-contact {
              padding: 70px 18px !important;
            }

            .msr-contact-title {
              font-size: 38px !important;
            }

            .msr-contact-buttons {
              flex-direction: column !important;
            }

            .msr-contact-primary,
            .msr-contact-secondary {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `}
      </style>
    </div>
  );
};

/* ================================================================
   STYLES
================================================================ */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F8F7FB",
    color: "#1B1B1F",
    overflowX: "hidden",
  },

  /* ================================================================
     TOP BAR
  ================================================================ */

  topBar: {
    position: "relative",
    zIndex: 10,
    minHeight: "74px",
    padding: "14px 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FFFFFF",
    borderBottom: "1px solid rgba(106, 27, 154, 0.10)",
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  logoMark: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #6A1B9A, #4A148C)",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    boxShadow: "0 7px 18px rgba(106, 27, 154, 0.22)",
  },

  brandName: {
    fontSize: "15px",
    fontWeight: "850",
    color: "#002B5C",
  },

  brandSubtitle: {
    marginTop: "2px",
    fontSize: "10px",
    color: "#77727E",
    letterSpacing: "0.7px",
    textTransform: "uppercase",
  },

  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  languageSwitcher: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 7px",
    borderRadius: "999px",
    background: "#F8F7FB",
    border: "1px solid rgba(106,27,154,0.12)",
  },

  languageButton: {
    border: "none",
    background: "transparent",
    color: "#77727E",
    padding: "5px 7px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: "850",
    cursor: "pointer",
  },

  languageActive: {
    background: "#6A1B9A",
    color: "#FFFFFF",
  },

  languageDivider: {
    color: "#B5AFBC",
    fontSize: "10px",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 17px",
    borderRadius: "999px",
    border: "1px solid rgba(106, 27, 154, 0.20)",
    color: "#4A148C",
    background: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "750",
    transition: "all 0.2s ease",
  },

  /* ================================================================
     HERO
  ================================================================ */

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: "90px 5% 100px",
    background:
      "linear-gradient(135deg, #002B5C 0%, #4A148C 52%, #6A1B9A 100%)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "500px",
    height: "500px",
    right: "-180px",
    top: "-220px",
    borderRadius: "50%",
    background: "rgba(255, 209, 0, 0.10)",
    filter: "blur(4px)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "420px",
    height: "420px",
    left: "-220px",
    bottom: "-240px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.06)",
  },

  heroContainer: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.85fr 1.35fr",
    gap: "75px",
    alignItems: "center",
  },

  imageColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  imageOuterRing: {
    width: "345px",
    height: "345px",
    borderRadius: "50%",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #FFD100, rgba(255,255,255,0.75), #FFD100)",
    boxShadow:
      "0 0 0 1px rgba(255,255,255,0.25), 0 25px 70px rgba(0,0,0,0.28)",
  },

  imageInnerRing: {
    width: "329px",
    height: "329px",
    borderRadius: "50%",
    padding: "6px",
    background: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  profileImage: {
    width: "317px",
    height: "317px",
    borderRadius: "50%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
  },

  imageBadge: {
    marginTop: "-18px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "999px",
    background: "#FFFFFF",
    color: "#4A148C",
    fontSize: "12px",
    fontWeight: "800",
    boxShadow: "0 12px 28px rgba(0,0,0,0.20)",
  },

  badgeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#FFD100",
  },

  heroContent: {
    color: "#FFFFFF",
  },

  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    color: "#FFD100",
    fontSize: "12px",
    fontWeight: "850",
    letterSpacing: "2px",
  },

  eyebrowLine: {
    width: "34px",
    height: "2px",
    background: "#FFD100",
  },

  heroTitle: {
    margin: 0,
    fontSize: "67px",
    lineHeight: "1.03",
    fontWeight: "900",
    letterSpacing: "-2.8px",
  },

  highlight: {
    color: "#FFD100",
  },

  heroRole: {
    maxWidth: "720px",
    margin: "20px 0 18px",
    color: "rgba(255,255,255,0.90)",
    fontSize: "20px",
    lineHeight: "1.5",
    fontWeight: "650",
  },

  heroDescription: {
    maxWidth: "700px",
    margin: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: "16px",
    lineHeight: "1.8",
  },

  missionBox: {
    maxWidth: "730px",
    marginTop: "27px",
    padding: "18px 20px",
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    borderLeft: "3px solid #FFD100",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "0 14px 14px 0",
  },

  missionIcon: {
    flexShrink: 0,
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFD100",
    color: "#4A148C",
    fontSize: "17px",
    fontWeight: "900",
  },

  missionText: {
    margin: 0,
    color: "rgba(255,255,255,0.93)",
    fontSize: "14px",
    lineHeight: "1.75",
    fontWeight: "550",
  },

  heroActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "30px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 22px",
    borderRadius: "10px",
    background: "#FFD100",
    color: "#002B5C",
    fontSize: "14px",
    fontWeight: "850",
    boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
  },

  buttonArrow: {
    fontSize: "18px",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "13px 21px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.30)",
    background: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "750",
  },

  scoutIdentity: {
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    gap: "9px",
    color: "rgba(255,255,255,0.68)",
    fontSize: "12px",
    fontWeight: "650",
  },

  scoutIcon: {
    color: "#FFD100",
    fontSize: "20px",
  },

  /* ================================================================
     STATS
  ================================================================ */

  statsSection: {
    position: "relative",
    marginTop: "-35px",
    padding: "0 5%",
    zIndex: 5,
  },

  statsContainer: {
    maxWidth: "1080px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },

  statCard: {
    padding: "25px 24px",
    borderRadius: "16px",
    background: "#FFFFFF",
    border: "1px solid rgba(106,27,154,0.10)",
    boxShadow: "0 15px 40px rgba(36, 20, 55, 0.10)",
  },

  statNumber: {
    color: "#6A1B9A",
    fontSize: "34px",
    lineHeight: "1",
    fontWeight: "900",
  },

  statLabel: {
    marginTop: "9px",
    color: "#002B5C",
    fontSize: "14px",
    fontWeight: "850",
  },

  statDescription: {
    marginTop: "7px",
    color: "#77727E",
    fontSize: "12px",
    lineHeight: "1.6",
  },

  /* ================================================================
     GENERAL SECTION
  ================================================================ */

  section: {
    padding: "100px 5%",
    background: "#F8F7FB",
  },

  sectionContainer: {
    maxWidth: "1120px",
    margin: "0 auto",
  },

  sectionHeading: {
    display: "flex",
    alignItems: "flex-start",
    gap: "22px",
    marginBottom: "50px",
  },

  sectionNumber: {
    paddingTop: "5px",
    color: "#FFD100",
    fontSize: "24px",
    lineHeight: "1",
    fontWeight: "900",
    WebkitTextStroke: "1px #4A148C",
  },

  sectionEyebrow: {
    color: "#6A1B9A",
    fontSize: "11px",
    fontWeight: "850",
    letterSpacing: "2px",
    marginBottom: "9px",
  },

  sectionTitle: {
    margin: 0,
    color: "#002B5C",
    fontSize: "43px",
    lineHeight: "1.15",
    letterSpacing: "-1.3px",
    fontWeight: "900",
  },

  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.8fr",
    gap: "65px",
    alignItems: "start",
  },

  aboutMain: {
    maxWidth: "730px",
  },

  largeParagraph: {
    margin: "0 0 22px",
    color: "#33313A",
    fontSize: "21px",
    lineHeight: "1.7",
    fontWeight: "550",
  },

  paragraph: {
    margin: "0 0 17px",
    color: "#68636F",
    fontSize: "15px",
    lineHeight: "1.9",
  },

  impactStatement: {
    marginTop: "28px",
    padding: "19px 20px",
    display: "flex",
    gap: "16px",
    borderRadius: "13px",
    background: "#FFFFFF",
    boxShadow: "0 12px 35px rgba(30, 15, 50, 0.07)",
  },

  impactLine: {
    width: "4px",
    flexShrink: 0,
    borderRadius: "999px",
    background: "#FFD100",
  },

  impactTitle: {
    color: "#4A148C",
    fontSize: "13px",
  },

  impactText: {
    margin: "5px 0 0",
    color: "#66616D",
    fontSize: "13px",
    lineHeight: "1.65",
  },

  valuesCard: {
    padding: "27px",
    borderRadius: "18px",
    background: "#FFFFFF",
    border: "1px solid rgba(106,27,154,0.10)",
    boxShadow: "0 18px 45px rgba(35,20,50,0.08)",
  },

  valuesTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },

  valuesIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#FFD100",
    color: "#4A148C",
    fontSize: "20px",
  },

  valuesTitle: {
    color: "#002B5C",
    fontSize: "17px",
    fontWeight: "850",
  },

  valueItem: {
    padding: "14px 0",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderBottom: "1px solid #EEEAF2",
  },

  /* ================================================================
     MSR SECTION
  ================================================================ */

  msrSection: {
    padding: "100px 5%",
    background:
      "linear-gradient(135deg, #002B5C 0%, #4A148C 58%, #6A1B9A 100%)",
    color: "#FFFFFF",
  },

  msrContainer: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.35fr 0.75fr",
    gap: "70px",
    alignItems: "center",
  },

  msrContent: {
    maxWidth: "760px",
  },

  sectionEyebrowLight: {
    color: "#FFD100",
    fontSize: "11px",
    fontWeight: "850",
    letterSpacing: "2px",
    marginBottom: "13px",
  },

  msrTitle: {
    margin: 0,
    fontSize: "46px",
    lineHeight: "1.15",
    letterSpacing: "-1.5px",
    fontWeight: "900",
  },

  msrParagraph: {
    margin: "22px 0 0",
    color: "rgba(255,255,255,0.75)",
    fontSize: "15px",
    lineHeight: "1.85",
  },

  msrQuote: {
    marginTop: "30px",
    padding: "20px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
  },

  quoteMark: {
    color: "#FFD100",
    fontSize: "45px",
    lineHeight: "0.7",
    fontWeight: "900",
  },

  quoteText: {
    margin: 0,
    color: "#FFFFFF",
    fontSize: "15px",
    lineHeight: "1.7",
    fontWeight: "650",
  },

  quoteAuthor: {
    display: "block",
    marginTop: "8px",
    color: "rgba(255,255,255,0.52)",
    fontSize: "11px",
  },

  msrVisual: {
    minHeight: "360px",
    padding: "40px 25px",
    borderRadius: "25px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.16)",
  },

  msrLogoLarge: {
    width: "125px",
    height: "125px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#FFFFFF",
    color: "#6A1B9A",
    border: "9px solid #FFD100",
    fontSize: "27px",
    fontWeight: "950",
    boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
  },

  msrVisualTitle: {
    marginTop: "23px",
    fontSize: "22px",
    fontWeight: "900",
  },

  msrVisualSubtitle: {
    marginTop: "7px",
    color: "#FFD100",
    fontSize: "12px",
    fontWeight: "750",
    letterSpacing: "0.5px",
  },

  colorStrip: {
    width: "150px",
    height: "6px",
    marginTop: "25px",
    display: "flex",
    overflow: "hidden",
    borderRadius: "999px",
  },

  /* ================================================================
     PROJECTS
  ================================================================ */

  projectsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  projectCard: {
    minHeight: "450px",
    padding: "25px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "19px",
    background: "#FFFFFF",
    border: "1px solid rgba(106,27,154,0.10)",
    boxShadow: "0 14px 40px rgba(30,15,50,0.07)",
  },

  projectTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  projectNumber: {
    color: "#6A1B9A",
    fontSize: "12px",
    fontWeight: "900",
  },

  projectStatus: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(255,209,0,0.18)",
    color: "#4A148C",
    fontSize: "9px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },

  projectIconBox: {
    width: "58px",
    height: "58px",
    marginTop: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    background:
      "linear-gradient(135deg, rgba(106,27,154,0.10), rgba(0,43,92,0.10))",
    color: "#6A1B9A",
    fontSize: "26px",
  },

  projectCategory: {
    marginTop: "23px",
    color: "#8A8290",
    fontSize: "9px",
    fontWeight: "850",
    letterSpacing: "1.2px",
  },

  projectTitle: {
    margin: "9px 0 0",
    color: "#002B5C",
    fontSize: "21px",
    lineHeight: "1.35",
    fontWeight: "900",
  },

  projectDescription: {
    margin: "14px 0 0",
    color: "#706A76",
    fontSize: "13px",
    lineHeight: "1.8",
  },

  projectFooter: {
    marginTop: "auto",
    paddingTop: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #EEEAF2",
  },

  projectTag: {
    color: "#6A1B9A",
    fontSize: "11px",
    fontWeight: "900",
  },

  projectLink: {
    color: "#002B5C",
    fontSize: "12px",
    fontWeight: "850",
  },

  /* ================================================================
     CAPABILITIES
  ================================================================ */

  capabilitiesSection: {
    padding: "100px 5%",
    background: "#FFFFFF",
  },

  capabilitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "17px",
  },

  capabilityCard: {
    position: "relative",
    minHeight: "210px",
    padding: "25px",
    overflow: "hidden",
    borderRadius: "16px",
    background: "#F8F7FB",
    border: "1px solid rgba(106,27,154,0.08)",
  },

  capabilityNumber: {
    position: "absolute",
    top: "18px",
    right: "20px",
    color: "rgba(106,27,154,0.12)",
    fontSize: "30px",
    fontWeight: "900",
  },

  capabilityIcon: {
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    background: "#FFFFFF",
    color: "#6A1B9A",
    fontSize: "20px",
    boxShadow: "0 7px 18px rgba(30,15,50,0.07)",
  },

  /* ================================================================
     PHILOSOPHY
  ================================================================ */

  philosophySection: {
    padding: "105px 5%",
    background: "#FFD100",
    color: "#002B5C",
  },

  philosophyContainer: {
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
  },

  philosophyMark: {
    width: "55px",
    height: "55px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#4A148C",
    color: "#FFD100",
    fontSize: "24px",
  },

  philosophyEyebrow: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "2px",
    color: "#4A148C",
  },

  philosophyTitle: {
    margin: "17px 0",
    fontSize: "53px",
    lineHeight: "1.1",
    letterSpacing: "-2px",
    fontWeight: "950",
  },

  philosophyText: {
    maxWidth: "720px",
    margin: "0 auto",
    color: "rgba(0,43,92,0.78)",
    fontSize: "16px",
    lineHeight: "1.85",
  },

  philosophySlogan: {
    marginTop: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "13px",
    color: "#4A148C",
    fontSize: "12px",
    fontWeight: "950",
    letterSpacing: "1.2px",
  },

  /* ================================================================
     CONTACT
  ================================================================ */

  contactSection: {
    padding: "100px 5%",
    background:
      "linear-gradient(135deg, #002B5C 0%, #4A148C 60%, #6A1B9A 100%)",
    color: "#FFFFFF",
  },

  contactContainer: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.35fr 0.75fr",
    gap: "70px",
    alignItems: "center",
  },

  contactContent: {
    maxWidth: "700px",
  },

  contactTitle: {
    margin: 0,
    fontSize: "49px",
    lineHeight: "1.12",
    letterSpacing: "-1.5px",
    fontWeight: "900",
  },

  contactText: {
    margin: "20px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: "15px",
    lineHeight: "1.85",
  },

  contactButtons: {
    marginTop: "30px",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  contactPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 22px",
    borderRadius: "10px",
    background: "#FFD100",
    color: "#002B5C",
    fontSize: "13px",
    fontWeight: "900",
  },

  contactSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    padding: "13px 21px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.28)",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: "800",
  },

  contactCard: {
    padding: "34px 28px",
    borderRadius: "21px",
    textAlign: "center",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.16)",
  },

  contactCardIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#FFD100",
    color: "#4A148C",
    fontSize: "25px",
  },

  contactCardLabel: {
    marginTop: "22px",
    color: "#FFD100",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "2px",
  },

  contactCardName: {
    marginTop: "8px",
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: "900",
  },

  contactCardRole: {
    marginTop: "10px",
    color: "rgba(255,255,255,0.62)",
    fontSize: "12px",
    lineHeight: "1.7",
  },

  contactCardLine: {
    width: "45px",
    height: "2px",
    margin: "20px auto",
    background: "#FFD100",
  },

  contactCardEmail: {
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: "650",
    wordBreak: "break-word",
  },

  contactCardPhone: {
    marginTop: "7px",
    color: "rgba(255,255,255,0.58)",
    fontSize: "12px",
  },

  /* ================================================================
     FOOTER
  ================================================================ */

  footer: {
    padding: "25px 5%",
    background: "#001E3F",
    color: "#FFFFFF",
  },

  footerContainer: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
  },

  footerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  footerLogo: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#6A1B9A",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: "900",
  },

  footerCenter: {
    color: "rgba(255,255,255,0.52)",
    fontSize: "11px",
  },

  footerCopy: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "10px",
  },
};

export default MSRDevelopmentTeam;
