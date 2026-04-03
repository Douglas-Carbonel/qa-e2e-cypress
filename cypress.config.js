// cypress.config.js
const { defineConfig } = require('cypress')
const fs = require('fs')

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/**/*.{cy.js,spec.js,cy.ts,spec.ts}',
    setupNodeEvents(on, config) {
      try {
        const map = JSON.parse(fs.readFileSync('qa4-scenarios.json', 'utf-8'))
        config.env.QA4_SCENARIO_MAP = map
      } catch (e) {
        console.warn('4QA: qa4-scenarios.json não encontrado — rode o sync primeiro')
      }
      return config
    },
  },
})