
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  onSelect: (langCode: string) => void;
}

const languages = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'Hindi (हिन्दी)' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)' },
  { code: 'mr-IN', name: 'Marathi (मराठी)' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
  { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
];

const LanguageSelector = ({ onSelect }: LanguageSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="text-center">
          <Globe className="mx-auto h-12 w-12 text-purple-600 mb-4" />
          <CardTitle className="text-2xl font-bold">Choose Your Language</CardTitle>
          <CardDescription>Select your preferred language to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                variant="outline"
                className="w-full text-lg py-6 hover:bg-purple-100 hover:text-purple-700 transition-colors"
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelector;
