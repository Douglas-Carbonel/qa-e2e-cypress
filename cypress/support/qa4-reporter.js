// cypress/support/qa4-reporter.js
//
// Detecta automaticamente a empresa pelo caminho do arquivo de teste
// (pasta dentro de cypress/e2e/) e reporta o resultado no 4QA.

const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'

/**
 * @param {string} testTitle  - this.currentTest.title
 * @param {string} state      - this.currentTest.state ('passed' | 'failed')
 * @param {number} duration   - this.currentTest.duration
 * @param {string|null} errorMessage - this.currentTest.err?.message
 */
function reportToQA4(testTitle, state, duration, errorMessage) {
    const scenarioMap = Cypress.env('QA4_SCENARIO_MAP') || {}

    // Detecta a pasta do produto pelo caminho do spec
    // ex: "cypress/e2e/saucedemo/login.cy.js" → "saucedemo"
    const specParts = (Cypress.spec.relative || '').split('/')
    const folder = specParts.length >= 3 ? specParts[2] : 'default'

    const entry = scenarioMap[`${folder}:${testTitle}`]

    if (!entry) {
        Cypress.log({ name: '4QA', message: `cenário "${folder}:${testTitle}" não encontrado` })
        return
    }

    const { scenarioId, apiKey } = entry

    cy.request({
        method: 'POST',
        url: `${RESULTS_ENDPOINT}?api_key=${apiKey}`,
        body: {
            results: [{
                scenario_id: scenarioId,
                status: state === 'passed' ? 'passed' : 'failed',
                duration: duration,
                error_message: errorMessage || null,
                executed_by: 'cypress-ci',
            }],
        },
        failOnStatusCode: false,
    }).then(() => {
        Cypress.log({ name: '4QA', message: `reportado: ${folder} / ${testTitle} → ${state}` })
    })
}

module.exports = { reportToQA4 }