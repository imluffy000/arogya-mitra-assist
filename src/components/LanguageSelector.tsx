
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
];

interface LanguageSelectorProps {
  onLanguageSelect: () => void;
}

const LanguageSelector = ({ onLanguageSelect }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    onLanguageSelect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500 mr-3 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              {i18n.language === 'en' ? 'Welcome' : i18n.language === 'hi' ? 'स्वागत है' : 'Welcome'}
            </h1>
          </div>
          <CardTitle className="text-2xl">{t('selectLanguage')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-6">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 transition-transform"
            >
              {lang.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelector;
