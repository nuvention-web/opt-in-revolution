var Emails = require('../models/Emails');
/**
 * GET /
 * Home page.
 */
 var url = require('url');

exports.index = function(req, res) {

  res.render('home', {
    title: 'Home',
    errors: req.flash('errors'),
    success: req.flash('success')
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

exports.subscribeEmailPost = function(req,res) {

  req.assert('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }

  var email = new Emails({
    email: req.body.email
  });

  email.save(function(err) {
    // console.log("saving....");
    if (err) {
      if (err.code === 11000) {
        console.log("Duplicate email")  
      }
      // Do this because we can just ignore duplicate emails, db won't add it anyways
      req.flash('success','Successfully subscribed to updates.');
      return res.redirect('/');
    }

    // console.log("success")
    req.flash('success','Successfully subscribed to updates.');
    return res.redirect('/');

  });
};
