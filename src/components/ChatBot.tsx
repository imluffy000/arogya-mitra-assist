
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
        fever: "Oh no! 🤒 You have a fever. Don't worry, I'm here to help! Fever means your body is fighting off germs - you're like a superhero inside! 🦸‍♀️\n\n✨ What you can do:\n• Rest like a sleeping bear 🐻\n• Drink lots of water (imagine you're a plant!) 🌱\n• Take medicine if an adult says it's okay 💊\n• Use a cool cloth on your forehead ❄️\n\n🚨 Ask an adult to call a doctor if:\n• Your fever is very high (over 102°F)\n• You have trouble breathing\n• You feel very sick for more than 3 days\n\nTell me, do you have any other symptoms? 🤗",
        headache: "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\n✨ Try these gentle remedies:\n• Rest in a quiet, dark room like a cozy cave 🏠\n• Drink water slowly - your brain needs it! 💧\n• Put a soft, cool cloth on your head 🧊\n• Take deep breaths like you're smelling flowers 🌸\n• Gentle head massage from someone you trust 👐\n\n🚨 Get help right away if:\n• Your head hurts very, very badly\n• You can't see well\n• Your neck feels stiff\n• You feel confused\n\nWhat do you think might have caused your headache? 🤔",
        cold: "Achoo! 🤧 You caught a cold! Don't worry, colds are very common and you'll feel better soon! 🌈\n\n✨ Let's fight this cold together:\n• Rest lots - your body is working hard! 😴\n• Drink warm soup (it's like a hug for your throat!) 🍲\n• Honey and warm water can soothe your throat 🍯\n• Breathe steam from a warm shower 🚿\n• Wash your hands often to keep germs away! 🧼\n\n🌟 Fun fact: Your body makes about 2 liters of mucus every day!\n\nYou should feel better in 7-10 days. Tell an adult if you feel much worse! 💪",
        default: "Hello my friend! 😊 I want to help you feel better! Can you tell me more about how you're feeling? 🤗\n\n🌟 To help you better, please tell me:\n• What part of your body doesn't feel good? 👤\n• When did you start feeling this way? ⏰\n• Does anything make it feel better or worse? 🤷‍♀️\n\n💡 Remember: I'm here to help, but always talk to a grown-up you trust about your health! 👨‍⚕️👩‍⚕️\n\nYou're brave for asking about your health! 🦸‍♂️"
      },
      hi: {
        fever: "अरे! 🤒 आपको बुखार है! चिंता मत करो, मैं आपकी मदद करूंगा! बुखार का मतलब है कि आपका शरीर कीटाणुओं से लड़ रहा है - आप अंदर से एक सुपरहीरो की तरह हैं! 🦸‍♀️\n\n✨ आप यह कर सकते हैं:\n• भालू की तरह आराम करें 🐻\n• खूब पानी पिएं 🌱\n• अगर कोई बड़ा कहे तो दवा लें 💊\n• माथे पर ठंडा कपड़ा रखें ❄️\n\n🚨 किसी बड़े से डॉक्टर को बुलवाएं अगर:\n• बुखार बहुत तेज़ है\n• सांस लेने में तकलीफ हो\n• 3 दिन से ज्यादा बीमार महसूस करें\n\nबताइए, क्या कोई और लक्षण है? 🤗",
        headache: "अरे! 😔 आपके सिर में दर्द है! आइए मिलकर इसे ठीक करते हैं! 🌟\n\n✨ ये कोशिश करें:\n• शांत, अंधेरे कमरे में आराम करें 🏠\n• धीरे-धीरे पानी पिएं 💧\n• सिर पर नरम, ठंडा कपड़ा रखें 🧊\n• फूलों की तरह सांस लें 🌸\n\n🚨 तुरंत मदद लें अगर:\n• सिर में बहुत तेज़ दर्द हो\n• देखने में परेशानी हो\n• गर्दन अकड़ जाए\n\nक्या लगता है सिरदर्द का कारण क्या हो सकता है? 🤔",
        cold: "हैं-ची! 🤧 आपको सर्दी-जुकाम हुआ है! चिंता न करें, यह आम बात है और जल्दी ठीक हो जाएगा! 🌈\n\n✨ आइए मिलकर इससे लड़ते हैं:\n• खूब आराम करें 😴\n• गर्म सूप पिएं 🍲\n• शहद और गर्म पानी से गले को आराम दें 🍯\n• गर्म पानी की भाप लें 🚿\n\nआप 7-10 दिन में बेहतर महसूस करेंगे। अगर ज्यादा बीमार लगें तो किसी बड़े को बताएं! 💪",
        default: "नमस्ते मेरे दोस्त! 😊 मैं आपको बेहतर महसूस कराने में मदद करना चाहता हूं! आप कैसा महसूस कर रहे हैं? 🤗\n\n🌟 बेहतर मदद के लिए बताएं:\n• शरीर का कौन सा हिस्सा ठीक नहीं लग रहा?\n• यह कब से महसूस हो रहा है?\n\nआप बहुत बहादुर हैं! 🦸‍♂️"
      },
      te: {
        fever: "అయ్యో! 🤒 మీకు జ్వరం వచ్చిందా! చింత చేయకండి, నేను మీకు సహాయం చేస్తాను! 🦸‍♀️\n\n✨ మీరు ఇవి చేయవచ్చు:\n• ఎలుగుబంటిలా విశ్రమించండి 🐻\n• చాలా నీళ్లు తాగండి 🌱\n• పెద్దలు చెప్పితే మందు తీసుకోండి 💊\n\nమరేమైనా లక్షణాలు ఉన్నాయా? 🤗",
        headache: "అయ్యో! 😔 తల నొప్పిగా ఉందా! కలిసి దాన్ని బాగు చేద్దాం! 🌟\n\n✨ ఇవి ప్రయత్నించండి:\n• నిశ్శబ్ద, చీకటి గదిలో విశ్రమించండి 🏠\n• మెల్లగా నీళ్లు తాగండి 💧\n\nతలనొప్పికి కారణం ఏమిటని అనుకుంటున్నారు? 🤔",
        cold: "హాచూ! 🤧 మీకు జలుబు వచ్చిందా! చింత చేయకండి, త్వరగా బాగుపడతారు! 🌈\n\n✨ కలిసి దీనితో పోరాడుదాం:\n• చాలా విశ్రమించండి 😴\n• వేడి సూప్ తాగండి 🍲\n\n7-10 రోజుల్లో బాగుపడతారు! 💪",
        default: "హలో నా స్నేహితుడా! 😊 మీకు మంచిగా అనిపించేలా సహాయం చేయాలనుకుంటున్నాను! 🤗\n\n🌟 మీరు ఎలా అనిపిస్తున్నారో చెప్పండి:\n• శరీరంలో ఏ భాగం బాగోలేదు?\n• ఎప్పటి నుండి అనిపిస్తోంది?\n\nమీరు చాలా ధైర్యవంతులు! 🦸‍♂️"
      },
      ta: {
        fever: "அய்யோ! 🤒 உங்களுக்கு காய்ச்சல் வந்துள்ளது! கவலைப்படாதீர்கள், நான் உங்களுக்கு உதவுகிறேன்! 🦸‍♀️\n\n✨ நீங்கள் இதைச் செய்யலாம்:\n• கரடியைப் போல ஓய்வு எடுங்கள் 🐻\n• நிறைய தண்ணீர் குடியுங்கள் 🌱\n\nவேறு ஏதேனும் அறிகுறிகள் இருக்கின்றனவா? 🤗",
        headache: "அய்யோ! 😔 தலைவலி இருக்கிறதா! சேர்ந்து அதை சரிசெய்வோம்! 🌟\n\n✨ இவற்றை முயற்சிக்கவும்:\n• அமைதியான, இருண்ட அறையில் ஓய்வு எடுங்கள் 🏠\n• மெதுவாக தண்ணீர் குடியுங்கள் 💧\n\nதலைவலிக்கு என்ன காரணம் என்று நினைக்கிறீர்கள்? 🤔",
        cold: "ஹாச்சூ! 🤧 உங்களுக்கு சளி பிடித்துள்ளது! கவலைப்படாதீர்கள், விரைவில் குணமாகிவிடும்! 🌈\n\n✨ இதை எதிர்த்துப் போராடுவோம்:\n• நிறைய ஓய்வு எடுங்கள் 😴\n• சூடான சூப் குடியுங்கள் 🍲\n\n7-10 நாட்களில் நன்றாக உணருவீர்கள்! 💪",
        default: "வணக்கம் என் நண்பரே! 😊 உங்களுக்கு நல்லது போல் உணர உதவ விரும்புகிறேன்! 🤗\n\n🌟 சிறந்த உதவிக்காக சொல்லுங்கள்:\n• உடலின் எந்தப் பகுதி சரியில்லை?\n• எப்போதிலிருந்து இப்படி உணர்கிறீர்கள்?\n\nநீங்கள் மிகவும் தைரியமானவர்! 🦸‍♂️"
      },
      bn: {
        fever: "হায়! 🤒 আপনার জ্বর হয়েছে! চিন্তা করবেন না, আমি আপনাকে সাহায্য করব! 🦸‍♀️\n\n✨ আপনি এগুলো করতে পারেন:\n• ভালুকের মতো বিশ্রাম নিন 🐻\n• প্রচুর পানি পান করুন 🌱\n\nআর কোনো লক্ষণ আছে কি? 🤗",
        headache: "আহ! 😔 মাথাব্যথা হচ্ছে! একসাথে এটা ঠিক করি! 🌟\n\n✨ এগুলো চেষ্টা করুন:\n• শান্ত, অন্ধকার ঘরে বিশ্রাম নিন 🏠\n• ধীরে ধীরে পানি পান করুন 💧\n\nমাথাব্যথার কারণ কী মনে হয়? 🤔",
        cold: "হাঁচি! 🤧 আপনার সর্দি হয়েছে! চিন্তা করবেন না, শীঘ্রই ভালো হয়ে যাবে! 🌈\n\n✨ একসাথে এর বিরুদ্ধে লড়াই করি:\n• প্রচুর বিশ্রাম নিন 😴\n• গরম স্যুপ পান করুন 🍲\n\n৭-১০ দিনে ভালো লাগবে! 💪",
        default: "হ্যালো আমার বন্ধু! 😊 আপনাকে ভালো বোধ করাতে সাহায্য করতে চাই! 🤗\n\n🌟 ভালো সাহায্যের জন্য বলুন:\n• শরীরের কোন অংশ ভালো লাগছে না?\n• কবে থেকে এমন লাগছে?\n\nআপনি খুব সাহসী! 🦸‍♂️"
      },
      es: {
        fever: "¡Oh no! 🤒 ¡Tienes fiebre! ¡No te preocupes, estoy aquí para ayudarte! 🦸‍♀️\n\n✨ Puedes hacer esto:\n• Descansa como un oso 🐻\n• Bebe mucha agua 🌱\n\n¿Tienes otros síntomas? 🤗",
        headache: "¡Ay! 😔 ¡Te duele la cabeza! ¡Vamos a curarte juntos! 🌟\n\n✨ Prueba esto:\n• Descansa en una habitación tranquila y oscura 🏠\n• Bebe agua lentamente 💧\n\n¿Qué crees que causó tu dolor de cabeza? 🤔",
        cold: "¡Achís! 🤧 ¡Tienes un resfriado! ¡No te preocupes, te sentirás mejor pronto! 🌈\n\n✨ Luchemos contra esto juntos:\n• Descansa mucho 😴\n• Toma sopa caliente 🍲\n\n¡Te sentirás mejor en 7-10 días! 💪",
        default: "¡Hola mi amigo! 😊 ¡Quiero ayudarte a sentirte mejor! 🤗\n\n🌟 Para ayudarte mejor, dime:\n• ¿Qué parte de tu cuerpo no se siente bien?\n• ¿Cuándo empezaste a sentirte así?\n\n¡Eres muy valiente! 🦸‍♂️"
      },
      fr: {
        fever: "Oh là là! 🤒 Tu as de la fièvre! Ne t'inquiète pas, je suis là pour t'aider! 🦸‍♀️\n\n✨ Tu peux faire ceci:\n• Repose-toi comme un ours 🐻\n• Bois beaucoup d'eau 🌱\n\nAs-tu d'autres symptômes? 🤗",
        headache: "Aïe! 😔 Tu as mal à la tête! Guérissons-la ensemble! 🌟\n\n✨ Essaie ceci:\n• Repose-toi dans une chambre calme et sombre 🏠\n• Bois de l'eau lentement 💧\n\nQu'est-ce qui a causé ton mal de tête? 🤔",
        cold: "Atchoum! 🤧 Tu as un rhume! Ne t'inquiète pas, tu iras mieux bientôt! 🌈\n\n✨ Combattons cela ensemble:\n• Repose-toi beaucoup 😴\n• Bois de la soupe chaude 🍲\n\nTu iras mieux dans 7-10 jours! 💪",
        default: "Bonjour mon ami! 😊 Je veux t'aider à te sentir mieux! 🤗\n\n🌟 Pour mieux t'aider, dis-moi:\n• Quelle partie de ton corps ne va pas bien?\n• Quand as-tu commencé à te sentir ainsi?\n\nTu es très courageux! 🦸‍♂️"
      }
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('बुखार') || lowerMessage.includes('జ్వరం') || lowerMessage.includes('காய்ச்சல்') || lowerMessage.includes('জ্বর') || lowerMessage.includes('fiebre') || lowerMessage.includes('fièvre')) {
      return languageResponses.fever;
    } else if (lowerMessage.includes('headache') || lowerMessage.includes('सिरदर्द') || lowerMessage.includes('తలనొప్పి') || lowerMessage.includes('தலைவலி') || lowerMessage.includes('মাথাব্যথা') || lowerMessage.includes('dolor de cabeza') || lowerMessage.includes('mal de tête')) {
      return languageResponses.headache;
    } else if (lowerMessage.includes('cold') || lowerMessage.includes('सर्दी') || lowerMessage.includes('జలుబు') || lowerMessage.includes('சளி') || lowerMessage.includes('সর্দি') || lowerMessage.includes('resfriado') || lowerMessage.includes('rhume')) {
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
