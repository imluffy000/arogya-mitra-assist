
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, MicOff, Volume2, VolumeX, Heart, Stethoscope, Play, Pause } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  }, [isListening]);

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
- Respond in English`;

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
        responseText = getMedicalResponse(transcript);
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

  const getMedicalResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Enhanced responses for children and elderly with medicine recommendations
    if (lowerInput.includes('fever')) {
      return "Oh my! 🤒 You have a fever! Let me help you feel better! Your body is like a brave soldier fighting germs! 🦸‍♀️\n\nHere's what heroes do:\n• Rest like a sleeping superhero 😴\n• Drink water like it's your super power! 💧\n• Put a cool cloth on your forehead ❄️\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for adults\n• Children's Tylenol for kids (ask parents first!)\n• Ibuprofen for adults only\n\n⚠️ SUPER IMPORTANT: You're so brave! But always tell a grown-up and ask a doctor before taking ANY medicine! Call doctor if fever is over 102°F! 🤗";
    } else if (lowerInput.includes('headache')) {
      return "Ouch! 😔 Your head hurts! Let's make it feel better together! 🌟\n\nTry these magical remedies:\n• Rest in a quiet, cozy place 🏠\n• Drink water slowly - your brain loves water! 🧠💧\n• Breathe deeply like you're smelling beautiful flowers 🌸\n• Ask someone to gently massage your temples 👐\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Paracetamol/Acetaminophen for mild headaches\n• Ibuprofen for adults (not for children under 12)\n• NEVER give aspirin to children!\n\n⚠️ SUPER IMPORTANT: Ask a grown-up and doctor before taking ANY medicine! Get help if headache is very bad! Remember, you're stronger than any headache! 💪";
    } else if (lowerInput.includes('cough')) {
      return "Cough, cough! 😷 Don't worry, coughing is your body's way of cleaning itself! 🌪️\n\nLet's help your throat feel better:\n• Drink warm honey water (nature's candy!) 🍯\n• Breathe steam from a warm shower 🚿\n• Rest your voice like it's sleeping 😴\n• Gargle with warm salt water if you're old enough 🧂\n\n💊 Medicine that might help (ONLY with doctor's permission!):\n• Cough syrup for persistent cough\n• Throat lozenges for older kids/adults\n• Honey-based remedies (for kids over 1 year)\n\n⚠️ SUPER IMPORTANT: Always ask a grown-up and doctor before taking ANY medicine! Most coughs get better on their own. You'll feel better soon, I promise! 🌈";
    }
    
    return "Hello there, brave friend! 😊 I'm here to help you feel better! 🤗\n\nTo give you the best help, can you tell me:\n• What part of your body doesn't feel good? 🤷‍♀️\n• When did you start feeling this way? ⏰\n• What makes it feel better or worse? 🤔\n\n💡 Remember: I can suggest medicines, but you must ALWAYS tell a grown-up you trust and ask a doctor before taking ANY medicine! Never take medicine alone! 👨‍⚕️👩‍⚕️\n\nRemember, you're very brave for asking about your health! 🦸‍♂️";
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = 'en-US';
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

    recognitionRef.current.lang = 'en-US';
    
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
            Back to Home
          </Button>
        </div>

        {/* AI Doctor Toggle */}
        <div className="mb-6 bg-gradient-to-r from-purple-400 to-blue-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              <span className="font-bold">🤖 AI Doctor Mode</span>
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
                placeholder="Enter your OpenAI API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white text-gray-800"
              />
              <p className="text-xs mt-1 opacity-80">Your API key is stored locally and never shared</p>
            </div>
          )}
        </div>

        {/* Health Tip Banner */}
        <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white p-4 rounded-lg shadow-lg animate-scale-in">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 animate-pulse" />
            <span className="font-bold">💡 Health Tip</span>
          </div>
          <p className="text-sm">Drink plenty of water throughout the day to keep your body healthy and hydrated! 💧</p>
        </div>

        {/* Voice Assistant Interface */}
        <Card className="shadow-2xl hover:shadow-3xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardTitle className="flex items-center gap-2 justify-center text-2xl">
              <Stethoscope className="h-6 w-6 animate-pulse" />
              <Heart className="h-5 w-5 text-pink-300 animate-bounce" />
              {useAiDoctor ? "AI Doctor Voice" : "Voice Assistant"} - ArogyaMitra
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
                      {useAiDoctor ? "Talk to AI Doctor" : "Talk to Me"}
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
                  {useAiDoctor ? "AI Doctor says:" : "ArogyaMitra says:"}
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
              <h3 className="font-semibold mb-2 text-center">How to Use</h3>
              <ul className="space-y-1 text-sm">
                <li>• Click the microphone button to start talking</li>
                <li>• Describe your symptoms or ask health questions</li>
                <li>• I'll provide helpful advice and suggestions</li>
                <li>• Always consult a doctor for serious concerns</li>
                <li>• Use AI Doctor mode for more detailed responses</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceAssistant;
