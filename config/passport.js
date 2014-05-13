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
    // console.log(req.user.id);
    // console.log(profile);
    User.findById(req.user.id, function (err, user) {
      user.linkedin = profile.id;
      // console.log(profile);

      // user.tokens.push({kind: 'linkedin', accessToken: token});
      user.profile.name = profile._json.firstName + " " + profile._json.lastName;
      user.profile.picture = profile._json.pictureUrls.values[0];

      user.bio = profile._json.summary;
      //Clear old skills
      //We are no longer storing skills as an object. They will be stored as a formatted string.
      //Format shall be as follows:
      // only one skill listed: skill1
      // multiple skills: skill1, skill2, skill3
      user.skills = [];
      skillString = "";
      for(var i=0; i<profile._json.skills.values.length; i++) {
        if (skillString != "")
          skillString += ", ";
        skillString += profile._json.skills.values[i].skill.name;
        // userSkill = {}

        // userSkill['skill'] = profile._json.skills.values[i].skill.name
        // user.skills.push(userSkill);
      }
      user.skills.push(skillString);
      //user.interests = ;

      // Clear old education
      // We are no longer storing education as an object. Instead we will be storing it as a formatted string.
      // Format shall be as follows: schoolName - degree, fieldOfStudy (startDate - endDate)
      user.education = []; //Empty the array
      educationString = "";
      for(var i=0; i<profile._json.educations.values.length; i++) {
        if (educationString != "") //next obj
          educationString += "\n"
        educationString = profile._json.educations.values[i].schoolName
        if (profile._json.educations.values[i].degree)
          educationString += " - " + profile._json.educations.values[i].degree
        if (profile._json.educations.values[i].fieldOfStudy)
          educationString += ", " + profile._json.educations.values[i].fieldOfStudy
        if (profile._json.educations.values[i].startDate)
          educationString += " (" + profile._json.educations.values[i].startDate
        if (profile._json.educations.values[i].endDate)
          educationString += " - " + profile._json.educations.values[i].endDate + ")"
        else //need to close paren
          educationString += ")"

        //Old version code below with the object
        //userEducation = {}
        // // console.log(profile._json.educations.values[i].schoolName);
        // userEducation['schoolName'] = profile._json.educations.values[i].schoolName;
        // userEducation['fieldOfStudy'] = profile._json.educations.values[i].fieldOfStudy;
        // userEducation['startDate'] = profile._json.educations.values[i].startDate;
        // userEducation['endDate'] = profile._json.educations.values[i].endDate;
        // userEducation['degree'] = profile._json.educations.values[i].degree;
        // user.education.push(userEducation);
        // console.log("passport.js")
        // console.log(userEducation)
      }
      user.education.push(educationString);

      // Clear old positions
      // We are no longer storing the positions as an object. Instead it will be stored as a formatted string.
      // Format shall be as follows: title - company.name (startDate - endDate)
      user.positions = [];
      positionString = "";
      for(var i=0; i<profile._json.positions.values.length; i++) {
        if (positionString != "") //next obj
          positionString += "\n"
        positionString = profile._json.positions.values[i].title
        if (profile._json.positions.values[i].company.name)
          positionString += " - " + positionStringprofile._json.positions.values[i].company.name
        if (profile._json.positions.values[i].startDate)
          positionString += " (" + profile._json.positions.values[i].startDate
        if (profile._json.positions.values[i].endDate)
          positionString += " - " + profile._json.positions.values[i].endDate + ")"
        else //need to close parenthesis
          positionString += ")"

        //This is the old version
        // userPosition = {}
        // // console.log(profile._json.positions.values[i].title);
        // userPosition['title'] = profile._json.positions.values[i].title;
        // userPosition['summary'] = profile._json.positions.values[i].summary;
        // userPosition['startDate'] = profile._json.positions.values[i].startDate;
        // userPosition['endDate'] = profile._json.positions.values[i].endDate;
        // userPosition['company'] = profile._json.positions.values[i].company.name;
        // // console.log(profile._json.positions.values[i].company.name);
        // user.positions.push(userPosition);
      }
      user.positions.push(positionString);

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
