describe('Inventário', () => {
    it('deve abrir o detalhe do mesmo produto ao clicar na imagem', () => {
        cy.login()

        cy.get('.inventory_item_name')
            .first()
            .invoke('text')
            .then((selectedText) => {
                const selectedProductName = selectedText.trim()

                cy.get('.inventory_item_img a').first().click()

                cy.get('[data-test="inventory-item-name"]')
                    .should('be.visible')
                    .invoke('text')
                    .then((detailText) => {
                        expect(detailText.trim()).to.equal(selectedProductName)
                    })

                cy.url().should('include', '/inventory-item.html')
                cy.url().should('match', /id=\d+/)
            })
    })
})