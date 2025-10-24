import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { grade, marks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate average
    const markValues = Object.values(marks).filter(m => m !== "").map(Number);
    const average = markValues.reduce((a, b) => a + b, 0) / markValues.length;

    const prompt = `You are an educational advisor for Mpumalanga learners. Analyze this student's performance:

Grade: ${grade}
Marks: ${JSON.stringify(marks)}
Average: ${average.toFixed(1)}%

Based on this performance, recommend whether they should:
1. Continue to Grade 12 (if strong academic performance)
2. Consider TVET college programs (if practical skills would be better)

Provide your response in the following JSON format:
{
  "pathway": "grade12" or "tvet",
  "reasoning": "2-3 sentences explaining why this path suits them",
  "recommendations": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"],
  "next_steps": ["action step 1", "action step 2", "action step 3"]
}

Consider:
- Academic strengths and weaknesses
- Mpumalanga TVET colleges offer: Engineering, Business Studies, Hospitality, IT, Agriculture
- Grade 12 opens doors to universities and more career options
- TVET provides practical skills and faster entry to workplace
- Be encouraging and supportive in tone`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Learner recommendations error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
