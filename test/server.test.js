'use strict'

const test = require('node:test')
const assert = require('node:assert')
const http = require('node:http')
const { handler } = require('../server')

function get (server, path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address()
    http.get({ host: '127.0.0.1', port, path }, (res) => {
      let body = ''
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body }))
    }).on('error', reject)
  })
}

test('serves public files', async () => {
  const server = http.createServer(handler).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    assert.deepStrictEqual(await get(server, '/health'), { status: 200, body: 'ok\n' })
    const report = await get(server, '/files?name=report.txt')
    assert.strictEqual(report.status, 200)
    assert.match(report.body, /Quarterly report/)
    const download = await get(server, '/download/index.txt')
    assert.strictEqual(download.status, 200)
  } finally {
    server.close()
  }
})
