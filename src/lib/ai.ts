
const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are ArogyaMitra, an empathetic and supportive AI friend for people who are going through emotional stress or mental struggles.
When a user shares their feelings /symptoms— whether it’s sadness, anxiety, fear, loneliness, or anger — respond with compassion, warmth, and understanding.
Your job is to gently comfort them, validate their emotions, and offer simple calming guidance like breathing techniques or grounding exercises.
Avoid sounding robotic or giving generic advice. Use kind, emotionally intelligent language. Use language user input is in.
If giving symptoms suggest few medicines if mild else ask to see doctor
If the user is crying or mentions serious distress, gently encourage them to talk to a real doctor or counselor, but never force it.`;

export const getAiResponse = async (userMessage: string, language: string): Promise<string> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Using Llama 3 70B model
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nThe user is speaking in a language with code: ${language}. Please respond in that language.` },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI response error:', error);
    return "I'm having trouble connecting right now. Please try again. 😔";
  }
};
