
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  voice: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', voice: 'en-US' },
  { code: 'hi', name: 'हिंदी (Hindi)', voice: 'hi-IN' },
  { code: 'te', name: 'తెలుగు (Telugu)', voice: 'te-IN' },
  { code: 'ta', name: 'தமிழ் (Tamil)', voice: 'ta-IN' },
  { code: 'bn', name: 'বাংলা (Bengali)', voice: 'bn-IN' },
  { code: 'es', name: 'Español (Spanish)', voice: 'es-ES' },
  { code: 'fr', name: 'Français (French)', voice: 'fr-FR' }
];

interface LanguageContextType {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
