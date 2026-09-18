import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import translations from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('msr-language');

    return savedLanguage === 'rw' || savedLanguage === 'en'
      ? savedLanguage
      : 'en';
  });

  useEffect(() => {
    localStorage.setItem('msr-language', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (newLanguage === 'en' || newLanguage === 'rw') {
      setLanguage(newLanguage);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider'
    );
  }

  return context;
};

export default LanguageContext;