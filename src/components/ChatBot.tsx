
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Bot, User, Globe, Heart, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Groq from "groq-sdk";

// WARNING: Storing API keys directly in client-side code is insecure and exposes them to anyone who can view your app's source code.
// For production apps, it is highly recommended to use a backend proxy or serverless function to handle API calls securely.
const groqApiKey = "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";

const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true, // This is required for client-side API calls.
});

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

interface ChatBotProps {
  onBack: () => void;
}

const ChatBot = ({ onBack }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessages = {
      en: "Hello there! 👋 I'm ArogyaMitra's friendly medical assistant. I'm here to help you understand your health better! Whether you're feeling unwell or just curious about staying healthy, I'm here for you. What would you like to know today? 🩺",
      hi: "नमस्ते! 👋 मैं आरोग्यमित्र का दोस्ताना चिकित्सा सहायक हूँ। मैं आपको अपने स्वास्थ्य को बेहतर समझने में मदद करने के लिए यहाँ हूँ! आज आप क्या जानना चाहेंगे? 🩺",
      te: "నమస్కారం! 👋 నేను ఆరోగ్యమిత్ర యొక్క స్నేహపూర్వక వైద్య సహాయకుడిని. మీ ఆరోగ్యాన్ని మెరుగ్గా అర్థం చేసుకోవడంలో సహాయపడటానికి నేను ఇక్కడ ఉన్నాను! 🩺",
      ta: "வணக்கம்! 👋 நான் ஆரோக்யமித்ராவின் நட்பான மருத்துவ உதவியாளர். உங்கள் ஆரோக்கியத்தை சிறப்பாக புரிந்துகொள்ள உதவ நான் இங்கே இருக்கிறேன்! 🩺",
      bn: "নমস্কার! 👋 আমি আরোগ্যমিত্রের বন্ধুত্বপূর্ণ চিকিৎসক সহায়ক। আপনার স্বাস্থ্য ভালোভাবে বুঝতে সাহায্য করার জন্য আমি এখানে আছি! 🩺",
      es: "¡Hola! 👋 Soy el asistente médico amigable de ArogyaMitra. ¡Estoy aquí para ayudarte a entender mejor tu salud! 🩺",
      fr: "Bonjour! 👋 Je suis l'assistant médical amical d'ArogyaMitra. Je suis là pour vous aider à mieux comprendre votre santé! 🩺"
    };

    setMessages([{
      id: '1',
      text: welcomeMessages[selectedLanguage as keyof typeof welcomeMessages] || welcomeMessages.en,
      sender: 'bot',
      timestamp: new Date(),
      language: selectedLanguage
    }]);
  }, [selectedLanguage]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    const languageName = languages.find(l => l.code === selectedLanguage)?.name || 'English';

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are ArogyaMitra, a friendly and empathetic AI medical assistant. Your primary goal is to help users understand their health symptoms. You must follow these rules:
1. Always respond in the user's selected language: **${languageName}**.
2. Provide simple, clear, and safe general advice.
3. You can suggest possible over-the-counter remedies, but you MUST ALWAYS strongly emphasize that the user has to consult a real doctor or pharmacist before taking any medication. This is a critical safety instruction.
4. Use emojis (like 🩺, ❤️, 😊) to make the conversation friendly and approachable.
5. If a user's query sounds serious (e.g., chest pain, difficulty breathing, severe headache), you must strongly advise them to seek immediate medical attention or contact emergency services.
6. Begin your response by stating you are an AI assistant, not a real doctor. For example: "As an AI assistant, I'm not a real doctor, but I can offer some general information...".
7. Do not provide a diagnosis. You can only suggest possibilities based on symptoms.
8. Keep your responses concise and easy for a non-medical person to understand.`
          },
          {
            role: "user",
            content: currentInput,
          },
        ],
        model: "llama3-8b-8192",
      });

      const botResponseText = chatCompletion.choices[0]?.message?.content || "I'm having a little trouble thinking right now. Please try again in a moment.";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage,
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error fetching response from Groq:", error);
      toast({
        title: "Connection Error",
        description: "I'm sorry, I couldn't connect to my brain. Please check your connection and try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I seem to be having trouble connecting. Please check your internet connection and try again. If the problem persists, my circuits might be busy.",
          sender: 'bot',
          timestamp: new Date(),
          language: selectedLanguage,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600 animate-pulse" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 hover:scale-105 transition-transform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fun Medical Facts Banner */}
        <div className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="h-5 w-5 animate-pulse" />
            <span className="font-bold">💡 Did You Know?</span>
          </div>
          <p className="text-sm">Your heart beats about 100,000 times per day! That's like a super strong drum that never gets tired! 🥁❤️</p>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 animate-bounce" />
              <Heart className="h-5 w-5 text-pink-300 animate-pulse" />
              Medical ChatBot - ArogyaMitra
              <Heart className="h-5 w-5 text-pink-300 animate-pulse" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border-2 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gradient-to-r from-yellow-50 to-green-50 text-gray-800 px-4 py-2 rounded-lg border-2 border-yellow-200 shadow-md">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-xs opacity-75">Doctor is thinking... 🤔</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tell me how you're feeling... 😊"
                  className="flex-1 text-lg border-2 border-blue-300 focus:border-purple-400 hover:border-blue-400 transition-colors"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-transform shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;
