describe('The Internet - Download', () => {
    it('deve realizar o download de um arquivo com sucesso', () => {
        cy.visit('https://the-internet.herokuapp.com/download')

        cy.contains('some-file.txt').click()

        cy.readFile('cypress/downloads/some-file.txt').should('exist')
    })
})