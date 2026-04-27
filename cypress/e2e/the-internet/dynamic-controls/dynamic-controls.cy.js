describe('The Internet - Dynamic Controls', () => {
    it('deve remover e adicionar o checkbox com sucesso', () => {
        cy.visit('https://the-internet.herokuapp.com/dynamic_controls')

        cy.get('#checkbox-example button')
            .should('be.visible')
            .and('have.text', 'Remove')
            .click()

        cy.get('#message')
            .should('be.visible')
            .and('have.text', "It's gone!")

        cy.get('#checkbox').should('not.exist')

        cy.contains('Add').click()

        cy.get('#message')
            .should('be.visible')
            .and('have.text', "It's back!")

        cy.get('#checkbox').should('exist')
    });

    it('deve habilitar e desabilitar o input com sucesso', () => {
        cy.visit('https://the-internet.herokuapp.com/dynamic_controls')

        cy.get('#input-example button')
            .should('be.visible')
            .and('have.text', 'Enable')
            .click()

        cy.get('#message')
            .should('be.visible')
            .and('have.text', "It's enabled!")

        cy.get('input[type="text"]').should('not.be.disabled').type('teste')

        cy.contains('Disable').click()

        cy.get('#message')
            .should('be.visible')
            .and('have.text', "It's disabled!")

        cy.get('input[type="text"]').should('be.disabled')
    })
})