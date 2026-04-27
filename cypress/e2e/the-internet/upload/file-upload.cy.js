describe('The Internet - Upload', () => {
    it('deve enviar um arquivo com sucesso', () => {
        cy.visit('https://the-internet.herokuapp.com/upload')

        cy.get('#file-upload').selectFile('cypress/fixtures/example.json')
        cy.get('#file-submit').click()

        cy.url().should('include', '/upload')
        cy.get('h3').should('have.text', 'File Uploaded!')
        cy.get('#uploaded-files').should('contain.text', 'example.json')
    })
})