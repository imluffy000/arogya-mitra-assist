
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/utils/translations";

const LanguageSelector = () => {
  const { selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => setIsSelectOpen(!isSelectOpen)}
        variant="outline"
        className="flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <Globe className="h-4 w-4 text-blue-600 animate-pulse" />
        {getTranslation(selectedLanguage, 'changeLanguage')}
      </Button>
      
      {isSelectOpen && (
        <div className="absolute z-50 mt-12 bg-white border rounded-lg shadow-lg p-2 min-w-48">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code);
                setIsSelectOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors ${
                selectedLanguage === lang.code ? 'bg-blue-100 font-semibold' : ''
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
