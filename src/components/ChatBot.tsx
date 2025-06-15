
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Bot, User, Heart, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  onBack: () => void;
}

const ChatBot = ({ onBack }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useAiDoctor, setUseAiDoctor] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage = useAiDoctor 
      ? "Hello! 👋 I'm ArogyaMitra's AI Doctor. I'm here to provide medical guidance and support. Please remember that while I can offer helpful information and advice, you should always consult with a licensed healthcare professional for serious medical concerns. How can I help you today? 🩺"
      : "Hello there! 👋 I'm ArogyaMitra's friendly medical assistant. I'm here to help you understand your health better! Whether you're feeling unwell or just curious about staying healthy, I'm here for you. What would you like to know today? 🩺";

    setMessages([{
      id: '1',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, [useAiDoctor]);

  const getMedicalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('fever')) {
      return "Oh no! 🤒 You have a fever. Don't worry, I'm here to help! Fever means your body is fighting off germs - you're like a superhero inside! 🦸‍♀️\n\n✨ What you can do:\n• Rest like a sleeping bear 🐻\n• Drink lots of water (imagine you're a plant!) 🌱\n• Use a cool cloth on your forehead ❄️\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for adults\n• Children's Tylenol for kids (ask parents first!)\n• Ibuprofen for adults only\n\n⚠️ IMPORTANT: Always ask a doctor or grown-up before taking ANY medicine! Call a doctor if fever is over 102°F or lasts more than 3 days.\n\nTell me, do you have any other symptoms? 🤗";
    } else if (lowerMessage.includes('headache')) {
      return "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\n✨ Try these gentle remedies:\n• Rest in a quiet, dark room like a cozy cave 🏠\n• Drink water slowly - your brain needs it! 💧\n• Put a soft, cool cloth on your head 🧊\n• Take deep breaths like you're smelling flowers 🌸\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for mild headaches\n• Ibuprofen for adults (not for children under 12)\n• Aspirin for adults only (NEVER for children!)\n\n⚠️ IMPORTANT: NEVER take medicine without asking a doctor or grown-up first! Get emergency help if headache is severe, with neck stiffness, or vision problems.\n\nWhat do you think might have caused your headache? 🤔";
    } else if (lowerMessage.includes('cold') || lowerMessage.includes('cough')) {
      return "Achoo! 🤧 You caught a cold! Don't worry, colds are very common and you'll feel better soon! 🌈\n\n✨ Let's fight this cold together:\n• Rest lots - your body is working hard! 😴\n• Drink warm soup (it's like a hug for your throat!) 🍲\n• Honey and warm water can soothe your throat 🍯\n• Breathe steam from a warm shower 🚿\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Cough syrup for persistent cough\n• Saline nasal drops for stuffy nose\n• Pain relievers like Paracetamol for aches\n• Throat lozenges for sore throat (for older kids/adults)\n\n⚠️ IMPORTANT: Always consult a doctor before giving ANY medicine to children! Most colds get better on their own in 7-10 days.\n\nYou should feel better soon! Tell an adult if you feel much worse! 💪";
    }
    
    return "Hello my friend! 😊 I want to help you feel better! Can you tell me more about how you're feeling? 🤗\n\n🌟 To help you better, please tell me:\n• What part of your body doesn't feel good? 👤\n• When did you start feeling this way? ⏰\n• Does anything make it feel better or worse? 🤷‍♀️\n\n💡 Remember: I can suggest medicines, but you must ALWAYS ask a doctor or grown-up before taking ANY medicine! 👨‍⚕️👩‍⚕️\n\nYou're brave for asking about your health! 🦸‍♂️";
  };

  const callAiDoctor = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return "Please enter your OpenAI API key to use the AI Doctor feature. 🔑";
    }

    try {
      const systemPrompt = `You are ArogyaMitra's AI Doctor, a compassionate and knowledgeable medical assistant. You provide medical guidance in a friendly, empathetic manner while always emphasizing the importance of consulting licensed healthcare professionals for serious concerns.

Key guidelines:
- Always be empathetic and supportive
- Provide helpful medical information and general advice
- Include medicine recommendations when appropriate, but ALWAYS emphasize consulting a doctor first
- Use emojis and friendly language to make conversations comfortable
- Ask follow-up questions to better understand symptoms
- Provide emergency guidance when necessary
- Remember you're talking to people of all ages, so keep language accessible
- Always end serious medical advice with "⚠️ Please consult a licensed healthcare professional for proper diagnosis and treatment."`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('AI Doctor API error:', error);
      return "I'm having trouble connecting right now. Please try again or use the basic medical assistant mode. 😔";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      let responseText: string;
      
      if (useAiDoctor && apiKey) {
        responseText = await callAiDoctor(inputText);
      } else {
        // Simulate delay for basic responses
        await new Promise(resolve => setTimeout(resolve, 2000));
        responseText = getMedicalResponse(inputText);
      }

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
        </div>

        {/* AI Doctor Toggle */}
        <div className="mb-6 bg-gradient-to-r from-purple-400 to-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <span className="font-bold">AI Doctor Mode 🤖</span>
            </div>
            <Button
              onClick={() => setUseAiDoctor(!useAiDoctor)}
              variant={useAiDoctor ? "secondary" : "outline"}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              {useAiDoctor ? "Enabled" : "Enable AI Doctor"}
            </Button>
          </div>
          {useAiDoctor && (
            <div className="mt-3">
              <Input
                type="password"
                placeholder="Enter OpenAI API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white text-gray-800"
              />
              <p className="text-xs mt-1 opacity-80">Required for AI Doctor mode</p>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 animate-bounce" />
              <Heart className="h-5 w-5 text-pink-300 animate-pulse" />
              {useAiDoctor ? "AI Doctor Mode" : "Medical ChatBot"} - ArogyaMitra
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
                      <span className="text-xs opacity-75">
                        {useAiDoctor ? "AI Doctor is thinking... 🤔" : "Doctor is thinking... 🤔"}
                      </span>
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
                  placeholder={useAiDoctor ? "Describe your symptoms to the AI Doctor... 🩺" : "Tell me how you're feeling... 😊"}
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
