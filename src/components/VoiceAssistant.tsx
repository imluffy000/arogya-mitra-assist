import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Heart, Stethoscope, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  onBack: () => void;
}

const VoiceAssistant = ({ onBack }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [volume, setVolume] = useState(1);
  const [speechRate, setSpeechRate] = useState(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languages = [
    { code: 'en', name: 'English', voice: 'en-US' },
    { code: 'hi', name: 'हिंदी (Hindi)', voice: 'hi-IN' },
    { code: 'te', name: 'తెలుగు (Telugu)', voice: 'te-IN' },
    { code: 'ta', name: 'தமிழ் (Tamil)', voice: 'ta-IN' },
    { code: 'bn', name: 'বাংলা (Bengali)', voice: 'bn-IN' },
    { code: 'es', name: 'Español (Spanish)', voice: 'es-ES' },
    { code: 'fr', name: 'Français (French)', voice: 'fr-FR' }
  ];

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

  const handleVoiceInput = (transcript: string) => {
    const response = getMedicalResponse(transcript, selectedLanguage);
    setResponse(response);
    if (isVoiceEnabled) {
      speakResponse(response);
    }
  };

  const getMedicalResponse = (userInput: string, language: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Enhanced responses for children and elderly
    const responses = {
      en: {
        fever: "Oh my! 🤒 You have a fever! Let me help you feel better! Your body is like a brave soldier fighting germs! 🦸‍♀️\n\nHere's what heroes do:\n• Rest like a sleeping superhero 😴\n• Drink water like it's your super power! 💧\n• Take medicine only when grown-ups say it's okay 💊\n• Put a cool cloth on your forehead ❄️\n\nYou're so brave! Tell a grown-up if you feel worse, okay? 🤗",
        headache: "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\nTry these magical remedies:\n• Rest in a quiet, cozy place 🏠\n• Drink water slowly - your brain loves water! 🧠💧\n• Breathe deeply like you're smelling beautiful flowers 🌸\n• Ask someone to gently massage your temples 👐\n\nRemember, you're stronger than any headache! 💪",
        cough: "Cough, cough! 😷 Don't worry, coughing is your body's way of cleaning itself! 🌪️\n\nLet's help your throat feel better:\n• Drink warm honey water (nature's candy!) 🍯\n• Breathe steam from a warm shower 🚿\n• Rest your voice like it's sleeping 😴\n• Gargle with warm salt water if you're old enough 🧂\n\nYou'll feel better soon, I promise! 🌈",
        default: "Hello there, brave friend! 😊 I'm here to help you feel better! 🤗\n\nTo give you the best help, can you tell me:\n• What part of your body doesn't feel good? 🤷‍♀️\n• When did you start feeling this way? ⏰\n• What makes it feel better or worse? 🤔\n\nRemember, you're very brave for asking about your health! Always tell a grown-up you trust how you feel! 👨‍⚕️👩‍⚕️"
      },
      hi: {
        fever: "अरे वाह! 🤒 आपको बुखार है! मैं आपको बेहतर महसूस कराने में मदद करूंगा! आपका शरीर एक बहादुर योद्धा की तरह कीटाणुओं से लड़ रहा है! 🦸‍♀️\n\nवीर योद्धा यह करते हैं:\n• सुपरहीरो की तरह सोकर आराम करें 😴\n• पानी को अपनी शक्ति समझकर पिएं! 💧\n• बड़े लोग कहें तो ही दवा लें 💊\n\nआप बहुत बहादुर हैं! अगर तबीयत और खराब लगे तो किसी बड़े को बताना, ठीक है? 🤗",
        headache: "अरे! 😔 सिर में दर्द हो रहा है! चलिए मिलकर इसे ठीक करते हैं! 🌟\n\nये जादुई उपाय करें:\n• शांत जगह आराम करें 🏠\n• धीरे-धीरे पानी पिएं 💧\n• फूलों की तरह सांस लें 🌸\n\nयाद रखें, आप किसी भी सिरदर्द से ज्यादा मजबूत हैं! 💪",
        cough: "खांसी आ रही है! 😷 चिंता न करें, खांसी आपके शरीर के साफ होने का तरीका है! 🌪️\n\nगले को बेहतर बनाने के लिए:\n• गर्म शहद का पानी पिएं 🍯\n• गर्म पानी की भाप लें 🚿\n• आवाज़ को आराम दें 😴\n\nजल्दी ठीक हो जाएंगे! 🌈",
        default: "नमस्ते बहादुर दोस्त! 😊 मैं आपको बेहतर महसूस कराने के लिए यहाँ हूँ! 🤗\n\nबेहतर मदद के लिए बताइए:\n• शरीर का कौन सा हिस्सा ठीक नहीं लग रहा? 🤷‍♀️\n• यह कब से हो रहा है? ⏰\n\nआप अपने स्वास्थ्य के बारे में पूछने के लिए बहुत बहादुर हैं! 👨‍⚕️👩‍⚕️"
      },
      te: {
        fever: "అయ్యో! 🤒 మీకు జ్వరం వచ్చిందా! నేను మీకు మంచిగా అనిపించేలా చేస్తాను! 🦸‍♀️",
        headache: "అయ్యో! 😔 తల నొప్పిగా ఉందా! కలిసి దాన్ని బాగు చేద్దాం! 🌟",
        cough: "దగ్ గుమ్! 😷 చింత చేయకండి, దగ్గు మీ శరీరం శుభ్రం చేసుకోవడానికి! 🌪️",
        default: "నమస్కారం ధైర్యవంతుడా! 😊 మీకు మంచిగా అనిపించేలా సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను! 🤗"
      },
      ta: {
        fever: "அய்யோ! 🤒 உங்களுக்கு காய்ச்சல் வந்துள்ளது! நான் உங்களுக்கு நல்லது போல் உணர வைப்பேன்! 🦸‍♀️",
        headache: "அய்யோ! 😔 தலைவலி இருக்கிறதா! சேர்ந்து அதை சரி செய்வோம்! 🌟",
        cough: "இருமல்! 😷 கவலைப்படாதீர்கள், இருமல் உங்கள் உடலை சுத்தப்படுத்தும் வழி! 🌪️",
        default: "வணக்கம் தைரியமான நண்பரே! 😊 உங்களுக்கு நல்லது போல் உணர உதவ நான் இங்கே இருக்கிறேன்! 🤗"
      },
      bn: {
        fever: "হায়! 🤒 আপনার জ্বর হয়েছে! আমি আপনাকে ভালো বোধ করাব! 🦸‍♀️",
        headache: "আহ! 😔 মাথাব্যথা হচ্ছে! একসাথে এটা ঠিক করি! 🌟",
        cough: "কাশি! 😷 চিন্তা করবেন না, কাশি আপনার শরীর পরিষ্কার করার উপায়! 🌪️",
        default: "নমস্কার সাহসী বন্ধু! 😊 আপনাকে ভালো বোধ করাতে আমি এখানে আছি! 🤗"
      },
      es: {
        fever: "¡Ay, no! 🤒 ¡Tienes fiebre! ¡Te ayudaré a sentirte mejor! 🦸‍♀️",
        headache: "¡Ay! 😔 ¡Te duele la cabeza! ¡Vamos a curarte juntos! 🌟",
        cough: "¡Tos! 😷 ¡No te preocupes, toser es la forma de tu cuerpo de limpiarse! 🌪️",
        default: "¡Hola amigo valiente! 😊 ¡Estoy aquí para ayudarte a sentirte mejor! 🤗"
      },
      fr: {
        fever: "Oh là là! 🤒 Tu as de la fièvre! Je vais t'aider à te sentir mieux! 🦸‍♀️",
        headache: "Aïe! 😔 Tu as mal à la tête! Guérissons-la ensemble! 🌟",
        cough: "Toux! 😷 Ne t'inquiète pas, tousser est la façon de ton corps de se nettoyer! 🌪️",
        default: "Bonjour ami courageux! 😊 Je suis là pour t'aider à te sentir mieux! 🤗"
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
        description: "Speak now! I'm listening to help you! 😊",
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
            Back to Home
          </Button>
          <div className="flex items-center gap-2">
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

        {/* Health Tip Banner */}
        <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-bold">💝 Health Tip for Everyone!</span>
          </div>
          <p className="text-sm">Drinking water is like giving your body a big, refreshing hug! Try to drink 8 glasses a day! 🥤✨</p>
        </div>

        {/* Voice Assistant Interface */}
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Stethoscope className="h-6 w-6 animate-pulse" />
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
              Voice Assistant - ArogyaMitra
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
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-12 w-12 mb-2" />
                      Talk to Me!
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
                      Voice On
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Voice Off
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
                    Stop Speaking
                  </Button>
                )}
              </div>
            </div>

            {/* Speech Rate and Volume Controls */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speaking Speed: {speechRate}x</label>
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
                <label className="text-sm font-medium">Volume: {Math.round(volume * 100)}%</label>
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
                  You said:
                </h3>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-lg border-2 border-green-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  ArogyaMitra says:
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{response}</p>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex justify-center gap-4 text-sm">
              {isListening && (
                <div className="flex items-center gap-2 text-green-600 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Listening...
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Speaking...
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold mb-2 text-center">🌟 How to Use Voice Assistant 🌟</h3>
              <ul className="space-y-1 text-sm">
                <li>• 🎤 Click "Talk to Me!" button to start speaking</li>
                <li>• 🗣️ Tell me about your symptoms or ask health questions</li>
                <li>• 🔊 I'll speak back to you in your chosen language</li>
                <li>• 🎛️ Adjust speed and volume for your comfort</li>
                <li>• 👨‍⚕️ Always consult a real doctor for serious concerns!</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
