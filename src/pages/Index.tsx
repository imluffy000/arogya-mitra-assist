import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mic, Heart, Baby, Users, Stethoscope, Activity, BrainCircuit } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import VoiceAssistant from "@/components/VoiceAssistant";
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<'language' | 'home' | 'symptom_checker' | 'mental_support' | 'voice'>('language');

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'language':
        return <LanguageSelector onLanguageSelect={() => setActiveFeature('home')} />;
      case 'symptom_checker':
        return <ChatBot type="symptom_checker" onBack={() => setActiveFeature('home')} />;
      case 'mental_support':
        return <ChatBot type="mental_support" onBack={() => setActiveFeature('home')} />;
      case 'voice':
        return <VoiceAssistant onBack={() => setActiveFeature('home')} />;
      default:
        return <HomePage setActiveFeature={setActiveFeature} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {renderActiveFeature()}
    </div>
  );
};

const HomePage = ({ setActiveFeature }: { setActiveFeature: (feature: 'home' | 'symptom_checker' | 'mental_support' | 'voice') => void }) => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-red-500 mr-3 animate-pulse" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-scale-in">
            {t('appName')}
          </h1>
          <Heart className="h-12 w-12 text-red-500 ml-3 animate-pulse" />
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t('appDescription')}
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-lg">
          <Baby className="h-6 w-6 text-pink-500 animate-bounce" />
          <span className="text-pink-600 font-semibold">Kid-Friendly</span>
          <span className="text-gray-400">•</span>
          <Users className="h-6 w-6 text-blue-500 animate-bounce" />
          <span className="text-blue-600 font-semibold">Senior-Friendly</span>
        </div>
      </div>

      {/* Medical Awareness Banner */}
      <div className="mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl animate-scale-in">
        <div className="flex items-center gap-3 mb-3">
          <Activity className="h-8 w-8 animate-pulse" />
          <h2 className="text-2xl font-bold">Health Awareness Tips</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span>Wash your hands frequently</span>
          </div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 animate-pulse" />
            <span>Drink plenty of water</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            <span>Get regular exercise</span>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {/* Symptom Checker Card */}
        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 border-2 hover:border-blue-300 animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit hover:animate-bounce">
              <Stethoscope className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-700 mb-2">{t('symptomChecker')}</CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              {t('symptomCheckerDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('symptom_checker')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              {t('startChat')}
            </Button>
          </CardContent>
        </Card>

        {/* Mental Support Card */}
        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 border-2 hover:border-pink-300 animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-fit hover:animate-bounce">
              <BrainCircuit className="h-10 w-10 text-pink-600" />
            </div>
            <CardTitle className="text-2xl text-pink-700 mb-2">{t('mentalSupport')}</CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              {t('mentalSupportDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('mental_support')}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              {t('startChat')}
            </Button>
          </CardContent>
        </Card>

        {/* Voice Assistant Card */}
        <Card className="hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 border-2 hover:border-green-300 animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full w-fit hover:animate-bounce">
              <Mic className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700 mb-2">{t('voiceAssistant')}</CardTitle>
            <CardDescription className="text-gray-600 leading-relaxed">
              {t('voiceAssistantDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('voice')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              <Mic className="mr-2 h-6 w-6" />
              {t('startVoiceChat')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Features Section */}
      <div className="mt-16 text-center animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-700 mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Why Choose ArogyaMitra?
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:scale-105 transform duration-300">
            <MessageCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-3 text-green-700">Multilingual Support</h3>
            <p className="text-gray-600">Available in multiple languages for easy access.</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow hover:scale-105 transform duration-300">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold mb-3 text-red-700">24/7 Availability</h3>
            <p className="text-gray-600">We are available round the clock to assist you.</p>
          </div>
        </div>
      </div>

      {/* Special Features for All Ages */}
      <div className="mt-16 bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 p-8 rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Special Features for All Ages
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Baby className="h-8 w-8 text-pink-500 animate-bounce" />
              <h3 className="text-xl font-semibold text-pink-700">For Children</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Fun and interactive health tips</li>
              <li>• Child-friendly medical advice</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-blue-500 animate-bounce" />
              <h3 className="text-xl font-semibold text-blue-700">For Elderly</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Easy-to-use voice commands</li>
              <li>• Large text and clear visuals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
