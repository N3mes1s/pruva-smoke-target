'use strict'

// Pruva smoke target: a deliberately tiny file server used to exercise every
// Pruva stage (Repro, Variant, Verified Defense, Coding) quickly on real
// infrastructure. It intentionally contains a path traversal bug.

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const PUBLIC_DIR = path.join(__dirname, 'public')

function sendFile (res, relativeName) {
  // BUG (intentional): the requested name is joined without confinement, so
  // "../" segments escape PUBLIC_DIR.
  const filePath = path.join(PUBLIC_DIR, relativeName)
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found\n')
      return
    }
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end(data)
  })
}

function handler (req, res) {
  const url = new URL(req.url, 'http://localhost')
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' })
    res.end('ok\n')
    return
  }
  if (url.pathname === '/files') {
    sendFile(res, url.searchParams.get('name') || 'index.txt')
    return
  }
  if (url.pathname.startsWith('/download/')) {
    // Same flaw through a second entrypoint: the decoded path segment is used as the name.
    sendFile(res, decodeURIComponent(url.pathname.slice('/download/'.length)))
    return
  }
  res.writeHead(404, { 'content-type': 'text/plain' })
  res.end('not found\n')
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080)
  http.createServer(handler).listen(port, '127.0.0.1', () => {
    process.stdout.write(`pruva-smoke-target listening on http://127.0.0.1:${port}\n`)
  })
}

module.exports = { handler, PUBLIC_DIR }
