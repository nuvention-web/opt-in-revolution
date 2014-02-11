/**
 * GET /
 * Home page.
 */
 var url = require('url');

exports.index = function(req, res) {
  res.render('home', {
    title: 'Home'
  });
};

exports.about = function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var userType = query.view;
	// console.log(query);
	// console.log(userType);
	res.render('about', {
		title: 'About',
		view: userType
	});
};


exports.team = function(req, res) {
  res.render('team', {
    title: 'Team'
  });
};

exports.empower = function(req, res) {
  res.render('empower', {
    title: 'Empower'
  });
};


exports.engage = function(req, res) {
  res.render('engage', {
    title: 'Engage'
  });
};
