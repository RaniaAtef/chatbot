import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a Smart Nutrition Coach, a helpful and knowledgeable assistant focused on healthy eating and nutrition. Your role is to:

1. Answer questions about healthy meal options and nutrition
2. Suggest healthy replacements for unhealthy food items
3. Recommend appropriate snacks based on time of day and activity level
4. Provide evidence-based nutrition advice
5. Be encouraging and supportive while promoting healthy eating habits

Key guidelines:
- Always provide practical, actionable advice
- Consider the context (time of day, activity level, dietary restrictions if mentioned)
- Suggest whole foods and balanced meals
- Be specific with portion sizes when relevant
- Avoid giving medical advice - recommend consulting healthcare professionals for specific health concerns
- Keep responses conversational and engaging
- Focus on sustainable, long-term healthy eating habits

Current time context: ${new Date().toLocaleString()}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    return new Response(JSON.stringify({ message: response }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to get response from AI assistant',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

