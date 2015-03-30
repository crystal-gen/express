/*
 * express-test
 * express test
 */
var acl = require('./acl');
var bodyParser = require('body-parser');
var express = require('express');
var expressSession = require('express-session');
var fs = require('fs');
var mongoose = require('mongoose');
var multer = require('multer');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/crystal-alpha');

var app = express();

app.use(expressSession({secret: 'yourothersecretcode', saveUninitialized: true, resave: true}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(multer({ dest: './tmp/'}))

app.use(function(req, res, next) {
	res.on('finish', function() {
		for (var i in req.files) {
			fs.unlink(req.files[i].path);
		}
	});
	next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(acl.middleware());

app.use(function (req, res, next) {
	if (!req.user) {
		req.user = {
			role: 'guest'
		};
	}
	next();
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new BasicStrategy(function(username, password, done) {
	User.findOne({ username: username }, function (err, user) {
		if (err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, { message: 'Incorrect username.' });
		}
		user.validPassword(password, function(err, matches) {
			if (!matches) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			
			return done(null, user);
		});
	});
}));


// load routes
app.use(
	'/users',
	require('./routes/users.js')
);

var server = app.listen(8080, function () {
	
	var host = server.address().address
	var port = server.address().port
	
	console.log('Example app listening at http://%s:%s', host, port)
	
});
