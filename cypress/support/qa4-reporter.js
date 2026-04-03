function reportToQA4(scenarioId, testState, duration, errorMsg) {
    if (!scenarioId) {
        cy.log('⚠️ reportToQA4: scenario_id é null, pulando envio');
        return;
    }

    cy.log(`📤 Enviando resultado: scenario_id=${scenarioId}, status=${testState}`);

    cy.request({
        method: "POST",
        url: `${Cypress.env("QA4_RESULTS_URL")}?api_key=${Cypress.env("QA4_API_KEY")}`,
        body: {
            results: [{
                scenario_id: scenarioId,
                status: testState === "passed" ? "passed" : "failed",
                duration: duration || null,
                error_message: errorMsg || null,
                executed_by: "cypress-local",
            }],
        },
        failOnStatusCode: false,
    }).then((response) => {
        cy.log(`✅ Resposta da API: ${JSON.stringify(response.body)}`);
    });
}

module.exports = { reportToQA4 };