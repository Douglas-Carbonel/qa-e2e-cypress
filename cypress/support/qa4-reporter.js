// cypress/support/qa4-reporter.js
const RESULTS_ENDPOINT = 'https://ivmdgybacqbkpyamtjrd.supabase.co/functions/v1/cypress-results'

function reportToQA4(testTitle, testState, duration, errorMsg) {
    const scenarioMap = Cypress.env('QA4_SCENARIO_MAP') || {}
    const scenarioId = scenarioMap[testTitle]
    const apiKey = Cypress.env('QA4_API_KEY')

    if (!scenarioId) {
        cy.log(`⚠️ 4QA: cenário "${testTitle}" não encontrado no mapa`)
        return
    }

    cy.log(`📤 4QA: enviando resultado — ${testTitle} → ${testState}`)

    cy.request({
        method: 'POST',
        url: `${RESULTS_ENDPOINT}?api_key=${apiKey}`,
        body: {
            results: [{
                scenario_id: scenarioId,
                status: testState === 'passed' ? 'passed' : 'failed',
                duration: duration || null,
                error_message: errorMsg || null,
                executed_by: 'cypress-local',
            }],
        },
        failOnStatusCode: false,
    }).then((response) => {
        cy.log(`✅ 4QA: ${JSON.stringify(response.body)}`)
    })
}

module.exports = { reportToQA4 }