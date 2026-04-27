describe('The Internet - JavaScript Alerts', () => {
    it('deve validar o alerta simples', () => {
        cy.visit('https://the-internet.herokuapp.com/javascript_alerts')

        cy.contains('Click for JS Alert').click()

        cy.on('window:alert', (text) => {
            expect(text).to.equal('I am a JS Alert')
        })

        cy.get('#result').should('have.text', 'You successfully clicked an alert')
    })

    it('deve validar o confirm aceito', () => {
        cy.visit('https://the-internet.herokuapp.com/javascript_alerts')

        cy.on('window:confirm', (text) => {
            expect(text).to.equal('I am a JS Confirm')
            return true
        })

        cy.contains('Click for JS Confirm').click()

        cy.get('#result').should('have.text', 'You clicked: Ok')
    })

    it('deve validar o confirm cancelado', () => {
        cy.visit('https://the-internet.herokuapp.com/javascript_alerts')

        cy.on('window:confirm', (text) => {
            expect(text).to.equal('I am a JS Confirm')
            return false
        })

        cy.contains('Click for JS Confirm').click()

        cy.get('#result').should('have.text', 'You clicked: Cancel')
    })

    it('deve validar o prompt preenchido', () => {
        cy.visit('https://the-internet.herokuapp.com/javascript_alerts')

        cy.window().then((win) => {
            cy.stub(win, 'prompt').returns('Douglas')
        })

        cy.contains('Click for JS Prompt').click()

        cy.get('#result').should('have.text', 'You entered: Douglas')
    })
})