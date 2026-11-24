/* Trendfloor KI-Server (Cloudflare Worker)
   Nimmt Fragen aus der Trendfloor-App entgegen und fragt ein kostenloses KI-Modell
   (Cloudflare Workers AI). Es werden keine Daten gespeichert.
   Benötigt: Bindung "AI" (Workers AI) und die Variable "APP_CODE" (dein Zugangscode). */

const DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const FALLBACK_MODEL = '@cf/zai-org/glm-4.7-flash';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Trendfloor-Code',
  'Access-Control-Max-Age': '86400'
};
const reply = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS }
});

const SYSTEM = [
  'Du bist der Assistent der Firma Trendfloor (Bodenleger und Raumausstatter in Villach, Österreich).',
  'Antworte immer auf Deutsch, per Du, kurz und klar (höchstens etwa 8 Zeilen).',
  'Nutze ausschließlich die mitgelieferten Daten. Steht etwas nicht darin, sag das ehrlich und rate nicht.',
  'Rechne Stunden und Summen sorgfältig und nenne den Zeitraum. Das heutige Datum steht in den Daten.',
  'Schreibe normalen Text ohne Markdown, ohne Sternchen und ohne Tabellen. Aufzählungen mit „•“.',
  'Du kannst nichts ändern, anlegen oder löschen. Wenn jemand das möchte, sag, dass du aktuell nur lesen kannst.'
].join('\n');

const noSystem = msgs => {
  const [sys, ...rest] = msgs, last = rest[rest.length - 1];
  return [...rest.slice(0, -1), { role: 'user', content: sys.content + '\n\nFrage des Nutzers: ' + last.content }];
};

const pick = o => {
  if (typeof o === 'string') return o;
  const v = o && (o.response ?? (o.choices && o.choices[0] && o.choices[0].message && o.choices[0].message.content) ?? (o.result && o.result.response) ?? o.output_text);
  return typeof v === 'string' ? v : (v ? JSON.stringify(v) : '');
};
const clean = t => String(t || '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\*\*/g, '').trim();

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (request.method === 'GET') return reply({ ok: true, info: 'Trendfloor KI-Server läuft.' });
    if (request.method !== 'POST') return reply({ error: 'Nur POST erlaubt.' }, 405);

    if (!env.APP_CODE) return reply({ error: 'Auf dem Server fehlt die Variable APP_CODE.' }, 500);
    if (request.headers.get('X-Trendfloor-Code') !== env.APP_CODE) return reply({ error: 'Der Zugangscode stimmt nicht.' }, 401);
    if (!env.AI) return reply({ error: 'Auf dem Server fehlt die Workers-AI-Bindung „AI“.' }, 500);

    let body;
    try { body = await request.json(); } catch (_) { return reply({ error: 'Ungültige Anfrage.' }, 400); }
    const question = String(body.question || '').trim().slice(0, 600);
    if (!question) return reply({ error: 'Keine Frage erhalten.' }, 400);

    let ctx = '';
    try { ctx = JSON.stringify(body.context || {}).slice(0, 16000); } catch (_) {}
    const history = (Array.isArray(body.history) ? body.history : []).slice(-6)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role, content: String(m.content || '').slice(0, 600) }));

    const msgs = [{ role: 'system', content: SYSTEM + '\n\nDATEN (JSON):\n' + ctx }, ...history, { role: 'user', content: question }];
    const model = env.MODEL || DEFAULT_MODEL;
    const attempts = [[model, msgs], [model, noSystem(msgs)], [FALLBACK_MODEL, msgs]];

    let lastErr = '';
    for (const [m, messages] of attempts) {
      try {
        const out = await env.AI.run(m, { messages, max_tokens: 500, temperature: 0.2 });
        const answer = clean(pick(out));
        if (answer) return reply({ answer });
        lastErr = 'Leere Antwort';
      } catch (err) {
        lastErr = String((err && err.message) || err);
        if (/4006|daily free allocation|allocation/i.test(lastErr)) {
          return reply({ error: 'Das kostenlose Tageskontingent ist aufgebraucht. Morgen früh geht es wieder, bis dahin antwortet die Offline-Version.' }, 429);
        }
      }
    }
    return reply({ error: 'KI-Modell nicht erreichbar: ' + lastErr.slice(0, 160) }, 502);
  }
};
