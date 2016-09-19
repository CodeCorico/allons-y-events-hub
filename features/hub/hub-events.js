'use strict';

module.exports = function($allonsy, $io) {

  var crypto = require('crypto'),
      _sockets = [];

  function _spliceSocket(socket) {
    for (var i = 0; i < _sockets.length; i++) {
      if (_sockets[i] == socket) {
        _sockets.splice(i, 1);

        break;
      }
    }
  }

  function _emit(message, notThisSocket) {
    notThisSocket = notThisSocket || null;

    message = typeof message == 'object' ? message : {
      event: message
    };
    message.noOwner = true;

    _sockets.forEach(function(socket) {
      if (socket == notThisSocket) {
        return;
      }

      socket.emit('!', _encrypt(JSON.stringify(message), socket.secret));
    });
  }

  function _encrypt(text, secret) {
    var cipher = crypto.createCipher('aes-256-ctr', secret);

    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  }

  function _decrypt(text, secret) {
    var decipher = crypto.createDecipher('aes-256-ctr', secret);

    return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
  }

  function _decryptMessage(message, secret) {
    if (!message || typeof message != 'string') {
      return false;
    }

    message = _decrypt(message, secret);

    try {
      message = JSON.parse(message);
    }
    catch (ex) {
      return false;
    }

    return message;
  }

  function _connectToHub(i) {
    var url = process.env['EVENTS_HUB_TARGET_' + i],
        socket = ioClient.connect(url);

    socket.secret = process.env['EVENTS_HUB_TARGET_SECRET_' + i];

    socket.on('connect', function() {
      _sockets.push(socket);

      $allonsy.outputInfo('  Connected with the Events HUB #' + i + ' (' + url + ')');

      $allonsy.sendMessage({
        event: 'create(events-hub/hub)',
        url: url
      });

      socket.emit('who', _encrypt(JSON.stringify({
        who: 'Events HUB server',
        url: url
      }), socket.secret));
    });

    socket.on('disconnect', function() {
      _spliceSocket(socket);

      $allonsy.outputWarning('  Disconnected from the Events HUB #' + i + ' (' + url + ')');

      $allonsy.sendMessage({
        event: 'delete(events-hub/hub)',
        url: url
      });
    });
  }

  $io.on('connection', function(socket) {
    socket.secret = process.env.EVENTS_HUB_SECRET;

    _sockets.push(socket);

    $allonsy.sendMessage({
      event: 'create(events-hub/client)',
      id: socket.id
    });

    socket.on('disconnect', function() {
      _spliceSocket(socket);

      $allonsy.sendMessage({
        event: 'delete(events-hub/client)',
        id: socket.id
      });
    });

    socket.on('who', function(message) {
      message = _decryptMessage(message, socket.secret);

      if (!message || !message.who || typeof message.who != 'string' || !message.url || typeof message.url != 'string') {
        return;
      }

      $allonsy.sendMessage({
        event: 'update(events-hub/client)',
        id: socket.id,
        who: message.who,
        url: message.url
      });
    });

    socket.on('!', function(message) {
      message = _decryptMessage(message, socket.secret);

      if (!message) {
        return false;
      }

      _emit(message, message.noOwner && socket || null);
    });

  });

  if (!process.env.EVENTS_HUB_TARGET || process.env.EVENTS_HUB_TARGET != 'true') {
    return;
  }

  var ioClient = require('socket.io-client'),
      count = parseInt(process.env.EVENTS_HUB_TARGET_COUNT || 1, 10);

  for (var i = 0; i < count; i++) {
    _connectToHub(i);
  }
};
