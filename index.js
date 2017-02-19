'use strict';
const Hapi = require('hapi');
const Inert = require('inert');
const Path = require('path');
const CardStore = require('./lib/card-store');

const server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});

CardStore.initialize();

server.connection({port: 3000});

server.register(require('vision'), (err) => {
  if (err) {
    throw err;
  }
  server.views({
    engines: { html: require('handlebars') },
    path: __dirname + '/public/templates'
  });


  server.route(require('./lib/routes'));
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