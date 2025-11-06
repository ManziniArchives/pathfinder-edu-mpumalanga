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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Read file content
    const fileContent = await file.text();
    
    // Generate summary using AI
    const systemPrompt = `You are an educational content summarizer for South African students. 
    
Your task is to:
1. Read and understand the document content
2. Create a clear, engaging summary suitable for a video narration
3. Break down complex concepts into simple explanations
4. Structure the content in a logical flow with introduction, main points, and conclusion
5. Keep the summary between 200-400 words for a 2-3 minute video

Format the response as a JSON object with:
- title: A catchy title for the video
- summary: The main narration script (well-structured paragraphs)
- keyPoints: Array of 3-5 key takeaways
- difficulty: "Grade 9-10", "Grade 11-12", or "Tertiary"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Summarize this document for a student video:\n\n${fileContent}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the AI response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // If AI didn't return JSON, create structured response
      parsedResponse = {
        title: "Document Summary",
        summary: aiResponse,
        keyPoints: [],
        difficulty: "General"
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Process document error:', error);
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
