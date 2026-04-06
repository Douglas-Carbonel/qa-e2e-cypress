const { reportToQA4 } = require('../../support/qa4-reporter')  // ← adicionar o import

describe('SauceDemo Login', () => {

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

    it('Adicionando produtos no carrinho', () => {
        cy.get('#user-name').type('standard_user')
        cy.get('#password').type('secret_sauce')
        cy.get('#login-button').click()
        cy.url().should('include', 'inventory')

        cy.get('#add-to-cart-sauce-labs-backpack').click()

        cy.get('[data-test="shopping-cart-badge"]')
            .should('be.visible')
            .and('have.text', '1')
    })


})