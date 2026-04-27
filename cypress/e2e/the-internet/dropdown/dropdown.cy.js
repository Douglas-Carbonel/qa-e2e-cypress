describe('The Internet - Dropdown', () => {
    beforeEach(() => {
        cy.visit('https://the-internet.herokuapp.com/dropdown')
    })

    it('deve selecionar a opção 1 com sucesso', () => {
        cy.get('#dropdown').select('Option 1')
        cy.get('#dropdown').should('have.value', '1')
    })

    it('deve selecionar a opção 2 com sucesso', () => {
        cy.get('#dropdown').select('Option 2')
        cy.get('#dropdown').should('have.value', '2')
    })
})