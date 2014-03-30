var Hapi = require('hapi');
var mongoose = require('mongoose');
var Check = require('./lib/models/Check');

// Create a server with a port
var server = Hapi.createServer('localhost', 8000);

// install plugins
server.pack.require('furball', function(err) {
    if (err) {
        console.log('Failed to load furball plugin');
    }
});

// route configs
var status = {
    handler: function (request, reply) {
        reply({ status: 'ok' });
    }
}

var writeCheck = {
    handler: function (request, reply) {
        var check = new Check({
            checkNumber: request.payload.number,
            checkDate: request.payload.date,
            checkAmount: request.payload.amount,
            checkPayee: request.payload.payee,
            checkMemo: request.payload.memo
        });
        check.save(function (err, objToSave) {
            if (err) { 
                console.log("error: " + err);
                return reply.error(err);
            }
        });
        reply().created('/checks/' + check._id);
    }
}

var findCheck = {
    cache: { expiresIn: 5000 },
    handler: function (request, reply) {
        Check.findOne({ checkNumber: request.params.number })
            .select('checkNumber checkDate checkPayee checkAmount checkMemo')
            .exec(function (err, check) {
                if (err) {
                    console.log("error: " + err); 
                    return reply.error(err);
                }
                reply(check);
            });
    }
}

var findAllChecks = {
    cache: { expiresIn: 6000 },
    handler: function (request, reply) {
        Check.find()
            .select('checkNumber checkDate checkPayee checkAmount checkMemo')
            .exec(function (err, checks) {
                if (err) {
                    console.log("error: " + err);
                    return reply.error(err);
                }
                reply(checks);
            });
    }
}

// Add the routes
server.route([
    {
        method: 'GET',
        path: '/status',
        config: status
    }, {
        method: 'POST',
        path: '/checks',
        config: writeCheck                    
    }, {
        method: 'GET',
        path: '/checks/{number}',
        config: findCheck            
    }, {
        method: 'GET',
        path: '/checks',
        config: findAllChecks
    }
]);

// Start the server
mongoose.connect('mongodb://localhost/checks');
server.start();
