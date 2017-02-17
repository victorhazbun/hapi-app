'use strict';

const uuid = require('uuid');
const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const fs = require('fs');
const Joi = require('joi');
const Boom = require('boom');
const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});

var cardSchema = Joi.object().keys({
  name: Joi.string().min(3).max(50).required(),
  recipientEmail: Joi.string().email().required(),
  senderName: Joi.string().min(3).max(50).required(),
  senderEmail: Joi.string().email().required(),
  cardImage: Joi.string().regex(/.+\.(jpg|bmp|png|gif)\b/).required()
});

function loadCards() {
  var file = fs.readFileSync('./cards.json');
  return JSON.parse(file.toString());
}

function mapImages() {
  return fs.readdirSync('./public/images/cards');
}

let cards = loadCards();

function saveCard(card) {
  let id = uuid.v1();
  card.id = id;
  cards[id] = card;
}

function newCardHandler(request, reply) {
  if (request.method === 'get') {
    reply.view('new', { card_images: mapImages() });
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
}

function cardsHandler(request, reply) {
  reply.view('cards', {cards: cards});
}

function deleteCardHandler(request, reply) {
  delete cards[request.params.id];
  reply();
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

server.register({
  register: require('good'),
  options: {
    ops: {
      interval: 5000
    },
    reporters: {
      processReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ ops: '*' }]
      }, {
        module: 'good-squeeze',
        name: 'SafeJson'
      }, {
        module: 'good-file',
        args: ['./logs/process.log']
      }],
      responseReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*' }]
      }, {
        module: 'good-squeeze',
        name: 'SafeJson'
      }, {
        module: 'good-file',
        args: ['./logs/response.log']
      }],
      errorReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ error: '*' }]
      }, {
        module: 'good-squeeze',
        name: 'SafeJson'
      }, {
        module: 'good-file',
        args: ['./logs/error.log']
      }]
    }
  }
}, function(err){
  console.log(err);
});

server.ext('onPreResponse', (request, reply) => {
  if (request.response.isBoom) {
    return reply.view('error', request.response);
  }
  reply.continue();
});

server.start((err) => {
  if (err) { throw err; }
  console.log('Server running at:', server.info.uri);
});