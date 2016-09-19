module.exports = function() {
  'use strict';

  DependencyInjection.service('$EventsHubService', function() {

    return new (function $EventsHubService() {

      var _processes = {};

      this.hubServer = function(p, port) {
        if (typeof port == 'undefined') {
          return _processes[p.id];
        }

        _processes[p.id] = _processes[p.id] || {};
        _processes[p.id].port = port;

        return _processes[p.id];
      };

      this.hubConnectionHub = function(p, url) {
        if (!_processes[p.id]) {
          return;
        }

        _processes[p.id].hubs = _processes[p.id].hubs || [];
        _processes[p.id].hubs.push(url);
      };

      this.hubDisconnectionHub = function(p, url) {
        if (!_processes[p.id]) {
          return;
        }

        _processes[p.id].hubs = _processes[p.id].hubs || [];

        var index = _processes[p.id].hubs.indexOf(url);

        if (index > -1) {
          _processes[p.id].hubs.splice(index, 1);
        }
      };

      this.hubConnectionClient = function(p, id) {
        if (!_processes[p.id]) {
          return;
        }

        _processes[p.id].clients = _processes[p.id].clients || {};
        _processes[p.id].clients[id] = {
          who: 'Unknown client',
          url: ''
        };
      };

      this.hubUpdateClient = function(p, id, who, url) {
        if (!_processes[p.id]) {
          return;
        }

        _processes[p.id].clients = _processes[p.id].clients || {};

        if (!_processes[p.id].clients[id]) {
          return;
        }

        _processes[p.id].clients[id].who = who;
        _processes[p.id].clients[id].url = url;
      };

      this.hubDisconnectionClient = function(p, id) {
        if (!_processes[p.id]) {
          return;
        }

        _processes[p.id].clients = _processes[p.id].clients || {};
        delete _processes[p.id].clients[id];
      };

    })();
  });

};
