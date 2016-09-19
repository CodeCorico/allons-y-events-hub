'use strict';

module.exports = function($allonsy, $env, $done) {

  if (!$env.EVENTS_HUB || !$env.EVENTS_HUB_TARGET) {
    return $done();
  }

  function _default(name, value) {
    return typeof $env[name] != 'undefined' ? $env[name] : value;
  }

  var prompts = [],
      count = parseInt($env.EVENTS_HUB_TARGET_COUNT || 1, 10);

  for (var i = 0; i < count; i++) {
    prompts.push({
      type: 'input',
      name: 'EVENTS_HUB_TARGET_' + i,
      message: 'Connection URL (with port) #' + i + ':',
      default: _default('EVENTS_HUB_TARGET_' + i, 'http://localhost:8085')
    }, {
      type: 'input',
      name: 'EVENTS_HUB_TARGET_SECRET_' + i,
      message: 'Connection SECRET passphrase #' + i + ':',
      default: _default('EVENTS_HUB_TARGET_SECRET_' + i, '')
    });
  }

  $done(prompts);
};
