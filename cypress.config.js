// cypress.config.js
const { defineConfig } = require('cypress')
const fs = require('fs')

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/e2e/**/*.{cy.js,spec.js,cy.ts,spec.ts}',
    setupNodeEvents(on, config) {
      // Carrega o mapa título→ID gerado pelo sync
      try {
        const titleMap = JSON.parse(fs.readFileSync('qa4-scenarios.json', 'utf-8'))
        config.env.QA4_SCENARIO_MAP = titleMap
        console.log('4QA: mapa carregado com', Object.keys(titleMap).length, 'cenários')
      } catch (e) {
        console.warn('4QA: qa4-scenarios.json não encontrado — rode o sync primeiro')
      }
      return config
    },
  },
  env: {
    QA4_API_KEY: process.env.QA4_API_KEY,
  },
})