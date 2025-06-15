
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Heart, Stethoscope, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getAiResponse } from '@/lib/ai';
import { useTranslation } from 'react-i18next';

interface VoiceAssistantProps {
  onBack: () => void;
}

const VoiceAssistant = ({ onBack }: VoiceAssistantProps) => {
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
  const { t, i18n } = useTranslation();

  const languageToVoiceLang = (lang: string) => {
      const mapping: { [key: string]: string } = {
          'en': 'en-US', 'hi': 'hi-IN', 'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN',
      };
      return mapping[lang] || lang;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onstart = () => { setIsListening(true); };
        recognitionRef.current.onresult = (event) => {
          const transcriptResult = event.results[0][0].transcript;
          setTranscript(transcriptResult);
          handleVoiceInput(transcriptResult);
        };
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast({ title: "Voice Error", description: "Sorry, I couldn't hear you clearly.", variant: "destructive" });
        };
        recognitionRef.current.onend = () => { setIsListening(false); };
      }
    }

    return () => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceInput = async (transcript: string) => {
    try {
      const responseText = await getAiResponse(transcript, i18n.language);
      setResponse(responseText);
      if (isVoiceEnabled) speakResponse(responseText);
    } catch (error) {
      const errorResponse = "I'm sorry, I'm having trouble right now.";
      setResponse(errorResponse);
      if (isVoiceEnabled) speakResponse(errorResponse);
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceLang = languageToVoiceLang(i18n.language);
    utterance.lang = voiceLang;

    const voices = synthRef.current.getVoices();
    const selectedVoice = voices.find(voice => voice.lang.startsWith(voiceLang.split('-')[0]));
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    } else {
        console.warn(`No voice found for language: ${voiceLang}. Using default.`);
    }
    
    utterance.volume = volume;
    utterance.rate = speechRate;
    utterance.pitch = 1.2;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); currentUtteranceRef.current = null; };
    utterance.onerror = () => { setIsSpeaking(false); currentUtteranceRef.current = null; };
    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({ title: "Voice Not Supported", description: "Voice recognition isn't available in your browser.", variant: "destructive" });
      return;
    }
    recognitionRef.current.lang = languageToVoiceLang(i18n.language);
    try {
      recognitionRef.current.start();
      toast({ title: "Listening! 👂", description: "Speak now! I'm here to listen." });
    } catch (error) {
      toast({ title: "Error", description: "Couldn't start listening. Please try again.", variant: "destructive" });
    }
  };

  const stopListening = () => { if (recognitionRef.current && isListening) recognitionRef.current.stop(); };
  const stopSpeaking = () => { if (synthRef.current && isSpeaking) { synthRef.current.cancel(); setIsSpeaking(false); } };
  const toggleVoice = () => { setIsVoiceEnabled(!isVoiceEnabled); if (!isVoiceEnabled) stopSpeaking(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 animate-fade-in">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <ArrowLeft className="h-4 w-4" /> {t('backToHome')}
          </Button>
        </div>
        <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-bold">💡 Health Tip</span>
          </div>
          <p className="text-sm">Drink plenty of water throughout the day to keep your body healthy and hydrated! 💧</p>
        </div>
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Stethoscope className="h-6 w-6 animate-pulse" />
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
              {t('voiceAssistant')} - {t('appName')}
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Button onClick={isListening ? stopListening : startListening} disabled={isSpeaking}
                  className={`w-32 h-32 rounded-full text-white font-bold text-lg shadow-2xl transition-all duration-300 ${isListening ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' : 'bg-gradient-to-r from-green-500 to-blue-500 hover:scale-110'}`}>
                  {isListening ? <><MicOff className="h-12 w-12 mb-2" />Stop</> : <><Mic className="h-12 w-12 mb-2" />Talk to Me</>}
                </Button>
                {isListening && <div className="absolute -inset-4 border-4 border-green-400 rounded-full animate-ping"></div>}
              </div>
              <div className="flex items-center gap-4">
                <Button onClick={toggleVoice} variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform">
                  {isVoiceEnabled ? <><Volume2 className="h-4 w-4" />Voice On</> : <><VolumeX className="h-4 w-4" />Voice Off</>}
                </Button>
                {isSpeaking && <Button onClick={stopSpeaking} variant="outline" className="flex items-center gap-2 hover:scale-105 transition-transform animate-pulse"><Pause className="h-4 w-4" />Stop Speaking</Button>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Speaking Speed: {speechRate}x</label>
                <input type="range" min="0.5" max="2" step="0.1" value={speechRate} onChange={(e) => setSpeechRate(parseFloat(e.target.value))} className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume: {Math.round(volume * 100)}%</label>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
            {transcript && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Mic className="h-4 w-4 text-blue-600" />You said:</h3>
                <p className="text-gray-700 italic">"{transcript}"</p>
              </div>
            )}
            {response && (
              <div className="bg-gradient-to-r from-green-50 to-pink-50 p-4 rounded-lg border-2 border-green-200 animate-fade-in">
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Heart className="h-4 w-4 text-green-600" />ArogyaMitra says:</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{response}</p>
              </div>
            )}
            <div className="flex justify-center gap-4 text-sm">
              {isListening && <div className="flex items-center gap-2 text-green-600 animate-pulse"><div className="w-2 h-2 bg-green-500 rounded-full"></div>Listening...</div>}
              {isSpeaking && <div className="flex items-center gap-2 text-blue-600 animate-pulse"><div className="w-2 h-2 bg-blue-500 rounded-full"></div>Speaking...</div>}
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-semibold mb-2 text-center">How to Use</h3>
              <ul className="space-y-1 text-sm">
                <li>• Click the microphone button to start talking</li>
                <li>• Describe your symptoms or ask health questions</li>
                <li>• I'll provide helpful advice and suggestions</li>
                <li>• Always consult a doctor for serious concerns</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
