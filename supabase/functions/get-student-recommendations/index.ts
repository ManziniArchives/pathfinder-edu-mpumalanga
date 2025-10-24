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

    const markValues = Object.values(marks).filter(m => m !== "").map(Number);
    const average = markValues.reduce((a, b) => a + b, 0) / markValues.length;

    const prompt = `You are a career guidance counselor for South African students in Mpumalanga. Analyze this student's academic profile:

Grade: ${grade}
Marks: ${JSON.stringify(marks)}
Average: ${average.toFixed(1)}%

Based on their performance and Mpumalanga's economic needs, provide comprehensive recommendations.

Return your response in this JSON format:
{
  "courses": [
    {
      "name": "Course name",
      "institution": "Institution in/near Mpumalanga",
      "type": "university" or "tvet",
      "requirements": "Entry requirements",
      "duration": "Duration"
    }
  ],
  "careers": [
    {
      "title": "Career title",
      "description": "Brief description",
      "salary_range": "Estimated range",
      "demand": "high", "medium", or "scarce"
    }
  ],
  "scarce_skills": ["skill 1", "skill 2", "skill 3", "skill 4"],
  "overall_assessment": "2-3 sentences about their academic profile and potential"
}

Include:
- 4-6 realistic course options (mix of university and TVET)
- 5-6 career options aligned with their strengths
- Scarce skills relevant to Mpumalanga: Mining, Engineering, Healthcare, Agriculture, IT, Tourism
- Real institutions: University of Mpumalanga, TVET colleges in Mbombela, Witbank, etc.
- Be specific and encouraging`;

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
    console.error('Student recommendations error:', error);
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
