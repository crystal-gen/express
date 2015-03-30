var ConnectRoles = require('connect-roles');

var user = new ConnectRoles({
	failureHandler: function (req, res, action) {
		res.status(req.isAuthenticated() ? 403 : 401);
		res.send();
	}
});

user.use('publish', function(req) {
	if (req.user && req.user.role === 'user') {
		return true;
	}
});;


user.use(function (req) {
	if (req.user && req.user.role === 'admin') {
		return true;
	}
});

module.exports = user;
