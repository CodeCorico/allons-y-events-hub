'use strict';

module.exports = function($allonsy) {
  $allonsy.outputInfo('► hub:\n');

  var path = require('path');

  require(path.resolve(__dirname, 'models/hub-service-back.js'))();

  var $EventsHubService = DependencyInjection.injector.controller.get('$EventsHubService'),
      child = $allonsy.childByName('Allons-y Events HUB');

  if (!child || !child.processes || !child.processes.length) {
    $allonsy.outputInfo('  No Events HUB server started');
  }

  child.processes.forEach(function(p) {
    var serverData = $EventsHubService.hubServer(p) || {
          port: '?'
        },
        hubs = serverData.hubs || [],
        clients = serverData.clients || {};

    $allonsy.output('  ■ [' + $allonsy.textInfo(p.name) + ']: ' + $allonsy.textWarning(':' + serverData.port), '\n');

    hubs.forEach(function(hub) {
      $allonsy.output('    ∙ [' + $allonsy.textInfo('Events HUB server') + '] linked to: ' + $allonsy.textWarning(hub), '\n');
    });

    Object.keys(clients).forEach(function(id) {
      $allonsy.output('    ∙ [' + $allonsy.textInfo(clients[id].who) + '] linked from: ' + $allonsy.textWarning(clients[id].url), '\n');
    });
  });
};
