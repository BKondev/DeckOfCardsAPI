describe('Deck of Cards API tests', () => {
  let deckId;

  beforeEach(() => {
    cy.request('GET', 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then((response) => {
        expect(response.status).to.eq(200);
        deckId = response.body.deck_id;
      });
  });

  it('Draw cards from the deck', () => {
    cy.request('GET', `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.cards).to.have.length(2);
        cy.log('Drawn cards:', response.body.cards);
      });
  });

  it('Shuffle the deck', () => {
    cy.request('GET', `https://deckofcardsapi.com/api/deck/${deckId}/shuffle/`)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.shuffled).to.be.true;
      });
  });

  it('Return cards to the deck', () => {
    cy.request('GET', `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`)
      .then((drawResponse) => {
        expect(drawResponse.status).to.eq(200);
        const cardsCodes = drawResponse.body.cards.map(card => card.code).join(',');

        cy.request('GET', `https://deckofcardsapi.com/api/deck/${deckId}/return/?cards=${cardsCodes}`)
          .then((returnResponse) => {
            expect(returnResponse.status).to.eq(200);
            expect(returnResponse.body.success).to.be.true;
          });
      });
  });
});