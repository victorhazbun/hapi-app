'use strict';
const fs = require('fs');

function loadCards() {
  var file = fs.readFileSync('./cards.json');
  return JSON.parse(file.toString());
}

const CardStore = {};

CardStore.cards = {};

CardStore.initialize = function() {
  CardStore.cards = loadCards();
};

module.exports = CardStore;