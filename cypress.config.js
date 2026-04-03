// cypress.config.js
const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')

const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'
const SUPABASE_URL = 'https://ivmdgybacqbkpyamtjrd.supabase.co'

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/**/*.{cy.js,spec.js,cy.ts,spec.ts}',
    screenshotOnRunFailure: true,

    setupNodeEvents(on, config) {
      // 1. Carrega o mapa de cenários gerado pelo qa4-sync.js
      try {
        const map = JSON.parse(fs.readFileSync('qa4-scenarios.json', 'utf-8'))
        config.env.QA4_SCENARIO_MAP = map
      } catch (e) {
        console.warn('4QA: qa4-scenarios.json não encontrado — rode o sync primeiro')
      }

      // 2. Após cada spec: reporta resultados + faz upload de evidências
      on('after:spec', async (spec, results) => {
        const map = config.env.QA4_SCENARIO_MAP || {}
        const specParts = (spec.relative || '').split('/')
        const folder = specParts.length >= 3 ? specParts[2] : 'default'
        const supabaseKey = process.env.SUPABASE_ANON_KEY

        const byApiKey = {}

        for (const test of (results.tests || [])) {
          const title = test.title[test.title.length - 1]
          const entry = map[`${folder}:${title}`]
          if (!entry) continue

          const lastAttempt = (test.attempts || []).slice(-1)[0] || {}
          const status = lastAttempt.state === 'passed' ? 'passed' : 'failed'
          const duration = lastAttempt.duration || 0
          const errorMsg = lastAttempt.error?.message || null

          // Upload screenshots desta execução (falhas capturam automaticamente)
          const evidenceUrls = []
          if (supabaseKey) {
            const shots = (results.screenshots || []).filter(s =>
              s.path.includes(title.substring(0, 40).replace(/[^a-z0-9]/gi, ' ').trim())
            )
            for (const ss of shots) {
              try {
                const file = fs.readFileSync(ss.path)
                const fileName = `${entry.scenarioId}/${Date.now()}-${path.basename(ss.path)}`
                const res = await fetch(
                  `${SUPABASE_URL}/storage/v1/object/evidence/${fileName}`,
                  { method: 'POST', headers: { 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'image/png' }, body: file }
                )
                if (res.ok) evidenceUrls.push(`${SUPABASE_URL}/storage/v1/object/public/evidence/${fileName}`)
              } catch (_) { }
            }
          }

          if (!byApiKey[entry.apiKey]) byApiKey[entry.apiKey] = []
          byApiKey[entry.apiKey].push({
            scenario_id: entry.scenarioId,
            status,
            duration,
            error_message: errorMsg,
            executed_by: 'cypress-ci',
            evidence_urls: evidenceUrls.length ? evidenceUrls : undefined,
          })
        }

        // Envia resultados agrupados por produto
        for (const [apiKey, res] of Object.entries(byApiKey)) {
          await fetch(`${RESULTS_ENDPOINT}?api_key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ results: res }),
          }).catch(e => console.warn('4QA evidence error:', e.message))
        }
      })

      return config
    },
  },
})