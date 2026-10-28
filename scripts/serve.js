import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const files = new Map([
  ['/index.html', 'text/html'], ['/src/ui/app.js', 'text/javascript'],
  ['/src/ui/styles.css', 'text/css'], ['/src/logic/tasks.js', 'text/javascript'],
  ['/src/persistence/task-repository.js', 'text/javascript'],
]);

export function createAppServer(root = new URL('../', import.meta.url)) {
  return createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = pathname === '/' ? '/index.html' : pathname;
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
    }
    if (!files.has(file)) { response.writeHead(404).end('Not found'); return; }
    try {
      const content = await readFile(new URL(file.slice(1), root));
      response.writeHead(200, { 'Content-Type': files.get(file) + '; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(404).end('Not found'); }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  createAppServer().listen(4173, '127.0.0.1', () => console.log('Curso-PSWE-07: http://127.0.0.1:4173'));
}
