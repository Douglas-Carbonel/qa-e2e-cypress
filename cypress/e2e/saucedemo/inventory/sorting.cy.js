describe('Ordenação de produtos - SauceDemo', () => {
  it('deve validar as ordenações por nome e preço', () => {
    cy.login()

    const getProductNames = () =>
      cy.get('.inventory_item_name').then(($items) => {
        return [...$items].map((item) => item.innerText.trim())
      })

    const getProductPrices = () =>
      cy.get('.inventory_item_price').then(($prices) => {
        return [...$prices].map((price) =>
          Number(price.innerText.replace('$', '').trim())
        )
      })

    cy.get('[data-test="product-sort-container"]').select('az')
    cy.get('[data-test="active-option"]').should('have.text', 'Name (A to Z)')
    getProductNames().then((names) => {
      expect(names).to.deep.equal([...names].sort((a, b) => a.localeCompare(b)))
    })

    cy.get('[data-test="product-sort-container"]').select('za')
    cy.get('[data-test="active-option"]').should('have.text', 'Name (Z to A)')
    getProductNames().then((names) => {
      expect(names).to.deep.equal([...names].sort((a, b) => b.localeCompare(a)))
    })

    cy.get('[data-test="product-sort-container"]').select('lohi')
    cy.get('[data-test="active-option"]').should('have.text', 'Price (low to high)')
    getProductPrices().then((prices) => {
      expect(prices).to.deep.equal([...prices].sort((a, b) => a - b))
    })

    cy.get('[data-test="product-sort-container"]').select('hilo')
    cy.get('[data-test="active-option"]').should('have.text', 'Price (high to low)')
    getProductPrices().then((prices) => {
      expect(prices).to.deep.equal([...prices].sort((a, b) => b - a))
    })
  })
})