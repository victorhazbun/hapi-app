'use strict';

const uuid = require('uuid');
const fs = require('fs');
const Joi = require('joi');
const Boom = require('boom');
const CardStore = require('./card-store');

function saveCard(card) {
  let id = uuid.v1();
  card.id = id;
  CardStore.cards[id] = card;
}

function mapImages() {
  return fs.readdirSync('./public/images/cards');
}

const Handlers = {};

var cardSchema = Joi.object().keys({
  name: Joi.string().min(3).max(50).required(),
  recipientEmail: Joi.string().email().required(),
  senderName: Joi.string().min(3).max(50).required(),
  senderEmail: Joi.string().email().required(),
  cardImage: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
});

Handlers.newCardHandler = function(request, reply) {
  if (request.method === 'get') {
    reply.view('new', { 'card_images': mapImages() });
  } else {
    Joi.validate(request.payload, cardSchema, function(err, val) {
      if (err) {
        return reply(Boom.badRequest(err.details[0].message));
      }
      var card = {
        name: val.name,
        recipientEmail: val.recipientEmail,
        senderName: val.senderName,
        senderEmail: val.senderEmail,
        cardImage: val.cardImage
      };
      saveCard(card);
      reply.redirect('/cards');
    });

  }
};

Handlers.cardsHandler = function(request, reply) {
  reply.view('cards', {cards: CardStore.cards});
};

Handlers.deleteCardHandler = function(request, reply) {
  delete CardStore.cards[request.params.id];
  reply();
};

module.exports = Handlers;