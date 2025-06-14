
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Phone, Mic, MapPin, Heart, Shield } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import EmergencyPortal from "@/components/EmergencyPortal";
import VoiceAssistant from "@/components/VoiceAssistant";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {renderActiveFeature()}
    </div>
  );
};

const HomePage = ({ setActiveFeature }: { setActiveFeature: (feature: 'home' | 'chatbot' | 'emergency' | 'voice') => void }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-12 w-12 text-red-500 mr-3" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            ArogyaMitra
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your AI-powered healthcare companion providing multilingual medical assistance, emergency services, and voice-enabled support
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Chatbot Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-blue-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-blue-700">Medical ChatBot</CardTitle>
            <CardDescription className="text-gray-600">
              AI-powered multilingual medical assistant to help diagnose symptoms and provide health guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('chatbot')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              Start Chat
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Portal Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-red-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700">Emergency Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Immediate ambulance service with location detection for medical emergencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('emergency')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg pulse"
            >
              <Shield className="mr-2 h-5 w-5" />
              Emergency Help
            </Button>
          </CardContent>
        </Card>

        {/* Voice Assistant Card */}
        <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-green-300">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <Mic className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Voice Assistant</CardTitle>
            <CardDescription className="text-gray-600">
              Multilingual voice-enabled medical assistance for hands-free interaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setActiveFeature('voice')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              <Mic className="mr-2 h-5 w-5" />
              Voice Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-8">Why Choose ArogyaMitra?</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6">
            <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Location-Based Services</h3>
            <p className="text-gray-600">Automatic location detection for fastest emergency response</p>
          </div>
          <div className="p-6">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
            <p className="text-gray-600">Communicate in your preferred language for better care</p>
          </div>
          <div className="p-6">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">24/7 Availability</h3>
            <p className="text-gray-600">Always available when you need medical assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
