var Hapi = require('hapi');

// Create a server with a port
var server = Hapi.createServer('localhost', 8000);

// Add a top level handler
var status = function (request, reply) {
    reply({ status: 'ok'});
};

// Add a handler in config
var user = {
    cache: { expiresIn: 5000 },
    handler: function (request, reply) {
        reply({ name: 'John' });
    }
}

// Add the routes
server.route([
    {
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply('hello world');
        }
    }, {
        method: 'GET',
        path: '/hello/{name}',
        handler: function (request, reply) {
            reply('hello ' + request.params.name);
        }
    }, {
        method: 'GET',
        path: '/status',
        handler: status
    }, {
        method: 'GET',
        path: '/user',
        config: user
    }
]);

// Start the server
server.start();
