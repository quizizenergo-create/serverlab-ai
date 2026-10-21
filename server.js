'use strict';

// Optional local server for ServerLab AI.
// Requires Node.js 18+ for the built-in fetch API. No npm packages are needed.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const MAX_BODY_BYTES = 16 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const rateCounters = new Map();
function rateLimitOkay(ip) {
  const now = Date.now();
  const entry = rateCounters.get(ip);
  if (!entry || now - entry.startedAt > 60_000) {
    rateCounters.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 20;
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('REQUEST_TOO_LARGE'));
        req.destroy();
        return;
      }
      body += chunk.toString('utf8');
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}

async function handleAI(req, res) {
  if (!rateLimitOkay(req.socket.remoteAddress || 'local')) {
    return sendJson(res, 429, { error: 'Тым көп сұрау жіберілді. Бір минуттан кейін қайталап көр.' });
  }
  let body;
  try { body = await readJsonBody(req); }
  catch (error) {
    const status = error.message === 'REQUEST_TOO_LARGE' ? 413 : 400;
    return sendJson(res, status, { error: status === 413 ? 'Сұрау көлемі тым үлкен.' : 'Сұрау пішімі дұрыс емес.' });
  }

  const message = String(body.message || '').trim().slice(0, 4000);
  if (!message) return sendJson(res, 400, { error: 'Сұрақ мәтіні бос болмауы керек.' });
  if (!OPENAI_API_KEY) {
    return sendJson(res, 503, { error: 'AI_NOT_CONFIGURED', mode: 'demo' });
  }

  const student = body.student && typeof body.student === 'object' ? body.student : {};
  const summary = {
    completedLessons: Number.isFinite(Number(student.completedLessons)) ? Number(student.completedLessons) : 0,
    totalLessons: 24,
    experience: Number.isFinite(Number(student.experience)) ? Number(student.experience) : 0,
    averageTestScore: student.averageTestScore == null ? null : Number(student.averageTestScore),
    recommendation: String(student.recommendation || 'Бірінші сабақты баста').slice(0, 180)
  };

  const instructions = `Сен ServerLab AI атты колледж студенттеріне арналған оқу тәлімгерісің. Негізгі пән: «Серверлік техникалық құралдар». Қазақ тілінде табиғи, жылы және түсінікті жауап бер; пайдаланушы орысша сұраса, орысша жауап беруге болады. Күрделі ұғымды қарапайым тілмен түсіндір, шағын мысал келтір, соңында бір қысқа тексеру сұрағын не келесі оқу қадамын ұсын. Қате ақпаратты ойдан шығарма; сенімсіз болсаң, оны ашық айт. Маңызды серверлік конфигурация, киберқауіпсіздік немесе өндірістік өзгерістер жайлы кеңес бергенде ресми құжаттамамен және оқытушымен тексеруді ескерт. Студенттің орнына бағаланатын жұмысты түгел орындаудан гөрі, түсінуге бағытта. Құпиясөз, ЖСН немесе басқа жеке деректерді сұрама. Қысқа жеке оқу контексті: ${summary.completedLessons}/${summary.totalLessons} сабақ аяқталды, ${summary.experience} XP, орташа тест нәтижесі: ${summary.averageTestScore == null ? 'әлі жоқ' : summary.averageTestScore + '%'}, келесі ұсынылған тақырып: ${summary.recommendation}.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions,
        input: [{ role: 'user', content: [{ type: 'input_text', text: message }] }],
        max_output_tokens: 700,
        store: false
      }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('AI API request failed:', response.status, data.error?.type || data.error?.code || 'unknown');
      return sendJson(res, 502, { error: 'ИИ қызметі жауап бере алмады. API баптауларын тексер.' });
    }
    const outputText = typeof data.output_text === 'string' ? data.output_text : (data.output || [])
      .filter(item => item.type === 'message')
      .flatMap(item => item.content || [])
      .filter(part => part.type === 'output_text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('\n')
      .trim();
    if (!outputText) return sendJson(res, 502, { error: 'ИИ бос жауап қайтарды. Қайталап көр.' });
    return sendJson(res, 200, { reply: outputText.slice(0, 10_000), mode: 'openai' });
  } catch (error) {
    console.error('AI request error:', error.name === 'AbortError' ? 'timeout' : error.message);
    return sendJson(res, 502, { error: error.name === 'AbortError' ? 'ИИ жауабы уақытында келмеді. Қайталап көр.' : 'ИИ қызметіне қосылу мүмкін болмады.' });
  } finally {
    clearTimeout(timeout);
  }
}

function serveFile(req, res, pathname) {
  let requestedPath;
  try { requestedPath = decodeURIComponent(pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (requestedPath === '/') requestedPath = '/index.html';
  const resolved = path.resolve(ROOT, `.${requestedPath}`);
  if (!resolved.startsWith(ROOT + path.sep) && resolved !== path.join(ROOT, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(resolved, (statErr, stats) => {
    if (statErr || !stats.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const type = MIME[path.extname(resolved).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Cache-Control': path.basename(resolved) === 'index.html' ? 'no-cache' : 'public, max-age=300'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(resolved).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/api/status') {
    return sendJson(res, 200, { aiEnabled: Boolean(OPENAI_API_KEY), model: OPENAI_API_KEY ? OPENAI_MODEL : null });
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    return handleAI(req, res);
  }
  if (url.pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'API route not found' });
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD, POST' });
    return res.end('Method not allowed');
  }
  serveFile(req, res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ServerLab AI is running: http://127.0.0.1:${PORT}`);
  console.log(OPENAI_API_KEY ? `ИИ режимі: ${OPENAI_MODEL}` : 'ИИ режимі: демо (OPENAI_API_KEY орнатылмаған)');
});
