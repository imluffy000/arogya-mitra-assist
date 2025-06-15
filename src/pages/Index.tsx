
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mic, Heart, Stethoscope } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import EmergencyPortal from "@/components/EmergencyPortal";
import VoiceAssistant from "@/components/VoiceAssistant";
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<'home' | 'chatbot' | 'emergency' | 'voice'>('home');

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'chatbot':
        return <ChatBot onBack={() => setActiveFeature('home')} />;
      case 'emergency':
        return <EmergencyPortal onBack={() => setActiveFeature('home')} />;
      case 'voice':
        return <VoiceAssistant onBack={() => setActiveFeature('home')} />;
      default:
        return <HomePage setActiveFeature={setActiveFeature} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-purple-100">
      {renderActiveFeature()}
    </div>
  );
};

const HomePage = ({ setActiveFeature }: { setActiveFeature: (feature: 'home' | 'chatbot' | 'emergency' | 'voice') => void }) => {
  const { toast } = useToast();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in flex items-center justify-center min-h-screen">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl w-full">
        {/* Left Column */}
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/40">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">ArogyaMitra AI</h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mt-2 mb-4">Your Multilingual AI Health Copilot</h2>
          
          <div className="flex items-center gap-6 my-6">
             <img src="/lovable-uploads/292d39f7-af5e-4668-aa9e-d35cba6e9668.png" alt="Doctor Illustration" className="w-24 h-24 rounded-full object-cover shrink-0" style={{ objectPosition: '15% 50%' }} />
            <p className="text-gray-700">
              Offers symptom checking, voice-based support, safe medicine suggestions, early risk alerts, and ambulance prompts, bridging healthcare gaps.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-md">
              <MessageCircle className="h-6 w-6 text-yellow-600 shrink-0" />
              <span className="font-semibold text-gray-700">Symptom Checking</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-md">
              <Stethoscope className="h-6 w-6 text-orange-500 shrink-0" />
              <span className="font-semibold text-gray-700">Medicine Suggestions</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">What brings you here today?</h2>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <Button
              variant="outline"
              className="h-32 bg-yellow-100 border-yellow-300 hover:bg-yellow-200 flex flex-col gap-2 text-gray-800 transition-transform hover:scale-105"
              onClick={() => setActiveFeature('chatbot')}
            >
              <span className="text-4xl">😟</span>
              <span className="font-semibold">Symptom Checking</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 bg-green-100 border-green-300 hover:bg-green-200 flex flex-col gap-2 text-gray-800 transition-transform hover:scale-105"
              onClick={() => {
                toast({
                  title: "Coming Soon! ✨",
                  description: "Mental Support feature is under development. Stay tuned!",
                })
              }}
            >
              <Heart className="h-10 w-10 text-red-500" />
              <span className="font-semibold">Mental Support</span>
            </Button>
          </div>
          <div className="relative mt-8 w-full max-w-md">
            <Input
              type="text"
              placeholder="Enter your symptoms or query here..."
              className="pr-14 h-14 text-lg border-2 border-gray-300 focus:border-purple-400"
              onFocus={() => setActiveFeature('chatbot')}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 bg-orange-500 hover:bg-orange-600 rounded-full"
              onClick={() => setActiveFeature('voice')}
            >
              <Mic className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
