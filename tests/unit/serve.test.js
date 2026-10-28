import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';
import { createAppServer } from '../../scripts/serve.js';

test('only public app assets are served, with correct MIME/methods and loopback binding', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'curso-server-'));
  const server = createAppServer(pathToFileURL(directory + '/'));
  try {
    await mkdir(join(directory, 'src/ui'), { recursive: true });
    await writeFile(join(directory, 'index.html'), '<title>Curso-PSWE-07</title>');
    await writeFile(join(directory, 'src/ui/app.js'), 'export {};');
    await writeFile(join(directory, 'src/ui/styles.css'), 'body{}');
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    assert.equal(server.address().address, '127.0.0.1');
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const [path, mime] of [['/','text/html'],['/index.html','text/html'],['/src/ui/app.js','text/javascript'],['/src/ui/styles.css','text/css']]) {
      const response = await globalThis.fetch(base + path);
      assert.equal(response.status, 200, path);
      assert.ok(response.headers.get('content-type').startsWith(mime));
    }
    const head = await globalThis.fetch(base, { method: 'HEAD' });
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
    for (const path of ['/.git/config','/.specify/feature.json','/README.md','/package.json','/../README.md','/unknown']) {
      assert.equal((await globalThis.fetch(base + path)).status, 404);
    }
    assert.equal((await globalThis.fetch(base, { method: 'POST' })).status, 405);
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    assert.ok(directory.startsWith(join(tmpdir(), 'curso-server-')));
    await rm(directory, { recursive: true, force: true });
  }
});
