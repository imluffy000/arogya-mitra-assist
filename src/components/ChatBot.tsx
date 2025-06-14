
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Bot, User, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
      en: "Hello! I'm ArogyaMitra's medical assistant. I can help you understand your symptoms and provide health guidance. What's bothering you today?",
      hi: "नमस्ते! मैं आरोग्यमित्र का चिकित्सा सहायक हूँ। मैं आपके लक्षणों को समझने और स्वास्थ्य मार्गदर्शन प्रदान करने में मदद कर सकता हूँ। आज आपको क्या परेशानी है?",
      te: "నమస్కారం! నేను ఆరోగ్యమిత్ర వైద్య సహాయకుడిని. మీ లక్షణాలను అర్థం చేసుకోవడంలో మరియు ఆరోగ్య మార్గదర్శకత్వం అందించడంలో నేను మీకు సహాయం చేయగలను. ఈరోజు మీకు ఏమి బాధ కలిగిస్తోంది?",
      ta: "வணக்கம்! நான் ஆரோக்யமித்ராவின் மருத்துவ உதவியாளர். உங்கள் அறிகுறிகளை புரிந்துகொள்வதிலும் சுகாதார வழிகாட்டுதல் வழங்குவதிலும் நான் உங்களுக்கு உதவ முடியும். இன்று உங்களுக்கு என்ன பிரச்சனை?",
      bn: "নমস্কার! আমি আরোগ্যমিত্রের চিকিৎসা সহায়ক। আমি আপনার লক্ষণগুলি বুঝতে এবং স্বাস্থ্য নির্দেশনা প্রদান করতে সাহায্য করতে পারি। আজ আপনার কী সমস্যা?",
      es: "¡Hola! Soy el asistente médico de ArogyaMitra. Puedo ayudarte a entender tus síntomas y brindarte orientación de salud. ¿Qué te molesta hoy?",
      fr: "Bonjour! Je suis l'assistant médical d'ArogyaMitra. Je peux vous aider à comprendre vos symptômes et vous fournir des conseils de santé. Qu'est-ce qui vous dérange aujourd'hui?"
    };

    setMessages([{
      id: '1',
      text: welcomeMessages[selectedLanguage as keyof typeof welcomeMessages] || welcomeMessages.en,
      sender: 'bot',
      timestamp: new Date(),
      language: selectedLanguage
    }]);
  }, [selectedLanguage]);

  const getMedicalResponse = (userMessage: string, language: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Medical responses in different languages
    const responses = {
      en: {
        fever: "I understand you have a fever. Fever is often a sign that your body is fighting an infection. Please monitor your temperature and consider these steps:\n\n• Rest and stay hydrated\n• Take fever reducers like paracetamol if needed\n• If fever persists above 102°F (38.9°C) for more than 3 days, please consult a doctor\n• Seek immediate medical attention if you have difficulty breathing, chest pain, or severe headache\n\nWould you like to tell me about any other symptoms?",
        headache: "Headaches can have various causes. Here's what I recommend:\n\n• Try to rest in a quiet, dark room\n• Stay hydrated\n• Apply a cold or warm compress to your head\n• Consider over-the-counter pain relievers\n• Avoid loud noises and bright lights\n\nIf headaches are severe, frequent, or accompanied by vision changes, neck stiffness, or confusion, please see a doctor immediately. What triggered your headache?",
        cold: "Common cold symptoms can be uncomfortable. Here's how to manage them:\n\n• Get plenty of rest\n• Drink warm fluids like herbal tea or soup\n• Use a humidifier or breathe steam\n• Gargle with warm salt water for sore throat\n• Consider vitamin C and zinc supplements\n\nSymptoms typically improve in 7-10 days. See a doctor if symptoms worsen or if you develop high fever, severe headache, or difficulty breathing.",
        default: "I understand you're experiencing some health concerns. For proper medical diagnosis, I recommend:\n\n• Describe your symptoms in detail\n• Note when they started\n• Mention any triggers or patterns\n• List current medications\n\nFor serious symptoms, please consult a healthcare professional immediately. Can you tell me more about your specific symptoms?"
      },
      hi: {
        fever: "मैं समझता हूँ कि आपको बुखार है। बुखार अक्सर इस बात का संकेत है कि आपका शरीर संक्रमण से लड़ रहा है। कृपया अपना तापमान देखते रहें और इन चरणों पर विचार करें:\n\n• आराम करें और हाइड्रेटेड रहें\n• जरूरत पड़ने पर पैरासिटामोल जैसी बुखार की दवा लें\n• यदि बुखार 102°F (38.9°C) से ऊपर 3 दिन से अधिक बना रहे तो डॉक्टर से मिलें\n• सांस लेने में कठिनाई, सीने में दर्द या गंभीर सिरदर्द होने पर तुरंत चिकित्सा सहायता लें\n\nक्या आप कोई अन्य लक्षण बताना चाहेंगे?",
        headache: "सिरदर्द के कई कारण हो सकते हैं। मैं यह सुझाता हूँ:\n\n• शांत, अंधेरे कमरे में आराम करने की कोशिश करें\n• हाइड्रेटेड रहें\n• सिर पर ठंडी या गर्म सिकाई करें\n• डॉक्टर की सलाह पर दर्द निवारक दवा लें\n• तेज आवाज़ और चमकदार रोशनी से बचें\n\nयदि सिरदर्द गंभीर है, बार-बार होता है, या इसके साथ दृष्टि में बदलाव, गर्दन में अकड़न या भ्रम है, तो तुरंत डॉक्टर से मिलें।",
        default: "मैं समझता हूँ कि आपको कुछ स्वास्थ्य समस्याएं हैं। उचित चिकित्सा निदान के लिए मैं सुझाता हूँ:\n\n• अपने लक्षणों का विस्तार से वर्णन करें\n• वे कब शुरू हुए इसका उल्लेख करें\n• किसी भी ट्रिगर या पैटर्न का उल्लेख करें\n• वर्तमान दवाओं की सूची बनाएं\n\nगंभीर लक्षणों के लिए कृपया तुरंत डॉक्टर से सलाह लें।"
      },
      te: {
        fever: "మీకు జ్వరం వచ్చిందని నేను అర్థం చేసుకున్నాను. జ్వరం తరచుగా మీ శరీరం ఇన్ఫెక్షన్‌తో పోరాడుతున్నదని సంకేతం. దయచేసి మీ ఉష్ణోగ్రతను పర్యవేక్షించండి మరియు ఈ దశలను పరిగణించండి:\n\n• విశ్రాంతి తీసుకోండి మరియు హైడ్రేటెడ్‌గా ఉండండి\n• అవసరమైతే పారాసెటమాల్ వంటి జ్వర నివారణ మందులు తీసుకోండి\n• జ్వరం 102°F (38.9°C) కంటే ఎక్కువ 3 రోజుల కంటే ఎక్కువ కాలం కొనసాగితే దయచేసి వైద్యుడిని సంప్రదించండి",
        default: "మీకు కొన్ని ఆరోగ్య సమస్యలు ఉన్నాయని నేను అర్థం చేసుకున్నాను. సరైన వైద్య నిర్ధారణ కోసం నేను సిఫార్సు చేస్తున్నాను:\n\n• మీ లక్షణాలను వివరంగా వర్ణించండి\n• అవి ఎప్పుడు ప్రారంభమైనవో చెప్పండి\n• ఏవైనా ట్రిగ్గర్‌లు లేదా నమూనాలను పేర్కొనండి\n\nతీవ్రమైన లక్షణాల కోసం దయచేసి వెంటనే వైద్య నిపుణుడిని సంప్రదించండి।"
      }
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('बुखार') || lowerMessage.includes('జ్వరం')) {
      return languageResponses.fever || languageResponses.default;
    } else if (lowerMessage.includes('headache') || lowerMessage.includes('सिरदर्द') || lowerMessage.includes('తలనొప్పి')) {
      return languageResponses.headache || languageResponses.default;
    } else if (lowerMessage.includes('cold') || lowerMessage.includes('सर्दी') || lowerMessage.includes('జలుబు')) {
      return languageResponses.cold || languageResponses.default;
    }
    
    return languageResponses.default;
  };

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
    setInputText('');
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getMedicalResponse(inputText, selectedLanguage),
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
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

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Medical ChatBot - ArogyaMitra
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs opacity-75">Typing...</span>
                    </div>
                    <div className="flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your symptoms or ask a medical question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700"
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
