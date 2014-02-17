var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;
var User = require('../models/User');
var secrets = require('./secrets');
var _ = require('underscore');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    if(!err) done(null, user);
    else done(err, null)  ;
    // done(err, user);
  });
});

passport.use(new LocalStrategy({ usernameField: 'email' }, function(email, password, done) {
  User.findOne({ email: email }, function(err, user) {
    if (!user) return done(null, false, { message: 'Email ' + email + ' not found'});
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password.' });
      }
    });
  });
}));


passport.use(new FacebookStrategy(secrets.facebook, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findById(req.user.id, function(err, user) {
      user.facebook = profile.id;
      user.tokens.push({ kind: 'facebook', accessToken: accessToken });
      user.profile.name = user.profile.name || profile.displayName;
      user.profile.gender = user.profile.gender || profile._json.gender;
      user.profile.picture = user.profile.picture || profile._json.profile_image_url;
      user.save(function(err) {
        done(err, user);
      });
    });
  } else {
    User.findOne({ facebook: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      user.email = profile._json.email;
      user.facebook = profile.id;
      user.tokens.push({ kind: 'facebook', accessToken: accessToken });
      user.profile.name = profile.displayName;
      user.profile.gender = profile._json.gender;
      user.profile.picture = profile._json.profile_image_url;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));


passport.use(new GoogleStrategy(secrets.google, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findById(req.user.id, function(err, user) {
      user.google = profile.id;
      user.tokens.push({ kind: 'google', accessToken: accessToken });
      user.profile.name = user.profile.name || profile.displayName;
      user.profile.gender = user.profile.gender || profile._json.gender;
      user.profile.picture = user.profile.picture || profile._json.picture;
      user.save(function(err) {
        done(err, user);
      });
    });
  } else {
    User.findOne({ google: profile.id }, function(err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      user.email = profile._json.email;
      user.google = profile.id;
      user.tokens.push({ kind: 'google', accessToken: accessToken });
      user.profile.name = profile.displayName;
      user.profile.gender = profile._json.gender;
      user.profile.picture = profile._json.picture;
      user.save(function(err) {
        done(err, user);
      });
    });
  }
}));


passport.use(new LinkedInStrategy(secrets.linkedin, function(req, token, tokenSecret, profile, done) {
    console.log(req.user.id);
    console.log(profile);
    User.findById(req.user.id, function (err, user) {
      user.linkedin = profile.id;
      console.log(profile);

      //user.tokens.push({kind: 'linkedin', accessToken: tokenSecret});
      user.profile.name = profile._json.firstName + " " + profile._json.lastName;
      user.profile.picture = profile._json.pictureUrl;
      user.bio = profile._json.summary;
      for(var i=0; i<profile._json.skills.values.length; i++) {
        user.skills.push(profile._json.skills.values[i].skill.name);
      }
      //user.interests = ;
      for(var i=0; i<profile._json.educations.values.length; i++) {
        userEducation = {}
        console.log(profile._json.educations.values[i].schoolName);
        userEducation['schoolName'] = profile._json.educations.values[i].schoolName;
        userEducation['fieldOfStudy'] = profile._json.educations.values[i].fieldOfStudy;
        userEducation['startDate'] = profile._json.educations.values[i].startDate;
        userEducation['endDate'] = profile._json.educations.values[i].endDate;
        userEducation['degree'] = profile._json.educations.values[i].degree;
        user.education.push(userEducation);
      }

      for(var i=0; i<profile._json.positions.values.length; i++) {
        userPosition = {}
        console.log(profile._json.positions.values[i].title);
        userPosition['title'] = profile._json.positions.values[i].title
        userPosition['summary'] = profile._json.positions.values[i].summary
        userPosition['startDate'] = profile._json.positions.values[i].startDate
        userPosition['endDate'] = profile._json.positions.values[i].endDate
        user.positions.push(userPosition);
      }

      user.linkedinURL = profile._json.publicProfileUrl;

      user.save(function(err) {
        done(err, user);
      });
    });
}));


exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

exports.isAuthorized = function(req, res, next) {
  var provider = req.path.split('/').slice(-1)[0];
  if (_.findWhere(req.user.tokens, { kind: provider })) next();
  else res.redirect('/auth/' + provider);
};
