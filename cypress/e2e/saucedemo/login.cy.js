const { reportToQA4 } = require('../../support/qa4-reporter');

const SCENARIOS = {
    "Login com sucesso": "70dd6cda-4b87-4d86-bfa8-53f3b84707c3",
    "Login inválido deve exibir erro": "d6cdffed-8eb0-4222-bd7f-68dd322ca4a9", // adicione o ID quando criar no 4QA
};

describe('SauceDemo Login', () => {

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/')
    })

    afterEach(function () {
        reportToQA4(
            SCENARIOS[this.currentTest.title],
            this.currentTest.state,
            this.currentTest.duration,
            this.currentTest.err ? this.currentTest.err.message : null,
        );
    })

    it('Login com sucesso', () => {
        cy.get('#user-name').type('standard_user')
        cy.get('#password').type('secret_sauce')
        cy.get('#login-button').click()

        cy.url().should('include', 'inventory')
    })

    it('Login inválido deve exibir erro', () => {
        cy.get('#user-name').type('usuario_errado')
        cy.get('#password').type('senha_errada')
        cy.get('#login-button').click()

        cy.get('[data-test="error"]').should('be.visible')
    })

})