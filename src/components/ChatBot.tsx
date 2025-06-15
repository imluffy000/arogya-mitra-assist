import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Bot, User, Globe, Heart, Stethoscope } from "lucide-react";
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

  const getMedicalResponse = (userMessage: string, language: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Medical responses in different languages
    const responses = {
      en: {
        fever: "Oh no! 🤒 You have a fever. Don't worry, I'm here to help! Fever means your body is fighting off germs - you're like a superhero inside! 🦸‍♀️\n\n✨ What you can do:\n• Rest like a sleeping bear 🐻\n• Drink lots of water (imagine you're a plant!) 🌱\n• Use a cool cloth on your forehead ❄️\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for adults\n• Children's Tylenol for kids (ask parents first!)\n• Ibuprofen for adults only\n\n⚠️ IMPORTANT: Always ask a doctor or grown-up before taking ANY medicine! Call a doctor if fever is over 102°F or lasts more than 3 days.\n\nTell me, do you have any other symptoms? 🤗",
        headache: "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\n✨ Try these gentle remedies:\n• Rest in a quiet, dark room like a cozy cave 🏠\n• Drink water slowly - your brain needs it! 💧\n• Put a soft, cool cloth on your head 🧊\n• Take deep breaths like you're smelling flowers 🌸\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for mild headaches\n• Ibuprofen for adults (not for children under 12)\n• Aspirin for adults only (NEVER for children!)\n\n⚠️ IMPORTANT: NEVER take medicine without asking a doctor or grown-up first! Get emergency help if headache is severe, with neck stiffness, or vision problems.\n\nWhat do you think might have caused your headache? 🤔",
        cold: "Achoo! 🤧 You caught a cold! Don't worry, colds are very common and you'll feel better soon! 🌈\n\n✨ Let's fight this cold together:\n• Rest lots - your body is working hard! 😴\n• Drink warm soup (it's like a hug for your throat!) 🍲\n• Honey and warm water can soothe your throat 🍯\n• Breathe steam from a warm shower 🚿\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Cough syrup for persistent cough\n• Saline nasal drops for stuffy nose\n• Pain relievers like Paracetamol for aches\n• Throat lozenges for sore throat (for older kids/adults)\n\n⚠️ IMPORTANT: Always consult a doctor before giving ANY medicine to children! Most colds get better on their own in 7-10 days.\n\nYou should feel better soon! Tell an adult if you feel much worse! 💪",
        default: "Hello my friend! 😊 I want to help you feel better! Can you tell me more about how you're feeling? 🤗\n\n🌟 To help you better, please tell me:\n• What part of your body doesn't feel good? 👤\n• When did you start feeling this way? ⏰\n• Does anything make it feel better or worse? 🤷‍♀️\n\n💡 Remember: I can suggest medicines, but you must ALWAYS ask a doctor or grown-up before taking ANY medicine! 👨‍⚕️👩‍⚕️\n\nYou're brave for asking about your health! 🦸‍♂️"
      },
      hi: {
        fever: "अरे! 🤒 आपको बुखार है! चिंता मत करो, मैं आपकी मदद करूंगा! 🦸‍♀️\n\n✨ आप यह कर सकते हैं:\n• भालू की तरह आराम करें 🐻\n• खूब पानी पिएं 🌱\n• माथे पर ठंडा कपड़ा रखें ❄️\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• पैरासिटामोल बड़ों के लिए\n• बच्चों के लिए बच्चों वाली दवा\n• इबुप्रोफेन केवल बड़ों के लिए\n\n⚠️ महत्वपूर्ण: कोई भी दवा लेने से पहले हमेशा डॉक्टर से पूछें! 🚨",
        headache: "अरे! 😔 आपके सिर में दर्द है! 🌟\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• पैरासिटामोल हल्के सिरदर्द के लिए\n• इबुप्रोफेन केवल बड़ों के लिए\n\n⚠️ महत्वपूर्ण: दवा लेने से पहले डॉक्टर से पूछें! 🚨",
        cold: "हैं-ची! 🤧 आपको सर्दी-जुकाम हुआ है! 🌈\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• खांसी की दवा\n• नाक की बूंदें\n• पैरासिटामोल दर्द के लिए\n\n⚠️ महत्वपूर्ण: बच्चों को कोई भी दवा देने से पहले डॉक्टर से सलाह लें! 🚨",
        default: "नमस्ते मेरे दोस्त! 😊 💡 याद रखें: मैं दवाइयों का सुझाव दे सकता हूँ, लेकिन कोई भी दवा लेने से पहले हमेशा डॉक्टर से पूछें! 👨‍⚕️👩‍⚕️"
      },
      te: {
        fever: "అయ్యో! 🤒 మీకు జ్వరం వచ్చిందా! 🦸‍♀️\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• పెరాసిటమాల్ పెద్దలకు\n• పిల్లలకు పిల్లల మందు\n\n⚠️ ముఖ్యం: ఏ మందు అయినా తీసుకునే ముందు డాక్టర్‌ని అడగండి! 🚨",
        headache: "అయ్యో! 😔 తల నొప్పిగా ఉందా! 🌟\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• పెరాసిటమాల్ తేలికపాటి తలనొప్పికి\n\n⚠️ ముఖ్యం: మందు తీసుకునే ముందు డాక్టర్‌ని అడగండి! 🚨",
        cough: "దగ్ గుమ్! 😷 🌪️\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• దగ్గు మందు\n• గొంతు మాత్రలు\n\n⚠️ ముఖ్యం: పిల్లలకు ఏ మందు అయినా ఇవ్వడానికి ముందు డాక్టర్‌ని సంప్రదించండి! 🚨",
        default: "నమస్కారం ధైర్యవంతుడా! 😊 💡 గుర్తుంచుకోండి: నేను మందులను సూచించగలను, కానీ ఏదైనా మందు తీసుకునే ముందు ఎల్లప్పుడూ డాక్టర్‌ని అడగాలి! 👨‍⚕️👩‍⚕️"
      },
      ta: {
        fever: "அய்யோ! 🤒 உங்களுக்கு காய்ச்சல் வந்துள்ளது! 🦸‍♀️\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனுமதியுடன் மட்டுமே!):\n• பாராசிட்டமால் பெரியவர்களுக்கு\n• குழந்தைகளுக்கு குழந்தைகள் மருந்து\n\n⚠️ முக்கியம்: எந்த மருந்தும் எடுக்கும் முன் மருத்துவரிடம் கேளுங்கள்! 🚨",
        headache: "அய்யோ! 😔 தலைவலி இருக்கிறதா! 🌟\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனுமதியுடன் மட்டுமே!):\n• பாராசிட்டமால் லேசான தலைவலிக்கு\n\n⚠️ முக்கியம்: மருந்து எடுக்கும் முன் மருத்துவரிடம் கேளுங்கள்! 🚨",
        cough: "இருமல்! 😷 🌪️\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனுமதியுடன் மட்டுமே!):\n• இருமல் மருந்து\n• தொண்டை மாத்திரைகள்\n\n⚠️ முக்கியம்: குழந்தைகளுக்கு எந்த மருந்தும் கொடுக்கும் முன் மருத்துவரை அணுகவும்! 🚨",
        default: "வணக்கம் சாहசமான நண்பரே! 😊 💡 நினைவில் வைக்கவும்: நான் மருந்துகளை பரிந்துரைக்க முடியும், ஆனால் எந்த மருந்தும் எடுக்கும் முன் எப்போதும் மருத்துவரிடம் கேட்க வேண்டும்! 👨‍⚕️👩‍⚕️"
      },
      bn: {
        fever: "হায়! 🤒 আপনার জ্বর হয়েছে! 🦸‍♀️\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• প্যারাসিটামল বড়দের জন্য\n• শিশুদের জন্য শিশুদের ওষুধ\n\n⚠️ গুরুত্বপূর্ণ: কোনো ওষুধ খাওয়ার আগে সবসময় ডাক্তারকে জিজ্ঞাসা করুন! 🚨",
        headache: "আহ! 😔 মাথাব্যথা হচ্ছে! 🌟\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• প্যারাসিটামল হালকা মাথাব্যথার জন্য\n\n⚠️ গুরুত্বপূর্ণ: ওষুধ খাওয়ার আগে ডাক্তারকে জিজ্ঞাসা করুন! 🚨",
        cough: "কাশি! 😷 🌪️\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• কাশির ওষুধ\n• গলার ট্যাবলেট\n\n⚠️ গুরুত্বপূর্ণ: শিশুদের কোনো ওষুধ দেওয়ার আগে ডাক্তারের সাথে পরামর্শ করুন! 🚨",
        default: "নমস্কার সাহসী বন্ধু! 😊 💡 মনে রাখবেন: আমি ওষুধের পরামর্শ দিতে পারি, তবে কোনো ওষুধ খাওয়ার আগে সবসময় ডাক্তারকে জিজ্ঞাসা করতে হবে! 👨‍⚕️👩‍⚕️"
      },
      es: {
        fever: "¡Oh no! 🤒 ¡Tienes fiebre! 🦸‍♀️\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Paracetamol para adultos\n• Medicina para niños\n\n⚠️ IMPORTANTE: ¡Siempre pregunta a un doctor antes de tomar cualquier medicina! 🚨",
        headache: "¡Ay! 😔 ¡Te duele la cabeza! 🌟\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Paracetamol para dolores leves\n\n⚠️ IMPORTANTE: ¡Pregunta al doctor antes de tomar medicina! 🚨",
        cold: "¡Achís! 🤧 🌈\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Jarabe para la tos\n• Pastillas para la garganta\n\n⚠️ IMPORTANTE: ¡Consulta a un doctor antes de dar cualquier medicina a los niños! 🚨",
        default: "¡Hola amigo valiente! 😊 💡 Recuerda: ¡Puedo sugerir medicinas, pero siempre debes preguntar a un doctor antes de tomar CUALQUIER medicina! 👨‍⚕️👩‍⚕️"
      },
      fr: {
        fever: "Oh là là! 🤒 Tu as de la fièvre! 🦸‍♀️\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Paracétamol pour les adultes\n• Médicament pour enfants\n\n⚠️ IMPORTANT: Demande toujours à un docteur avant de prendre des médicaments! 🚨",
        headache: "Aïe! 😔 Tu as mal à la tête! 🌟\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Paracétamol pour les douleurs légères\n\n⚠️ IMPORTANT: Demande au docteur avant de prendre des médicaments! 🚨",
        cold: "Atchoum! 🤧 🌈\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Sirop contre la toux\n• Pastilles pour la gorge\n\n⚠️ IMPORTANT: Consulte un docteur avant de donner des médicaments aux enfants! 🚨",
        default: "Bonjour ami courageux! 😊 💡 Souviens-toi: Je peux suggérer des médicaments, mais tu dois TOUJOURS demander à un docteur avant de prendre des médicaments! 👨‍⚕️👩‍⚕️"
      }
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('बुखार') || lowerMessage.includes('జ్వరం') || lowerMessage.includes('காய்ச்சல்') || lowerMessage.includes('জ্বর') || lowerMessage.includes('fiebre') || lowerMessage.includes('fièvre')) {
      return languageResponses.fever;
    } else if (lowerMessage.includes('headache') || lowerMessage.includes('सिरदर्द') || lowerMessage.includes('తలనొప్పి') || lowerMessage.includes('தலைவலி') || lowerMessage.includes('মাথাব্যথা') || lowerMessage.includes('dolor de cabeza') || lowerMessage.includes('mal de tête')) {
      return languageResponses.headache;
    } else if (lowerMessage.includes('cold') || lowerMessage.includes('cough') || lowerMessage.includes('सर्दी') || lowerMessage.includes('खांसी') || lowerMessage.includes('జలుబు') || lowerMessage.includes('దగ్గు') || lowerMessage.includes('சளி') || lowerMessage.includes('இருமல்') || lowerMessage.includes('সর্দি') || lowerMessage.includes('কাশি') || lowerMessage.includes('resfriado') || lowerMessage.includes('tos') || lowerMessage.includes('rhume') || lowerMessage.includes('toux')) {
      return languageResponses.cold;
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
