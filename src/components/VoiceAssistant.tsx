
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Heart, Stethoscope, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Groq from "groq-sdk";
import { useTranslation } from '@/lib/translations';

// WARNING: Storing API keys directly in the frontend is not secure.
// For a production app, this should be handled via a backend server or secure environment variables.
const groqApiKey = "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";
const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });

interface VoiceAssistantProps {
  onBack: () => void;
  language: string;
}

const languageMap: { [key: string]: string } = {
  'en-IN': 'English',
  'hi-IN': 'Hindi',
  'bn-IN': 'Bengali',
  'te-IN': 'Telugu',
  'mr-IN': 'Marathi',
  'ta-IN': 'Tamil',
  'gu-IN': 'Gujarati',
  'kn-IN': 'Kannada',
  'ml-IN': 'Malayalam',
};

const VoiceAssistant = ({ onBack, language }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [volume, setVolume] = useState(1);
  const [speechRate, setSpeechRate] = useState(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { t } = useTranslation(language as any);

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
  }, [isListening]);

  const callAiDoctor = async (userMessage: string): Promise<string> => {
    try {
      const currentLanguageName = languageMap[language] || 'English';
      const systemPrompt = `You are ArogyaMitra's AI Doctor, a compassionate and knowledgeable medical assistant powered by Llama 3. You provide medical guidance in a friendly, empathetic manner while always emphasizing the importance of consulting licensed healthcare professionals for serious concerns.

Key guidelines:
- Always be empathetic and supportive.
- Provide helpful medical information and general advice.
- Include medicine recommendations when appropriate, but ALWAYS emphasize consulting a doctor first.
- Use friendly language to make conversations comfortable and accessible for all ages (including children and seniors).
- Ask follow-up questions to better understand symptoms.
- Provide emergency guidance when necessary.
- Keep responses concise and clear for voice interaction (under 150 words).
- You MUST respond in ${currentLanguageName}. The user's query is in ${currentLanguageName}. Do not switch to English unless the user does.
- Do NOT use any emojis in your response.
- Always end serious medical advice with "⚠️ Please consult a licensed healthcare professional for proper diagnosis and treatment."`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 300,
      });

      return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error('Groq API error:', error);
      return "I'm having trouble connecting to the AI right now. Please try again in a moment. 😔";
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    try {
      const responseText = await callAiDoctor(transcript);
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

  const speakResponse = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Remove emojis before speaking
    const textWithoutEmojis = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
    
    utterance.lang = language;
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

    recognitionRef.current.lang = language;
    
    try {
      recognitionRef.current.start();
      toast({
        title: "Listening! 👂",
        description: "Speak to the AI Doctor! I'm listening! 🩺",
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
            {t('backToHome')}
          </Button>
        </div>

        {/* Health Tip Banner */}
        <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-bold">{t('healthTip')}</span>
          </div>
          <p className="text-sm">{t('healthTipText')}</p>
        </div>

        {/* Voice Assistant Interface */}
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Stethoscope className="h-6 w-6 animate-pulse" />
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
              {t('aiDoctorVoiceTitle')}
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
                  className={`w-32 h-32 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex flex-col items-center justify-center ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse hover:from-red-600 hover:to-pink-600' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-110'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-12 w-12 mb-2" />
                      {t('stopListening')}
                    </>
                  ) : (
                    <>
                      <Mic className="h-12 w-12 mb-2" />
                      {t('startListening')}
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
                      {t('voiceOn')}
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      {t('voiceOff')}
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
                    {t('stopSpeaking')}
                  </Button>
                )}
              </div>
            </div>

            {/* Speech Rate and Volume Controls */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('speakingSpeed', { speed: speechRate })}</label>
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
                <label className="text-sm font-medium">{t('volume', { volume: Math.round(volume * 100) })}</label>
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
                  {t('youSaid')}
                </h3>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}

            {/* Response Display */}
            {response && (
              <div className="bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-lg border-2 border-green-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  {t('aiDoctorSays')}
                </h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{response}</p>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex justify-center gap-4 text-sm">
              {isListening && (
                <div className="flex items-center gap-2 text-green-600 animate-pulse">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {t('listeningStatus')}
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {t('speakingStatus')}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold mb-2 text-center">{t('howToUse')}</h3>
              <ul className="space-y-1 text-sm">
                <li>{t('howToUse1')}</li>
                <li>{t('howToUse2')}</li>
                <li>{t('howToUse3')}</li>
                <li>{t('howToUse4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
