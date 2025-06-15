
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Bot, User, Heart } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { getAiResponse } from '@/lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  onBack: () => void;
  type: 'symptom_checker' | 'mental_support';
}

const ChatBot = ({ onBack, type }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessages = {
      mental_support: "Hello! 👋 I'm ArogyaMitra, your AI friend. I'm here to listen and offer support. How are you feeling today? 💖",
      symptom_checker: "Hello! I'm ArogyaMitra. Please describe your symptoms, and I'll do my best to provide helpful information. Remember to consult a doctor for a diagnosis. 🩺"
    };

    setMessages([{
      id: '1',
      text: welcomeMessages[type],
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, [type]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const responseText = await getAiResponse(currentInput, i18n.language, type);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble right now. Please try again! 😔",
        sender: 'bot',
        timestamp: new Date()
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

  const titles = {
    symptom_checker: t('symptomChecker'),
    mental_support: t('mentalSupport'),
  };

  const placeholders = {
    symptom_checker: "e.g., 'I have a headache and a fever...' 🤒",
    mental_support: "Tell me how you're feeling... 😊",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToHome')}
          </Button>
        </div>

        <Card className="h-[600px] flex flex-col shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 animate-bounce" />
              <Heart className="h-5 w-5 text-pink-300 animate-pulse" />
              {titles[type]} - {t('appName')}
              <Heart className="h-5 w-5 text-pink-300 animate-pulse" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
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
                      <span className="text-xs opacity-75">ArogyaMitra is thinking... 🤔</span>
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

            <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholders[type]}
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
