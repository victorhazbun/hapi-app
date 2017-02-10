'use strict';

const uuid = require('uuid');
const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

let cards = {};

function saveCard(card) {
  let id = uuid.v1();
  card.id = id;
  cards[id] = card;
}

function newCardHandler(request, reply) {
  if (request.method === 'get') {
    reply.file('templates/new.html');
  } else {
    var card = {
      name: request.payload.name,
      recipientEmail: request.payload.recipientEmail,
      senderName: request.payload.senderName,
      senderEmail: request.payload.senderEmail,
      cardImage: request.payload.cardImage
    };
    saveCard(card);
    console.log(cards);
    reply.redirect('/cards');
  }
}

function cardsHandler(request, reply) {
  reply.file('templates/cards.html');
}

function deleteCardHandler(request, reply) {
  delete cards[request.params.id];
  console.log(cards);
}

server.connection({port: 3000});

server.register(Inert, () => {});

server.ext('onRequest', (request, reply) => {
  console.log(`Request received: ${request.path}`);
  reply.continue();
});

server.route({
  path: '/',
  method: 'GET',
  handler: {
    file: 'templates/index.html'
  }
});

server.route({
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
          path: '.',
          redirectToSlash: true,
          index: true
      }
    }
});

server.route({
  path: '/cards/new',
  method: ['GET', 'POST'],
  handler: newCardHandler
});

server.route({
  path: '/cards',
  method: 'GET',
  handler: cardsHandler
});

server.route({
  path: '/cards/{id}',
  method: 'DELETE',
  handler: deleteCardHandler
});


server.start((err) => {
  if (err) { throw err; }
  console.log('Server running at:', server.info.uri);
});