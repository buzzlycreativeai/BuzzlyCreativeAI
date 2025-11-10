'use client';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [remaining, setRemaining] = useState(5);
  const chatRef = useRef();

  useEffect(()=> {
    const saved = localStorage.getItem('buzzly_messages_v2');
    if(saved) setMessages(JSON.parse(saved));
    const savedRem = localStorage.getItem('buzzly_remaining_v2');
    if(savedRem) setRemaining(Number(savedRem));
  },[]);

  useEffect(()=> {
    localStorage.setItem('buzzly_messages_v2', JSON.stringify(messages));
  },[messages]);

  useEffect(()=> {
    localStorage.setItem('buzzly_remaining_v2', String(remaining));
  },[remaining]);

  function append(role, text){
    setMessages(m=>[...m, {role, text, time: Date.now()}]);
    setTimeout(()=> { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 120);
  }

  async function send(){
    if(!input) return;
    if(remaining <=0){
      if(confirm('Has agotado las 5 consultas gratis. ¿Quieres simular upgrade a premium?')) {
        setRemaining(9999);
        alert('Simulado: ahora eres Premium (local demo).');
      } else return;
    }
    append('user', input);
    const prompt = input;
    setInput('');
    append('ai', 'Analizando tu idea...');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setMessages(m => m.filter(msg => !(msg.role==='ai' && msg.text.includes('Analizando'))));
      if(res.ok && data.result) {
        append('ai', data.result);
      } else if(res.ok && data.answer) {
        append('ai', data.answer);
      } else {
        append('ai', data.error || 'Error: no hay respuesta');
      }
    } catch(e){
      setMessages(m => m.filter(msg => !(msg.role==='ai' && msg.text.includes('Analizando'))));
      append('ai', 'Error al conectar con el servidor (simulado).');
    }
    setRemaining(r => (r>0 && r<9999) ? r-1 : r);
  }

  return (
    <main className="home-hero">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
      </div>

      <div className="center-card">
        <header className="card-header">
          <div>
            <h1>BuzzlyCreative AI</h1>
            <p className="muted">Convierte ideas en videos virales para TikTok</p>
          </div>
          <div style={{textAlign:'right'}}>
            <div className="muted">Consultas restantes:</div>
            <div style={{fontWeight:700}}>{remaining === 9999 ? 'Ilimitadas (Premium)' : remaining}</div>
          </div>
        </header>

        <div ref={chatRef} className="chat-window" role="log" aria-live="polite">
          {messages.length===0 && <div className="muted">Bienvenido — escribe una idea o pregunta para obtener un análisis optimizado.</div>}
          {messages.map((m,i)=>(
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-text">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-controls">
          <input aria-label="input" value={input} onChange={e=>setInput(e.target.value)} placeholder="Escribe tu idea (ej.: hook para un video de 15s sobre recetas)" />
          <button className="btn" onClick={send}>Enviar</button>
        </div>

        <div className="small muted" style={{marginTop:10}}>
          Demo local: autenticación simulada, upgrade simulado. Para producción integra NextAuth + Stripe + OpenAI con key en servidor.
        </div>
      </div>
    </main>
  );
}
