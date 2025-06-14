
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Globe, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  language: string;
}

const VoiceAssistant = ({ onBack }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en-US', name: 'English (US)', voice: 'en-US' },
    { code: 'hi-IN', name: 'हिंदी (Hindi)', voice: 'hi-IN' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', voice: 'te-IN' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', voice: 'ta-IN' },
    { code: 'bn-IN', name: 'বাংলা (Bengali)', voice: 'bn-IN' },
    { code: 'es-ES', name: 'Español (Spanish)', voice: 'es-ES' },
    { code: 'fr-FR', name: 'Français (French)', voice: 'fr-FR' }
  ];

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Speech recognition started');
      };
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleUserSpeech(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try again.",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      toast({
        title: "Speech Not Supported",
        description: "Your browser doesn't support speech recognition. Please use text input instead.",
        variant: "destructive"
      });
    }

    // Welcome message
    const welcomeMessage = getWelcomeMessage(selectedLanguage);
    setMessages([{
      id: '1',
      text: welcomeMessage,
      sender: 'assistant',
      timestamp: new Date(),
      language: selectedLanguage
    }]);
    
    // Speak welcome message
    if (speechSynthesis) {
      speakText(welcomeMessage, selectedLanguage);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [selectedLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getWelcomeMessage = (language: string): string => {
    const welcomeMessages = {
      'en-US': "Hello! I'm ArogyaMitra's voice assistant. I can help you with health questions in multiple languages. You can speak to me or ask me anything about your health concerns.",
      'hi-IN': "नमस्ते! मैं आरोग्यमित्र का आवाज़ सहायक हूँ। मैं आपको कई भाषाओं में स्वास्थ्य प्रश्नों में मदद कर सकता हूँ। आप मुझसे बात कर सकते हैं या अपनी स्वास्थ्य चिंताओं के बारे में कुछ भी पूछ सकते हैं।",
      'te-IN': "నమస్కారం! నేను ఆరోగ్యమిత్ర వాయిస్ అసిస్టెంట్. నేను మీకు అనేక భాషలలో ఆరోగ్య ప్రశ్నలతో సహాయం చేయగలను. మీరు నాతో మాట్లాడవచ్చు లేదా మీ ఆరోగ్య ఆందోళనల గురించి ఏదైనా అడగవచ్చు.",
      'ta-IN': "வணக்கம்! நான் ஆரோக்யமித்ராவின் குரல் உதவியாளர். நான் உங்களுக்கு பல மொழிகளில் சுகாதார கேள்விகளில் உதவ முடியும். நீங்கள் என்னுடன் பேசலாம் அல்லது உங்கள் சுகாதார கவலைகள் பற்றி எதையும் கேட்கலாம்.",
      'bn-IN': "নমস্কার! আমি আরোগ্যমিত্রার ভয়েস অ্যাসিস্ট্যান্ট। আমি আপনাকে একাধিক ভাষায় স্বাস্থ্য প্রশ্নে সাহায্য করতে পারি। আপনি আমার সাথে কথা বলতে পারেন বা আপনার স্বাস্থ্য উদ্বেগ সম্পর্কে কিছু জিজ্ঞাসা করতে পারেন।",
      'es-ES': "¡Hola! Soy el asistente de voz de ArogyaMitra. Puedo ayudarte con preguntas de salud en múltiples idiomas. Puedes hablar conmigo o preguntarme cualquier cosa sobre tus preocupaciones de salud.",
      'fr-FR': "Bonjour! Je suis l'assistant vocal d'ArogyaMitra. Je peux vous aider avec des questions de santé dans plusieurs langues. Vous pouvez me parler ou me poser des questions sur vos préoccupations de santé."
    };
    
    return welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages['en-US'];
  };

  const speakText = (text: string, language: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleUserSpeech = (transcript: string) => {
    if (!transcript.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    setTimeout(() => {
      const response = generateHealthResponse(transcript, selectedLanguage);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date(),
        language: selectedLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(response, selectedLanguage);
    }, 1000);
  };

  const generateHealthResponse = (userInput: string, language: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    const responses = {
      'en-US': {
        fever: "I understand you have a fever. This could indicate your body is fighting an infection. Please rest, stay hydrated, and monitor your temperature. If it persists above 102°F for more than 3 days, consult a doctor immediately.",
        headache: "For headaches, try resting in a quiet, dark room. Stay hydrated and consider applying a cold compress. If headaches are severe or frequent, please see a healthcare professional.",
        cough: "For cough, try warm liquids like tea with honey. If it's persistent, produces blood, or comes with fever, please consult a doctor.",
        default: "I'm here to help with your health concerns. Please describe your symptoms in detail so I can provide better guidance. For serious symptoms, always consult a healthcare professional."
      },
      'hi-IN': {
        fever: "मैं समझता हूँ कि आपको बुखार है। यह दर्शाता है कि आपका शरीर संक्रमण से लड़ रहा है। कृपया आराम करें, पानी पीते रहें और तापमान देखते रहें। यदि यह 102°F से ऊपर 3 दिन से अधिक रहे तो तुरंत डॉक्टर से मिलें।",
        headache: "सिरदर्द के लिए शांत, अंधेरे कमरे में आराम करें। पानी पीते रहें और ठंडी पट्टी लगाएं। यदि सिरदर्द गंभीर या बार-बार हो तो डॉक्टर से मिलें।",
        default: "मैं आपकी स्वास्थ्य समस्याओं में मदद के लिए यहाँ हूँ। कृपया अपने लक्षणों का विस्तार से वर्णन करें ताकि मैं बेहतर मार्गदर्शन दे सकूं।"
      },
      'te-IN': {
        fever: "మీకు జ్వరం వచ్చిందని నేను అర్థం చేసుకున్నాను. ఇది మీ శరీరం ఇన్ఫెక్షన్‌తో పోరాడుతున్నదని సూచిస్తుంది. దయచేసి విశ్రాంతి తీసుకోండి, నీరు తాగుతూ ఉండండి మరియు ఉష్ణోగ్రతను పర్యవేక్షించండి।",
        default: "మీ ఆరోగ్య సమస్యలతో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను. దయచేసి మీ లక్షణాలను వివరంగా వివరించండి."
      }
    };

    const languageResponses = responses[language as keyof typeof responses] || responses['en-US'];
    
    if (lowerInput.includes('fever') || lowerInput.includes('बुखार') || lowerInput.includes('జ్వరం')) {
      return languageResponses.fever || languageResponses.default;
    } else if (lowerInput.includes('headache') || lowerInput.includes('सिरदर्द') || lowerInput.includes('తలనొప్పి')) {
      return languageResponses.headache || languageResponses.default;
    } else if (lowerInput.includes('cough') || lowerInput.includes('खांसी') || lowerInput.includes('దగ్గు')) {
      return languageResponses.cough || languageResponses.default;
    }
    
    return languageResponses.default;
  };

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
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
            <Globe className="h-5 w-5 text-green-600" />
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

        {/* Voice Assistant Interface */}
        <Card className="mb-6">
          <CardHeader className="bg-green-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-6 w-6" />
              Voice Assistant - ArogyaMitra
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {!isSupported ? (
              <div className="text-center py-8">
                <MicOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Voice Not Supported
                </h3>
                <p className="text-gray-600">
                  Your browser doesn't support speech recognition. Please use the text chatbot instead.
                </p>
              </div>
            ) : (
              <div className="text-center">
                {/* Voice Controls */}
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-20 h-20 rounded-full ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    disabled={isSpeaking}
                  >
                    {isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  <Button
                    onClick={toggleSpeaking}
                    variant="outline"
                    className="w-20 h-20 rounded-full"
                    disabled={!isSpeaking}
                  >
                    {isSpeaking ? (
                      <VolumeX className="h-8 w-8" />
                    ) : (
                      <Volume2 className="h-8 w-8" />
                    )}
                  </Button>
                </div>

                {/* Status */}
                <div className="mb-4">
                  {isListening && (
                    <div className="text-green-600 font-medium">
                      🎤 Listening... {transcript && `"${transcript}"`}
                    </div>
                  )}
                  {isSpeaking && (
                    <div className="text-blue-600 font-medium">
                      🔊 Speaking...
                    </div>
                  )}
                  {!isListening && !isSpeaking && (
                    <div className="text-gray-600">
                      Click the microphone to start speaking
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation History */}
        <Card className="h-[400px] flex flex-col">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Conversation History
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.sender === 'user' ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
