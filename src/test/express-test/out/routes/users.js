/*
 * /v1/users route
 */

var acl = require('../acl');
var express = require('express');
var User = require('../models/user.js');

var router = express.Router();

router.get('/', acl.can('access users'), function(req, res) {
	User.find(req.params, function(err, users) {
		if (err) {
			res.status(400).send(err);
			return;
		}
		
		var data, json = [];
		for (var i in users) {
			data = {};
			if (acl.can('read users username')) {
				data.username = users[i].username;
			}
			json.push(data);
		}
		
		res.json(json);
	});
});

router.get('/:user_id', acl.can('access users'), function(req, res) {
	User.findById(req.params.user_id, function(err, user) {
		if (err) {
			res.status(400).send(err);
			return;
		}
		
		var data = {};
		if (acl.can('read users username')) {
			data.username = user.username;
		}
		
		res.json(user);
	});
});

router.post('/', acl.can('create users'), function(req, res) {
	// create user
	var user = new User();
	if (req.body.username && req.userCan('create users username')) {
		user.username = req.body.username;
	}
	
	// save user
	user.save(function(err) {
		if (err) {
			res.status(400).send(err);
			return;
		}
		res.json({ user: user });
	});
});

module.exports = router;
