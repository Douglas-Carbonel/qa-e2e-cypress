describe('The Internet - Context Menu', () => {
    beforeEach(() => {
        cy.visit('https://the-internet.herokuapp.com/context_menu')
    })

    it('deve exibir o alerta ao clicar com o botão direito', () => {
        cy.on('window:alert', (text) => {
            expect(text).to.equal('You selected a context menu')
        })

        cy.get('#hot-spot').rightclick()
    })
})