// cypress.config.js
// Sem qa4-scenarios.json — busca o mapa direto da API a cada run.
const { defineConfig } = require('cypress')
const https = require('https')
const fs = require('fs')
const path = require('path')

const SYNC_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-sync'
const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'
const SUPABASE_URL = 'https://ivmdgybacqbkpyamtjrd.supabase.co'

// Compatível com Node 14, 16 e 18+
function httpRequest(method, url, headers, body) {
  return new Promise((resolve) => {
    const u = new URL(url)
    const buf = body ? (Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))) : null
    const req = https.request(
      {
        hostname: u.hostname, path: u.pathname + u.search, method,
        headers: { ...headers, ...(buf ? { 'Content-Length': buf.length } : {}) }
      },
      (res) => {
        let data = ''
        res.on('data', c => data += c)
        res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, body: data }))
      }
    )
    req.on('error', (e) => { console.warn('[4QA] erro de rede:', e.message); resolve({ ok: false, body: e.message }) })
    if (buf) req.write(buf)
    req.end()
  })
}

// Normaliza texto: remove acentos, lowercase, espaços extras
function normalize(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/s+/g, ' ').trim()
}

// Cache: folder → titleMap { titulo → scenarioId }
const cache = {}

module.exports = defineConfig({
  e2e: {
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // Lê QA4_COMPANIES do ambiente: { "pasta": "api-key" }
      let folderToApiKey = {}
      try {
        folderToApiKey = JSON.parse(process.env.QA4_COMPANIES || '{}')
        console.log('[4QA] pastas configuradas:', Object.keys(folderToApiKey).join(', ') || '(nenhuma)')
      } catch (e) {
        console.warn('[4QA] QA4_COMPANIES inválido ou ausente:', e.message)
      }

      on('after:spec', async (spec, results) => {
        const specParts = (spec.relative || '').split(/[\\/]/)
        const folder = specParts.length >= 3 ? specParts[2] : specParts[0]
        const apiKey = folderToApiKey[folder]
        const supabaseKey = process.env.SUPABASE_ANON_KEY
        const allShots = results.screenshots || []

        console.log(`[4QA] ${spec.relative} → pasta: "${folder}", screenshots: ${allShots.length}`)

        if (!apiKey) {
          console.warn(`[4QA] Pasta "${folder}" não encontrada em QA4_COMPANIES — resultado não enviado.`)
          return
        }

        // Busca titleMap da API (com cache por pasta)
        if (!cache[folder]) {
          const res = await httpRequest('GET', `${SYNC_ENDPOINT}?api_key=${apiKey}`, {}, null)
          if (!res.ok) {
            console.warn('[4QA] falha ao buscar cenários:', res.status, res.body)
            return
          }
          const data = JSON.parse(res.body)
          cache[folder] = data.titleMap || {}
          console.log(`[4QA] ${Object.keys(cache[folder]).length} cenários para "${folder}"`)
        }

        const titleMap = cache[folder]
        const payload = []

        for (const test of (results.tests || [])) {
          const title = test.title[test.title.length - 1]
          const scenarioId = titleMap[title]

          if (!scenarioId) {
            console.log(`[4QA] sem mapeamento: "${title}" — verifique o título no 4QA`)
            continue
          }

          const lastAttempt = (test.attempts || []).slice(-1)[0] || {}
          const status = lastAttempt.state === 'passed' ? 'passed' : 'failed'
          const duration = lastAttempt.duration || 0
          const errorMsg = lastAttempt.error?.message || null

          const shots = allShots.filter(s =>
            (test.testId && s.testId === test.testId) ||
            normalize(path.basename(s.path)).includes(normalize(title).substring(0, 30))
          )
          console.log(`[4QA] "${title}": ${status}, ${shots.length} screenshot(s)`)

          const evidenceUrls = []
          if (supabaseKey) {
            for (const ss of shots) {
              try {
                const file = fs.readFileSync(ss.path)
                const ext = path.extname(ss.path) || '.png'
                const safeName = path.basename(ss.path, ext)
                  .normalize('NFD').replace(/[̀-ͯ]/g, '')
                  .replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
                  .replace(/^-|-$/g, '').substring(0, 60)
                const fileName = `${scenarioId}/${Date.now()}-${safeName}${ext}`
                const up = await httpRequest(
                  'POST',
                  `${SUPABASE_URL}/storage/v1/object/evidence/${fileName}`,
                  { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'image/png' },
                  file
                )
                if (up.ok) {
                  const url = `${SUPABASE_URL}/storage/v1/object/public/evidence/${fileName}`
                  evidenceUrls.push(url)
                  console.log('[4QA] evidência enviada:', url)
                } else {
                  console.warn('[4QA] upload falhou:', up.status, up.body)
                }
              } catch (e) {
                console.warn('[4QA] erro ao processar screenshot:', e.message)
              }
            }
          }

          payload.push({
            scenario_id: scenarioId,
            status, duration,
            error_message: errorMsg,
            executed_by: 'cypress-ci',
            evidence_urls: evidenceUrls.length ? evidenceUrls : undefined,
          })
        }

        if (payload.length === 0) return

        const r = await httpRequest(
          'POST',
          `${RESULTS_ENDPOINT}?api_key=${apiKey}`,
          { 'Content-Type': 'application/json' },
          { results: payload }
        )
        console.log('[4QA] resultados enviados:', r.status, r.ok ? 'OK' : r.body)
      })

      return config
    },
  },
})