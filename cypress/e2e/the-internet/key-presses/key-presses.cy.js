describe('The Internet - Key Presses', () => {
    beforeEach(() => {
        cy.visit('https://the-internet.herokuapp.com/key_presses')
    })

    it('deve identificar a tecla Enter', () => {
        cy.get('#target').type('{g}')
        cy.get('#result').should('have.text', 'You entered: G')
    })

    it('deve identificar a tecla Escape', () => {
        cy.get('#target').type('{esc}')
        cy.get('#result').should('have.text', 'You entered: ESCAPE')
    })

    it('deve identificar a tecla A', () => {
        cy.get('#target').type('A')
        cy.get('#result').should('have.text', 'You entered: A')
    })
})