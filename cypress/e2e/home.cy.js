describe('Home Page', () => {

  const stubRequest = (url, code, fixture) => {
    return cy.intercept('GET', `https://stretch-api.onrender.com/api/v1${url}`, {
      statusCode: code,
      fixture: fixture
    });
  }

  beforeEach(() => {
    stubRequest('/quotes', 200, 'quotes').as('getQuotes')
    stubRequest('/images', 200, 'images').as('getImages')
    stubRequest('/posters', 200, 'posters').as('getPosters')
    cy.visit('http://localhost:3000')
  })

  it('Should display title and buttons to generate, view favorites, and create posters', () => {
    cy.wait('@getQuotes').wait('@getImages').wait('@getPosters').then((interception) => {
      cy.get('.navbar').contains('h1', 'humor me')
        .get('.nav-buttons').children().should('have.length', 3)
        .get('.nav-buttons').children().first().should('have.text', '😄 generate')
        .get('.nav-buttons').children().eq(1).should('have.text', '💛 favorites')
        .get('.nav-buttons').children().last().should('have.text', '✏️ create')
    })
  })

  it('Should display two quote generators that take the user to their respective routes', () => {
    cy.wait('@getQuotes').wait('@getImages').wait('@getPosters').then((interception) => {
      cy.get('.home-page').children().should('have.length', 2)
        .get('.selector').first().contains('h3', 'wholesome quote generator')
        .get('.selector').first().contains('p', '🥹')
        .get('#wholesome').should('have.text', 'click here!').click()
        .url().should('eq', 'http://localhost:3000/poster/wholesome')
        .get('.navbar').find('h1').click()
        .get('.selector').last().contains('h3', 'chaotic quote generator')
        .get('.selector').last().contains('p', '😈')
        .get('#chaotic').should('have.text', 'click here!').click()
        .url().should('eq', 'http://localhost:3000/poster/chaotic')
    })
  })

  it('Should click on nav buttons and take the user to their respective routes', () => {
    cy.wait('@getQuotes').wait('@getImages').wait('@getPosters').then((interception) => {
      cy.get('.nav-buttons').children().last().click()
        .url().should('eq', 'http://localhost:3000/create')
        .get('.nav-buttons').children().first().click()
        .url().should('eq', 'http://localhost:3000/')
        .get('.nav-buttons').children().eq(1).click()
        .url().should('eq', 'http://localhost:3000/favorites')
        .get('.navbar').find('h1').click()
        .url().should('eq', 'http://localhost:3000/')
    })
  })

  it('Should handle 404 errors and navigate the user back to the home page', () => {
    cy.wait('@getQuotes').wait('@getImages').wait('@getPosters').then((interception) => {
      cy.visit('http://localhost:3000/error')
        .get('.error-message').should('have.text', "🤕  Uh-oh... There's been an error  🤕")
        .get('#error-home-button').should('have.text', '😄 go home').click()
        .url().should('eq', 'http://localhost:3000/')
    })
  })

  it('Should handle 500 level errors', () => {
    stubRequest('/quotes', 500, 'quotes').as('dropQuotes')
    stubRequest('/images', 500, 'images').as('dropImages')
    stubRequest('/posters', 500, 'posters').as('dropPosters')
    cy.wait('@dropQuotes').wait('@dropImages').wait('@dropPosters').then((interception) => {
      cy.get('.error-message').should('have.text', "🤕  Uh-oh... There's been an error  🤕")
        .get('#error-home-button').should('have.text', '😄 go home')
    })
  })
})