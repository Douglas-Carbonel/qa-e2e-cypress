describe('Carrinho', () => {
    it('Remove item do carrinho', () => {
        cy.login()

        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="shopping-cart-badge"]')
            .should('be.visible')
            .and('have.text', '1')

        cy.get('[data-test="shopping-cart-link"]').click()

        cy.get('[data-test="cart-list"]').should('be.visible')
        cy.get('[data-test="inventory-item"]').should('exist')
        cy.get('[data-test="item-quantity"]').should('have.text', '1')

        cy.get('[data-test="remove-sauce-labs-backpack"]').click()

        cy.get('[data-test="inventory-item"]').should('not.exist')
        cy.get('[data-test="shopping-cart-badge"]').should('not.exist')
    })
})