'use strict';

var path = require('path');

module.exports = {
  bootstrap: function($allonsy, $options, $done) {
    if (process.env.EVENTS_HUB && process.env.EVENTS_HUB == 'true' && $options.owner == 'start') {
      require(path.resolve(__dirname, 'models/hub-service-back.js'))();

      var $EventsHubService = DependencyInjection.injector.controller.get('$EventsHubService');

      $allonsy.on('message', function(args) {
        if (args.event == 'update(events-hub/server)') {
          $EventsHubService.hubServer(args.p, args.port);
        }
        else if (args.event == 'create(events-hub/hub)') {
          $EventsHubService.hubConnectionHub(args.p, args.url);
        }
        else if (args.event == 'delete(events-hub/hub)') {
          $EventsHubService.hubDisconnectionHub(args.p, args.url);
        }
        else if (args.event == 'create(events-hub/client)') {
          $EventsHubService.hubConnectionClient(args.p, args.id);
        }
        else if (args.event == 'update(events-hub/client)') {
          $EventsHubService.hubUpdateClient(args.p, args.id, args.who, args.url);
        }
        else if (args.event == 'delete(events-hub/client)') {
          $EventsHubService.hubDisconnectionClient(args.p, args.id);
        }
      });
    }

    $done();
  },
  liveCommands: process.env.EVENTS_HUB && process.env.EVENTS_HUB == 'true' && [{
    commands: 'hub',
    description: 'output the hub',
    action: require(path.resolve(__dirname, 'hub-live-commands.js'))
  }] || null
};
