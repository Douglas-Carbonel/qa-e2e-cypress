describe('The Internet - Login', () => {
    it('deve exibir erro ao informar senha inválida', () => {
        cy.visit('https://the-internet.herokuapp.com/login')

        cy.get('#username').type('tomsmith')
        cy.get('#password').type('senhaErrada')
        cy.get('.radius').click()

        cy.get('#flash')
            .should('be.visible')
            .and('contain.text', 'Your password is invalid!')
    })
})