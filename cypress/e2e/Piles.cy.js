describe('Deck of Cards API - Pile Operations', () => {
  const baseUrl = 'https://deckofcardsapi.com/api/deck';
  let deckId;
  let pileCards = [];

  beforeEach(() => {
    // Create a new deck before each test
    cy.request('GET', `${baseUrl}/new/shuffle/`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('deck_id');
        deckId = response.body.deck_id;
        
        // Draw some cards to use for pile operations
        return cy.request('GET', `${baseUrl}/${deckId}/draw/?count=6`);
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.cards).to.have.length(6);
        pileCards = response.body.cards.map(card => card.code);
      });
  });

  it('should create a pile successfully', () => {
    const pileName = 'test_pile';
    const cardsForPile = pileCards.slice(0, 3).join(',');

    cy.request('GET', `${baseUrl}/${deckId}/pile/${pileName}/add/?cards=${cardsForPile}`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('deck_id', deckId);
        expect(response.body).to.have.property('remaining');
        expect(response.body.piles).to.have.property(pileName);
        expect(response.body.piles[pileName]).to.have.property('remaining', 3);
      });
  });

  it('should draw 2 cards from a pile', () => {
    const pileName = 'draw_pile';
    const cardsForPile = pileCards.slice(0, 4).join(',');

    // First create a pile with 4 cards
    cy.request('GET', `${baseUrl}/${deckId}/pile/${pileName}/add/?cards=${cardsForPile}`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.piles[pileName].remaining).to.eq(4);

        // Then draw 2 cards from the pile
        return cy.request('GET', `${baseUrl}/${deckId}/pile/${pileName}/draw/?count=2`);
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('deck_id', deckId);
        expect(response.body).to.have.property('cards');
        expect(response.body.cards).to.have.length(2);
        expect(response.body.piles[pileName]).to.have.property('remaining', 2);

        // Verify each drawn card has required properties
        response.body.cards.forEach(card => {
          expect(card).to.have.property('code');
          expect(card).to.have.property('image');
          expect(card).to.have.property('value');
          expect(card).to.have.property('suit');
        });
      });
  });

  it('should shuffle a pile successfully', () => {
    const pileName = 'shuffle_pile';
    const cardsForPile = pileCards.join(',');

    // First create a pile with all available cards
    cy.request('GET', `${baseUrl}/${deckId}/pile/${pileName}/add/?cards=${cardsForPile}`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.piles[pileName].remaining).to.eq(6);

        // Then shuffle the pile
        return cy.request('GET', `${baseUrl}/${deckId}/pile/${pileName}/shuffle/`);
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body).to.have.property('deck_id', deckId);
        expect(response.body).to.have.property('shuffled', true);
        expect(response.body.piles).to.have.property(pileName);
        expect(response.body.piles[pileName]).to.have.property('remaining', 6);
      });
  });
});