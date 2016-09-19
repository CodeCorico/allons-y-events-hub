'use strict';

module.exports = function($allonsy, $done) {
  var path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser'),
      server = express();

  DependencyInjection.service('$express', function() {
    return express;
  });

  DependencyInjection.service('$server', function() {
    return server;
  });

  server.use(bodyParser.urlencoded({
    extended: true
  }));

  server.set('port', parseInt(process.env.EVENTS_HUB_PORT || 8085, 10));

  var http = require('http').Server(server);

  DependencyInjection.service('$http', function() {
    return http;
  });

  var io = require('socket.io')(http);

  DependencyInjection.service('$io', function() {
    return io;
  });

  DependencyInjection.injector.controller.invoke(null, require(path.resolve(__dirname, 'hub-events.js')));

  http.listen(server.get('port'), function() {
    $allonsy.outputInfo('► EVENTS HUB SERVER IS RUNNING ON :' + server.get('port'));

    $allonsy.sendMessage({
      event: 'update(events-hub/server)',
      port: server.get('port')
    });
  });

  $done();
};
