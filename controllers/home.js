var Emails = require('../models/Emails');
var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');
var Job = require('../models/Job');
var JobApplication = require('../models/JobApplication');
var async = require('async');

/**
 * GET /
 * Home page.
 */
 var url = require('url');

exports.index = function(req, res) {
  if (req.user) {
    res.redirect('/account');
  }
  else {
    res.render('home', {
      title: 'Home',
      errors: req.flash('errors'),
      success: req.flash('success')
    });
  }
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
    if (err) {
      if (err.code === 11000) {
        console.log("Duplicate email")  
      }
    }

    // console.log("success")
    req.flash('success','Successfully subscribed to updates.');
    return res.redirect('/');

  });
};


exports.admin = function (req,res) {
  if (req.user.email == "contact@athenahire.co") {
    async.parallel([
      function(callback){
        User.find({}, function(err, docs) {
          callback(null, docs);
        });
      },
      function(callback) {
        JobApplication.find({}, function(err, docs) {
          callback(null, docs);
        });
      },
      function(callback) {
        Job.find({}, function(err, docs) {
          callback(null, docs);
        });
      }
      ],
      function(err, results) {
        res.render('admin', {
          title: 'Admin Dashboard',
          "users":results[0],
          "jobApps":results[1],
          "jobs":results[2]
        });
      }
    );
  } 
  else {
    res.render('home', {
      title: 'Home',
      errors: req.flash('errors'),
      success: req.flash('success')
    });
  }
};