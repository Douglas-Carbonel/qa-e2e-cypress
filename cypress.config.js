// cypress.config.js
const { defineConfig } = require('cypress')
const https = require('https')
const fs = require('fs')
const path = require('path')

const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'
const SUPABASE_URL = 'https://ivmdgybacqbkpyamtjrd.supabase.co'

// Compatível com Node 14, 16 e 18+
function httpPost(url, headers, body) {
  return new Promise((resolve) => {
    const u = new URL(url)
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))
    const req = https.request(
      {
        hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
        headers: { ...headers, 'Content-Length': buf.length }
      },
      (res) => {
        let data = ''
        res.on('data', c => data += c)
        res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, body: data }))
      }
    )
    req.on('error', (e) => { console.warn('[4QA] erro de rede:', e.message); resolve({ ok: false }) })
    req.write(buf)
    req.end()
  })
}

module.exports = defineConfig({
  e2e: {
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // 1. Carrega o mapa de cenários gerado pelo qa4-sync.js
      try {
        const map = JSON.parse(fs.readFileSync('qa4-scenarios.json', 'utf-8'))
        config.env.QA4_SCENARIO_MAP = map
        console.log('[4QA] mapa carregado:', Object.keys(map).length, 'cenários')
      } catch (e) {
        console.warn('[4QA] qa4-scenarios.json não encontrado — rode o sync primeiro')
      }

      // 2. Após cada spec: reporta resultados + faz upload de evidências
      on('after:spec', async (spec, results) => {
        const map = config.env.QA4_SCENARIO_MAP || {}
        const specParts = (spec.relative || '').split(/[\\/]/)
        const folder = specParts.length >= 3 ? specParts[2] : 'default'
        const supabaseKey = process.env.SUPABASE_ANON_KEY
        const allShots = results.screenshots || []

        console.log(`[4QA] ${spec.relative} → pasta: "${folder}", testes: ${results.tests?.length || 0}, screenshots: ${allShots.length}`)

        const byApiKey = {}

        for (const test of (results.tests || [])) {
          const title = test.title[test.title.length - 1]
          const entry = map[`${folder}:${title}`]

          if (!entry) {
            console.log(`[4QA] sem mapeamento: "${folder}:${title}"`)
            continue
          }

          const lastAttempt = (test.attempts || []).slice(-1)[0] || {}
          const status = lastAttempt.state === 'passed' ? 'passed' : 'failed'
          const duration = lastAttempt.duration || 0
          const errorMsg = lastAttempt.error?.message || null

          // Casa screenshots por testId (Cypress 12+) ou pelo título no caminho (fallback)
          const shots = allShots.filter(s =>
            (test.testId && s.testId === test.testId) ||
            path.basename(s.path).toLowerCase().includes(
              title.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().substring(0, 30)
            )
          )
          console.log(`[4QA] "${title}": status=${status}, screenshots=${shots.length}`)

          const evidenceUrls = []
          if (supabaseKey && shots.length > 0) {
            for (const ss of shots) {
              try {
                const file = fs.readFileSync(ss.path)
                const fileName = `${entry.scenarioId}/${Date.now()}-${path.basename(ss.path)}`
                const res = await httpPost(
                  `${SUPABASE_URL}/storage/v1/object/evidence/${fileName}`,
                  { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'image/png' },
                  file
                )
                if (res.ok) {
                  const url = `${SUPABASE_URL}/storage/v1/object/public/evidence/${fileName}`
                  evidenceUrls.push(url)
                  console.log('[4QA] evidência enviada:', url)
                } else {
                  console.warn('[4QA] upload falhou:', res.status, res.body)
                }
              } catch (e) {
                console.warn('[4QA] erro ao processar screenshot:', e.message)
              }
            }
          } else if (!supabaseKey) {
            console.warn('[4QA] SUPABASE_ANON_KEY não definida — evidências desativadas')
          }

          if (!byApiKey[entry.apiKey]) byApiKey[entry.apiKey] = []
          byApiKey[entry.apiKey].push({
            scenario_id: entry.scenarioId,
            status, duration,
            error_message: errorMsg,
            executed_by: 'cypress-ci',
            evidence_urls: evidenceUrls.length ? evidenceUrls : undefined,
          })
        }

        // Envia resultados agrupados por produto
        for (const [apiKey, res] of Object.entries(byApiKey)) {
          const r = await httpPost(
            `${RESULTS_ENDPOINT}?api_key=${apiKey}`,
            { 'Content-Type': 'application/json' },
            res
          )
          console.log('[4QA] resultados enviados:', r.status, r.ok ? 'OK' : r.body)
        }
      })

      return config
    },
  },
})