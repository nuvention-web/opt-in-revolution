var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');
var fs = require('fs');
/**
 * GET /login
 * Login page.
 */

exports.getLogin = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/login', {
    title: 'Login',
    errors: req.flash('errors')
  });
};

/**
 * GET /signup
 * Signup page.
 */

exports.getSignup = function(req, res) {
  if (req.user) return res.redirect('/');
  res.render('account/signup', {
    title: 'Create Account',
    errors: req.flash('errors')
  });
};

/**
 * GET /account
 * Profile page.
 */

exports.getAccount = function(req, res) {
  res.render('account/profile', {
    title: 'Account Management',
    success: req.flash('success'),
    error: req.flash('error'),
    errors: req.flash('errors'),
    signUp: req.flash('signUp'),
    companyError: req.flash('companyError'),
  });
};

/**
 * POST /login
 * Sign in using email and password.
 * @param {string} email
 * @param {string} password
 */

exports.postLogin = function(req, res, next) {
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);

    if (!user) {
      req.flash('errors', { msg: info.message });
      return res.redirect('/login');
    }

    req.logIn(user, function(err) {
      if (err) return next(err);
      return res.redirect('/employ');
    });
  })(req, res, next);
};

/**
 * POST /signup
 * Create a new local account.
 * @param {string} email
 * @param {string} password
 */

exports.postSignup = function(req, res, next) {
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('usertype', 'Select your account type').notEmpty()
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  console.log(errors);
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password,
    userType: req.body.usertype
  });

  user.save(function(err) {
    if (err) {
      if (err.code === 11000) {
        req.flash('errors', { msg: 'User already exists.' });
      }
      return res.redirect('/signup');
    }
    req.logIn(user, function(err) {
      if (err) return next(err);
      res.redirect('/employ');
    });
  });
};

exports.postResumeProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if(err) return next(err);
    user.resume.name = req.files.resume.originalFilename;
    user.resume.path = req.files.resume.path;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Resume uploaded.')
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);
    var errors = [];
    var fileGood = true;
    var acceptableFileTypes = ['application/pdf'];//, 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if(req.files.resume.size > (500 * 1024)) {
      errors.push({param:"size", msg:"File size must be less than 500 kb.", value: req.files.resume.size});
      fileGood = false;
    }
    if(acceptableFileTypes.indexOf(req.files.resume.type)==-1) {
      errors.push({param:"type", "msg":"Resume file type must be pdf.", value: req.files.resume.type});
      fileGood = false;
    }
    if (errors.length>0) {
      req.flash('errors', errors);
    }
    // console.log(req.files.resume);
    user.profile.name = req.body.name || '';
    user.profile.email = req.body.email || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.bio = req.body.bio || '';
    user.education = req.body.education || '';
    user.positions = req.body.positions || '';
    user.skills = req.body.skills || '';
    user.yearsOfExperience = req.body.yearsOfExperience || '';
    user.desiredHoursPerWeek = req.body.desiredHoursPerWeek || '';

    user.company.companyName = req.body.companyName || '';
    user.company.companyDescription = req.body.companyDescription || '';
    user.desiredHoursPerWeek = req.body.desiredHoursPerWeek || '';
    user.desiredProjectLength = req.body.desiredProjectLength || '';
    user.communicationPreferences = req.body.communicationPreferences || '';
    user.checkinFrequencyPreference = req.body.checkinFrequency || '';
    user.industryPreference = req.body.industryPreference || '';
    user.jobFunctionPreference = req.body.jobFunctionPreference || '';
    //Need to add company image
    if (fileGood) {
      fs.unlink(user.resume.path);
      user.resume.name = req.files.resume.originalFilename;
      user.resume.path = req.files.resume.path;  
    }
    else {
      fs.unlink(req.files.resume.path);
    }

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Profile information updated.');
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/password
 * Update current password.
 * @param {string} password
 */

exports.postUpdatePassword = function(req, res, next) {
  if (!req.body.password) {
    req.flash('error', 'Password cannot be blank.');
    return res.redirect('/account');
  }

  if (req.body.password !== req.body.confirmPassword) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/account');
  }

  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user.password = req.body.password;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Password has been changed.');
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 * @param {string} id
 */

exports.postDeleteAccount = function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) return next(err);
    req.logout();
    res.redirect('/');
  });
};


exports.viewCandidates = function(req, res) {
  User.find({userType: 'mom'}, function(e, moms) {
    res.render('viewcandidates', {
      "candidates": moms,
      title: "View Candidates",
    }); 
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth2 provider from the current user.
 * @param {string} provider
 * @param {string} id
 */

exports.getOauthUnlink = function(req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function(err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function(token) { return token.kind === provider; });

    user.save(function(err) {
      if (err) return next(err);
      res.redirect('/account');
    });
  });
};

/**
 * GET /logout
 * Log out.
 */

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};