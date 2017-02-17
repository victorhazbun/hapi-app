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
    reply.view('new');
  } else {
    var card = {
      name: request.payload.name,
      recipientEmail: request.payload.recipientEmail,
      senderName: request.payload.senderName,
      senderEmail: request.payload.senderEmail,
      cardImage: request.payload.cardImage
    };
    saveCard(card);
    reply.redirect('/cards');
  }
}

function cardsHandler(request, reply) {
  reply.view('cards');
}

function deleteCardHandler(request, reply) {
  delete cards[request.params.id];
}

server.connection({port: 3000});

server.register(require('vision'), (err) => {
  if (err) {
    throw err;
  }

  server.views({
    engines: { html: require('handlebars') },
    path: __dirname + '/public/templates'
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

});

server.register(Inert, () => {});

server.ext('onRequest', (request, reply) => {
  console.log(`Request received: ${request.path}`);
  reply.continue();
});


server.start((err) => {
  if (err) { throw err; }
  console.log('Server running at:', server.info.uri);
});