// cypress/support/qa4.plugin.js
const fs = require('fs')

let qa4Map = {}
try {
    qa4Map = JSON.parse(fs.readFileSync('.qa4map.json', 'utf-8'))
} catch (e) {
    console.warn('4QA: .qa4map.json não encontrado — execute o passo de sync primeiro')
}

const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'

module.exports = (on, config) => {
    on('after:spec', (_spec, results) => {
        const scenarioId = qa4Map[_spec.relative]
        const apiKey = config.env.QA4_API_KEY

        if (!scenarioId || !apiKey) return

        const status = results.stats.failures > 0 ? 'failed' : 'passed'
        const duration = results.stats.duration

        const body = JSON.stringify({
            results: [{ scenario_id: scenarioId, status, duration, executed_by: 'cypress-ci' }]
        })

        const url = new URL(RESULTS_ENDPOINT + '?api_key=' + apiKey)
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }

        return new Promise(resolve => {
            const req = require('https').request(options, res => {
                res.on('data', () => { })
                res.on('end', () => {
                    console.log(`4QA: reportado ${status} para o cenário ${scenarioId}`)
                    resolve()
                })
            })
            req.on('error', e => { console.warn('4QA reporter error:', e.message); resolve() })
            req.write(body)
            req.end()
        })
    })
}