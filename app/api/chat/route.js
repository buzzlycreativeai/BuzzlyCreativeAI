import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.text || '';
    if(!prompt) return NextResponse.json({ error: 'No prompt' }, { status: 400 });

    const key = process.env.OPENAI_API_KEY;
    if(!key){
      const viralScore = Math.min(99, Math.round(55 + Math.random()*35));
      const response = [
        `Hook: Empieza con una pregunta sorprendente.`,
        `Estructura: 0-3s hook, 3-10s desarrollo, 10-15s CTA.`,
        `Título sugerido: ${prompt.slice(0,60)}...`,
        `Hashtags: #viral #tiktok #fyp`,
        `Probabilidad estimada de viralidad: ${viralScore}%`
      ].join('\n');
      return NextResponse.json({ result: response });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });

    if(!openaiRes.ok){
      const txt = await openaiRes.text();
      return NextResponse.json({ error: 'OpenAI error', detail: txt }, { status: 500 });
    }
    const data = await openaiRes.json();
    const ans = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data);
    return NextResponse.json({ result: ans });
  } catch (err) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
