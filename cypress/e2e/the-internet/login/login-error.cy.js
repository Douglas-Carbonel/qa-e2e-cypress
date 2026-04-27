describe('The Internet - Login', () => {
    it('deve realizar login com sucesso', () => {
        cy.visit('https://the-internet.herokuapp.com/login')

        cy.get('#username').type('tomsmith')
        cy.get('#password').type('SuperSecretPassword!')
        cy.get('.radius').click()

        cy.url().should('include', '/secure')
        cy.get('#flash')
            .should('be.visible')
            .and('contain.text', 'You logged into a secure area!')
    })
})