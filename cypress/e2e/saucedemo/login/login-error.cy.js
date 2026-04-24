const { reportToQA4 } = require('../../support/qa4-reporter')  // ← adicionar o import

describe('SauceDemo Login invalido', () => {

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/')
    })

    afterEach(function () {
        reportToQA4(
            this.currentTest.title,  // ← era SCENARIOS[this.currentTest.title], agora só o título
            this.currentTest.state,
            this.currentTest.duration,
            this.currentTest.err ? this.currentTest.err.message : null,
        )
    })

    it('Login inválido deve exibir erro', () => {
        cy.get('#user-name').type('usuario_errado')
        cy.get('#password').type('senha_errada')
        cy.get('#login-button').click()
        cy.get('[data-test="errorazxz"]').should('be.visible')
    })

})