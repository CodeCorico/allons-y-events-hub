'use strict';

var path = require('path');

module.exports = {
  name: 'Allons-y Events HUB',
  enabled: process.env.EVENTS_HUB && process.env.EVENTS_HUB == 'true' || false,
  fork: true,
  forkMaxRestarts: parseInt(process.env.EVENTS_HUB_RESTARTS || 1, 10),
  module: require(path.resolve(__dirname, 'hub-server.js'))
};
