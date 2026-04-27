describe('The Internet - Checkboxes', () => {
    it('deve marcar o primeiro checkbox e desmarcar o segundo', () => {
        cy.visit('https://the-internet.herokuapp.com/checkboxes')

        cy.get('input[type="checkbox"]').eq(0).should('not.be.checked')
        cy.get('input[type="checkbox"]').eq(0).check()
        cy.get('input[type="checkbox"]').eq(0).should('be.checked')

        cy.get('input[type="checkbox"]').eq(1).should('be.checked')
        cy.get('input[type="checkbox"]').eq(1).uncheck()
        cy.get('input[type="checkbox"]').eq(1).should('not.be.checked')
    })
})