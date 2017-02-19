'use strict';

var Handlers = require('./handlers.js');


const Routes = [
  {
    path: '/',
    method: 'GET',
    handler: {
      file: 'templates/index.html'
    }
  },
  {
    method: 'GET',
    path: '/assets/{path*}',
    handler: {
      directory: {
          path: '.',
          redirectToSlash: true,
          index: true
      }
    }
  },
  {
    path: '/cards/new',
    method: ['GET', 'POST'],
    handler: Handlers.newCardHandler
  },
  {
    path: '/cards',
    method: 'GET',
    handler: Handlers.cardsHandler
  },
  {
    path: '/cards/{id}',
    method: 'DELETE',
    handler: Handlers.deleteCardHandler
  }
];

module.exports = Routes;