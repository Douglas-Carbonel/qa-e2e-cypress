describe('The Internet - Add/Remove Elements', () => {
    beforeEach(() => {
        cy.visit('https://the-internet.herokuapp.com/add_remove_elements/')
    })

    it('deve adicionar um botão Delete com sucesso', () => {
        cy.contains('Add Element').click()

        cy.get('.added-manually')
            .should('be.visible')
            .and('have.text', 'Delete')
    })

    it('deve remover o botão Delete com sucesso', () => {
        cy.contains('Add Element').click()

        cy.get('.added-manually').should('exist').click()
        cy.get('.added-manually').should('not.exist')
    })

    it('deve adicionar múltiplos botões Delete', () => {
        cy.contains('Add Element').click()
        cy.contains('Add Element').click()
        cy.contains('Add Element').click()

        cy.get('.added-manually').should('have.length', 3)
    })
})