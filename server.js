// frameworks
var Hapi = require('hapi');
var mongoose = require('mongoose');
var BasicStrategy = require('passport-http').BasicStrategy;

// mongoose models
var Check = require('./lib/models/Check');
var User = require('./lib/models/User');

// plugins config
var plugins = {
    furball: { },
    yar: {
        cookieOptions: {
            password: "secret",
            isSecure: false
        }
    },
    travelogue: {
        hostname: 'localhost',
        port: 8000
    }
}



// routes config
var status = {
    auth: false,
    handler: function (request, reply) {
        reply({ status: 'ok' });
    }
}

var writeCheck = {
    auth: false,
    handler: function (request, reply) {
        Passport.authenticate('basic', {session: false })(request, reply, function() {
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
        });
    }
}


var findCheck = {
    auth: false,
    cache: { expiresIn: 5000 },
    handler: function (request, reply) {
        Passport.authenticate('basic', {session: false })(request, reply, function() {
            Check.findOne({ checkNumber: request.params.number })
                .select('checkNumber checkDate checkPayee checkAmount checkMemo')
                .exec(function (err, check) {
                    if (err) {
                        console.log("error: " + err); 
                        return reply.error(err);
                    }
                    reply(check);
                });
        });
    }
}

var findAllChecks = {
    auth: false,
    cache: { expiresIn: 6000 },
    handler: function (request, reply) {
        Passport.authenticate('basic', { session: false })(request, reply, function () {
            Check.find()
                .select('checkNumber checkDate checkPayee checkAmount checkMemo')
                .exec(function (err, checks) {
                    if (err) {
                        console.log("error: " + err);
                        return reply.error(err);
                    }
                    reply(checks);
                });
        });
    }
}

// Create a server with a port
var server = Hapi.createServer('localhost', 8000);

// install plugins
server.pack.require(plugins, function(err) {
    if (err) {
        console.log("error loading plugins: " + err);
        throw err;
    }
});

// auth config
server.auth.strategy('passport', 'passport');

var Passport = server.plugins.travelogue.passport;
Passport.use(new BasicStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            if (!user.password === password) { return done(null, false); }
            return done(null, user);
        });
    }
));

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
server.start(function() {
    Passport.initialize();
    console.log('server started on port: ', server.info.port);
    console.log('using hapi plugins: ', server.plugins.furball.plugins(server));
});
