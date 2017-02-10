'use strict';

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

server.start((err) => {

  if (err) {
      throw err;
  }

  console.log('Server running at:', server.info.uri);
});