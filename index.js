'use strict';

var Hapi = require('hapi'),
server = new Hapi.Server();

server.connection({port: 3000});

server.route({
  path: '/hi',
  method: 'GET',
  handler: function(request, reply) {
    return reply('hi');
  }
});

server.start(function(){
  console.log('Listening...')
});