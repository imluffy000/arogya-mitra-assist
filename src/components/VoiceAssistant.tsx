import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Heart, Stethoscope, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/utils/translations";
import LanguageSelector from "@/components/LanguageSelector";

interface VoiceAssistantProps {
  onBack: () => void;
}

const VoiceAssistant = ({ onBack }: VoiceAssistantProps) => {
  const { selectedLanguage, languages } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [volume, setVolume] = useState(1);
  const [speechRate, setSpeechRate] = useState(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [useAiDoctor, setUseAiDoctor] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log('Speech recognition result:', transcript);
          setTranscript(transcript);
          handleVoiceInput(transcript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({
            title: "Voice Error",
            description: "Sorry, I couldn't hear you clearly. Please try again! 😊",
            variant: "destructive",
          });
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
      }
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [selectedLanguage, isListening]);

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
- Always end serious medical advice with "⚠️ Please consult a licensed healthcare professional for proper diagnosis and treatment."
- Keep responses concise for voice interaction (under 150 words)
- Respond in ${selectedLanguage === 'en' ? 'English' : selectedLanguage === 'hi' ? 'Hindi' : selectedLanguage === 'te' ? 'Telugu' : selectedLanguage === 'ta' ? 'Tamil' : selectedLanguage === 'bn' ? 'Bengali' : selectedLanguage === 'es' ? 'Spanish' : 'French'}`;

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
          max_tokens: 300,
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

  const handleVoiceInput = async (transcript: string) => {
    let responseText: string;
    
    try {
      if (useAiDoctor && apiKey) {
        responseText = await callAiDoctor(transcript);
      } else {
        responseText = getMedicalResponse(transcript, selectedLanguage);
      }
      
      setResponse(responseText);
      if (isVoiceEnabled) {
        speakResponse(responseText);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorResponse = "I'm sorry, I'm having trouble right now. Please try again! 😔";
      setResponse(errorResponse);
      if (isVoiceEnabled) {
        speakResponse(errorResponse);
      }
    }
  };

  const getMedicalResponse = (userInput: string, language: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Enhanced responses for children and elderly with medicine recommendations
    const responses = {
      en: {
        fever: "Oh my! 🤒 You have a fever! Let me help you feel better! Your body is like a brave soldier fighting germs! 🦸‍♀️\n\nHere's what heroes do:\n• Rest like a sleeping superhero 😴\n• Drink water like it's your super power! 💧\n• Put a cool cloth on your forehead ❄️\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for adults\n• Children's Tylenol for kids (ask parents first!)\n• Ibuprofen for adults only\n\n⚠️ SUPER IMPORTANT: You're so brave! But always tell a grown-up and ask a doctor before taking ANY medicine! Call doctor if fever is over 102°F! 🤗",
        headache: "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\nTry these magical remedies:\n• Rest in a quiet, cozy place 🏠\n• Drink water slowly - your brain loves water! 🧠💧\n• Breathe deeply like you're smelling beautiful flowers 🌸\n• Ask someone to gently massage your temples 👐\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for mild headaches\n• Ibuprofen for adults (not for children under 12)\n• NEVER give aspirin to children!\n\n⚠️ SUPER IMPORTANT: Ask a grown-up and doctor before taking ANY medicine! Get help if headache is very bad! Remember, you're stronger than any headache! 💪",
        cough: "Cough, cough! 😷 Don't worry, coughing is your body's way of cleaning itself! 🌪️\n\nLet's help your throat feel better:\n• Drink warm honey water (nature's candy!) 🍯\n• Breathe steam from a warm shower 🚿\n• Rest your voice like it's sleeping 😴\n• Gargle with warm salt water if you're old enough 🧂\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Cough syrup for persistent cough\n• Throat lozenges for older kids/adults\n• Honey-based remedies (for kids over 1 year)\n\n⚠️ SUPER IMPORTANT: Always ask a grown-up and doctor before taking ANY medicine! Most coughs get better on their own. You'll feel better soon, I promise! 🌈",
        default: "Hello there, brave friend! 😊 I'm here to help you feel better! 🤗\n\nTo give you the best help, can you tell me:\n• What part of your body doesn't feel good? 🤷‍♀️\n• When did you start feeling this way? ⏰\n• What makes it feel better or worse? 🤔\n\n💡 Remember: I can suggest medicines, but you must ALWAYS tell a grown-up you trust and ask a doctor before taking ANY medicine! Never take medicine alone! 👨‍⚕️👩‍⚕️\n\nRemember, you're very brave for asking about your health! 🦸‍♂️"
      },
      hi: {
        fever: "अरे वाह! 🤒 आपको बुखार है! मैं आपको बेहतर महसूस कराने में मदद करूंगा! 🦸‍♀️\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• पैरासिटामोल बड़ों के लिए\n• बच्चों के लिए बच्चों वाली दवा\n• इबुप्रोफेन केवल बड़ों के लिए\n\n⚠️ बहुत महत्वपूर्ण: आप बहुत बहादुर हैं! पर कोई भी दवा लेने से पहले हमेशा बड़ों और डॉक्टर से पूछें! 🤗",
        headache: "अरे! 😔 सिर में दर्द हो रहा है! 🌟\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• पैरासिटामोल हल्के सिरदर्द के लिए\n• इबुप्रोफेन केवल बड़ों के लिए\n\n⚠️ बहुत महत्वपूर्ण: दवा लेने से पहले बड़ों और डॉक्टर से पूछें! 💪",
        cough: "खांसी आ रही है! 😷 🌪️\n\n💊 दवाइयाँ जो मदद कर सकती हैं (केवल डॉक्टर की अनुमति से!):\n• खांसी की दवा\n• गले की गोलियाँ बड़े बच्चों/बड़ों के लिए\n• शहद वाली दवा (1 साल से बड़े बच्चों के लिए)\n\n⚠️ बहुत महत्वपूर्ण: कोई भी दवा लेने से पहले बड़ों और डॉक्टर से पूछें! जल्दी ठीक हो जाएंगे! 🌈",
        default: "नमस्ते बहादुर दोस्त! 😊 💡 yaad rakhiye: मैं दवाइयों का सुझाव दे सकता हूँ, लेकिन कोई भी दवा लेने से पहले हमेशा बड़ों और डॉक्टर से पूछें! 👨‍⚕️👩‍⚕️"
      },
      te: {
        fever: "అయ్యో! 🤒 మీకు జ్వరం వచ్చిందా! 🦸‍♀️\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• పెరాసిటమాల్ పెద్దలకు\n• పిల్లలకు పిల్లల మందు\n\n⚠️ చాలా ముఖ్యం: మీరు చాలా ధైర్యవంతులు! కానీ ఏ మందు అయినా తీసుకునే ముందు పెద్దలని మరియు డాక్టర్‌ని అడగండి! 🤗",
        headache: "అయ్యో! 😔 తల నొప్పిగా ఉందా! 🌟\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• పెరాసిటమాల్ తేలికపాటి తలనొప్పికి\n\n⚠️ చాలా ముఖ్యం: మందు తీసుకునే ముందు పెద్దలని మరియు డాక్టర్‌ని అడగండి! 💪",
        cough: "దగ్ గుమ్! 😷 🌪️\n\n💊 సహాయపడే మందులు (వైద్యుని అనుమతితో మాత్రమే!):\n• దగ్గు మందు\n• తொண்டை మாத்திரைకளు పెరியవర్కలు\n\n⚠️ చాలా ముఖ్యం: ఏ మందు అయినా తీసుకునే ముందు పెద్దలని మరియు డాక్టర్‌ని అడగండి! 🌈",
        default: "నమస్కారం ధైర్యవంతుడా! 😊 💡 గుర్తుంచుకోండి: నేను మందులను సూచించగలను, కానీ ఏదైనా మందు తీసుకునే ముందు ఎల్లప్పుడూ పెద్దలని మరియు డాక్టర్‌ని అడగాలి! 👨‍⚕️👩‍⚕️"
      },
      ta: {
        fever: "அய்யோ! 🤒 உங்களுக்கு காய்ச்சல் வந்துள்ளது! 🦸‍♀️\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனুমதியுடன் மட்டுமே!):\n• பாராசிட்டமால் பெரியவர்களுக்கு\n• குழந்தைகளுக்கு குழந்தைகள் மருந்து\n\n⚠️ மிக முக்கியம்: நீங்கள் மிகவும் தைரியமானவர்! ஆனால் எந்த மருந்தும் எடுக்கும் முன் பெரியவர்கள் மற்றும் மருத்துவரிடம் கேளுங்கள்! 🤗",
        headache: "அய்யோ! 😔 தலைவலி இருக்கிறதா! 🌟\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனুমதியுடன் மட்டுமே!):\n• பாராசிட்டமால் லேசான தலைவலிக்கு\n\n⚠️ மிக முக்கியம்: மருந்து எடுக்கும் முன் பெரியவர்கள் மற்றும் மருத்துவரிடம் கேளுங்கள்! 💪",
        cough: "இருமல்! 😷 🌪️\n\n💊 உதவக்கூடிய மருந்துகள் (மருத்துவர் அனুমதியுடன் மட்டுமே!):\n• இருமல் மருந்து\n• தொண்டை மாத்திரைகள் பெரியவர்களுக்கு\n\n⚠️ மிக முக்கியம்: ஏ மருந்தும் எடுக்கும் முன் பெரியவர்கள் மற்றும் மருத்துவரிடம் கேளுங்கள்! 🌈",
        default: "வணக்கம் தைரியமான நண்பரே! 😊 💡 நினைவில் வைக்கவும்: நான் மருந்துகளை பரிந்துரைக்க முடியும், ஆனால் எந்த மருந்தும் எடுக்கும் முன் எப்போதும் பெரியவர்கள் மற்றும் மருத்துவரிடம் கேட்க வேண்டும்! 👨‍⚕️👩‍⚕️"
      },
      bn: {
        fever: "হায়! 🤒 আপনার জ্বর হয়েছে! 🦸‍♀️\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• প্যারাসিটামল বড়দের জন্য\n• শিশুদের জন্য শিশুদের ওষুধ\n\n⚠️ খুবই গুরুত্বপূর্ণ: আপনি খুব সাহসী! কিন্তু কোনো ওষুধ খাওয়ার আগে সবসময় বড়দের এবং ডাক্তারকে জিজ্ঞাসা করুন! 🤗",
        headache: "আহ! 😔 মাথাব্যথা হচ্ছে! 🌟\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• প্যারাসিটামল হালকা মাথাব্যথার জন্য\n\n⚠️ খুবই গুরুত্বপূর্ণ: ওষুধ খাওয়ার আগে বড়দের এবং ডাক্তারকে জিজ্ঞাসা করুন! 💪",
        cough: "কাশি! 😷 🌪️\n\n💊 সাহায্যকারী ওষুধ (শুধুমাত্র ডাক্তারের অনুমতিতে!):\n• কাশির ওষুধ\n• গলার ট্যাবলেট বড়দের জন্য\n\n⚠️ খুবই গুরুত্বপূর্ণ: কোনো ওষুধ খাওয়ার আগে বড়দের এবং ডাক্তারকে জিজ্ঞাসা করুন! 🌈",
        default: "নমস্কার সাহসী বন্ধু! 😊 💡 মনে রাখবেন: আমি ওষুধের পরামর্শ দিতে পারি, তবে কোনো ওষুধ খাওয়ার আগে সবসময় বড়দের এবং ডাক্তারকে জিজ্ঞাসা করতে হবে! 👨‍⚕️👩‍⚕️"
      },
      es: {
        fever: "¡Ay, no! 🤒 ¡Tienes fiebre! 🦸‍♀️\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Paracetamol para adultos\n• Medicina para niños\n\n⚠️ MUY IMPORTANTE: ¡Eres muy valiente! ¡Pero siempre pregunta a un adulto y doctor antes de tomar cualquier medicina! 🤗",
        headache: "¡Ay! 😔 ¡Te duele la cabeza! 🌟\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Paracetamol para dolores leves\n\n⚠️ MUY IMPORTANTE: ¡Pregunta a un adulto y doctor antes de tomar medicina! 💪",
        cough: "¡Tos! 😷 🌪️\n\n💊 Medicinas que pueden ayudar (¡SOLO con permiso del doctor!):\n• Jarabe para la tos\n• Pastillas para la garganta para adultos\n\n⚠️ MUY IMPORTANTE: ¡Pregunta a un adulto y doctor antes de tomar cualquier medicina! 🌈",
        default: "¡Hola amigo valiente! 😊 💡 Recuerda: ¡Puedo sugerir medicinas, pero siempre debes preguntar a un adulto y doctor antes de tomar CUALQUIER medicina! 👨‍⚕️👩‍⚕️"
      },
      fr: {
        fever: "Oh là là! 🤒 Tu as de la fièvre! 🦸‍♀️\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Paracétamol pour les adultes\n• Médicament pour enfants\n\n⚠️ TRÈS IMPORTANT: Tu es très courageux! Mais demande toujours à un adulte et docteur avant de prendre des médicaments! 🤗",
        headache: "Aïe! 😔 Tu as mal à la tête! 🌟\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Paracétamol pour les douleurs légères\n\n⚠️ TRÈS IMPORTANT: Demande à un adulte et docteur avant de prendre des médicaments! 💪",
        cough: "Toux! 😷 🌪️\n\n💊 Médicaments qui peuvent aider (SEULEMENT avec permission du docteur!):\n• Sirop contre la toux\n• Pastilles pour la gorge pour adultes\n\n⚠️ TRÈS IMPORTANT: Demande à un adulte et docteur avant de prendre des médicaments! 🌈",
        default: "Bonjour ami courageux! 😊 💡 Souviens-toi: Je peux suggérer des médicaments, mais tu dois TOUJOURS demander à un adulte et docteur avant de prendre des médicaments! 👨‍⚕️👩‍⚕️"
      }
    };

    const languageResponses = responses[language as keyof typeof responses] || responses.en;
    
    if (lowerInput.includes('fever') || lowerInput.includes('बुखार') || lowerInput.includes('జ్వరం') || lowerInput.includes('காய்ச்சல்') || lowerInput.includes('জ্বর') || lowerInput.includes('fiebre') || lowerInput.includes('fièvre')) {
      return languageResponses.fever;
    } else if (lowerInput.includes('headache') || lowerInput.includes('सिरदर्द') || lowerInput.includes('తలనొప్పి') || lowerInput.includes('தலைவலி') || lowerInput.includes('মাথাব্যথা') || lowerInput.includes('dolor de cabeza') || lowerInput.includes('mal de tête')) {
      return languageResponses.headache;
    } else if (lowerInput.includes('cough') || lowerInput.includes('खांसी') || lowerInput.includes('దగ్గు') || lowerInput.includes('இருமல்') || lowerInput.includes('কাশি') || lowerInput.includes('tos') || lowerInput.includes('toux')) {
      return languageResponses.cough;
    }
    
    return languageResponses.default;
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedLang = languages.find(lang => lang.code === selectedLanguage);
    
    utterance.lang = selectedLang?.voice || 'en-US';
    utterance.volume = volume;
    utterance.rate = speechRate;
    utterance.pitch = 1.2; // Slightly higher pitch for friendliness
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Not Supported",
        description: "Sorry, voice recognition is not supported in your browser! 😅",
        variant: "destructive",
      });
      return;
    }

    const selectedLang = languages.find(lang => lang.code === selectedLanguage);
    recognitionRef.current.lang = selectedLang?.voice || 'en-US';
    
    try {
      recognitionRef.current.start();
      toast({
        title: "Listening! 👂",
        description: useAiDoctor ? "Speak to the AI Doctor! I'm listening! 🩺" : "Speak now! I'm listening to help you! 😊",
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Error",
        description: "Couldn't start listening. Please try again! 😅",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      stopSpeaking();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-4 w-4" />
            {getTranslation(selectedLanguage, 'backToHome')}
          </Button>
          <LanguageSelector />
        </div>

        {/* AI Doctor Toggle */}
        <div className="mb-6 bg-gradient-to-r from-purple-400 to-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <span className="font-bold">{getTranslation(selectedLanguage, 'aiDoctorMode')}</span>
            </div>
            <Button
              onClick={() => setUseAiDoctor(!useAiDoctor)}
              variant={useAiDoctor ? "secondary" : "outline"}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              {useAiDoctor ? getTranslation(selectedLanguage, 'enabled') : getTranslation(selectedLanguage, 'enableAiDoctor')}
            </Button>
          </div>
          {useAiDoctor && (
            <div className="mt-3">
              <Input
                type="password"
                placeholder={getTranslation(selectedLanguage, 'apiKeyPlaceholder')}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white text-gray-800"
              />
              <p className="text-xs mt-1 opacity-80">{getTranslation(selectedLanguage, 'apiKeyNote')}</p>
            </div>
          )}
        </div>

        {/* Health Tip Banner */}
        <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-bold">{getTranslation(selectedLanguage, 'healthTip')}</span>
          </div>
          <p className="text-sm">{getTranslation(selectedLanguage, 'healthTipText')}</p>
        </div>

        {/* Voice Assistant Interface */}
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Stethoscope className="h-6 w-6 animate-pulse" />
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
              {useAiDoctor ? `${getTranslation(selectedLanguage, 'aiDoctorMode').replace('🤖 ', '')} Voice` : getTranslation(selectedLanguage, 'voiceAssistant').replace('🎤 ', '')} - {getTranslation(selectedLanguage, 'appName')}
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* Main Voice Controls */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isSpeaking}
                  className={`w-32 h-32 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse hover:from-red-600 hover:to-pink-600' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-110'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-12 w-12 mb-2" />
                      {getTranslation(selectedLanguage, 'stop')}
                    </>
                  ) : (
                    <>
                      <Mic className="h-12 w-12 mb-2" />
                      {useAiDoctor ? getTranslation(selectedLanguage, 'talkToAiDoctor') : getTranslation(selectedLanguage, 'talkToMe')}
                    </>
                  )}
                </Button>
                
                {/* Listening Animation */}
                {isListening && (
                  <div className="absolute -inset-4 border-4 border-green-400 rounded-full animate-ping"></div>
                )}
              </div>

              {/* Voice Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleVoice}
                  variant="outline"
                  className="flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  {isVoiceEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      {getTranslation(selectedLanguage, 'voiceOn')}
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      {getTranslation(selectedLanguage, 'voiceOff')}
                    </>
                  )}
                </Button>
                
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    variant="outline"
                    className="flex items-center gap-2 hover:scale-105 transition-transform animate-pulse"
                  >
                    <Pause className="h-4 w-4" />
                    {getTranslation(selectedLanguage, 'stopSpeaking')}
                  </Button>
                )}
              </div>
            </div>

            {/* Speech Rate and Volume Controls */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{getTranslation(selectedLanguage, 'speakingSpeed')}: {speechRate}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{getTranslation(selectedLanguage, 'volume')}: {Math.round(volume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-blue-600" />
                  {getTranslation(selectedLanguage, 'youSaid')}
                </h3>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-lg border-2 border-green-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  {useAiDoctor ? getTranslation(selectedLanguage, 'aiDoctorSays') : getTranslation(selectedLanguage, 'arogyaMitraSays')}
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{response}</p>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex justify-center gap-4 text-sm">
              {isListening && (
                <div className="flex items-center gap-2 text-green-600 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {getTranslation(selectedLanguage, 'listening')}
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {getTranslation(selectedLanguage, 'speaking')}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold mb-2 text-center">{getTranslation(selectedLanguage, 'howToUse')}</h3>
              <ul className="space-y-1 text-sm">
                {(getTranslation(selectedLanguage, 'voiceInstructions') as string[]).map((instruction, index) => (
                  <li key={index}>• {instruction}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
