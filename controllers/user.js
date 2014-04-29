var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');
var Job = require('../models/Job');
var JobApplication = require('../models/JobApplication');
var fs = require('fs');
var imgur=require('node-imgur').createClient('d5975d94776362d')
var async = require('async');
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


exports.initiateChat = function(req, res, next) {
  JobApplication.findById(req.params.id, function(e, jobApp) {
    jobApp.chatRequested = true;
    jobApp.save(function(e, next){
      res.render('chat', {
        title: "Chat",
        jobApp: jobApp,
      });
    });
  });
};

exports.getChat = function(req, res) {
  JobApplication.findById(req.params.id, function(e, jobApp) {
    console.log(jobApp);
    res.render('account/partials/profile-chat', {
      title: 'Chat',
      jobApp: jobApp,
    });
  });
};

exports.getAccount = function(req, res) {
  if (req.user.userType == 'mom') {
    // User.findById(req.user.id, function(err, user) {
    JobApplication.find({userID: req.user.id}, function (e, docs) {
      console.log(docs)
      console.log("at 69");
      res.render('account/profile_mom', {
        title: 'Account Management',
        success: req.flash('success'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        signUp: req.flash('signUp'),
        first: req.flash('first'),
        picErrors: req.flash('picErrors'),
        "joblist" : docs
      });
      // });
  });
    
  }
  else {
      jobAppArray = []
      Job.find({companyID: req.user.id}, function (e, docs) {
        async.each(docs,
          function(item, callback) {
            JobApplication.find({jobID:item._id}, function(er, jobApps) {
              for (var i=0; i<jobApps.length; i++) {
                if (jobApps[i].submitted == "yes") {
                  newObj = {}
                  newObj['jobID'] = jobApps[i].jobID;
                  newObj['userID'] = jobApps[i].userID;
                  newObj['relevantJobExperience'] = jobApps[i].relevantJobExperience;
                  newObj['projectApproach'] = jobApps[i].projectApproach;
                  newObj['dateCreated'] = jobApps[i].dateCreated;
                  newObj['id'] = jobApps[i]._id;
                  newObj['user'] = jobApps[i].user;
                  newObj['job'] = jobApps[i].job;

                  jobAppArray.push(newObj);
                }
              }

              callback();
            });
          },
          function(err) {
            // console.log(jobAppArray)
            res.render('account/profile_employer', {
            title: 'Account Management',
            success: req.flash('success'),
            error: req.flash('error'),
            errors: req.flash('errors'),
            signUp: req.flash('signUp'),
            companyError: req.flash('companyError'),
            first: req.flash('first'),
            "joblist": docs,
            "jobAppArr": jobAppArray
          });
          }
        );
      });
  }
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
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  req.flash('first', {msg:'Fill out your profile.'});

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
      res.redirect('/account');
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

    // console.log(req.files.resume);
    user.profile.name = req.body.name || '';
    user.profile.email = req.body.email || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.bio = req.body.bio || '';
    // user.education = req.body.education || '';

    // user.positions = req.body.positions || '';
    // user.skills = req.body.skills || '';
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

    //profile picture upload 
    if(req.files.profilePicture.size>0) {
      var picErrors = [];
      var fileGood = true;
      var acceptableFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if(req.files.profilePicture.size > (5000 * 1024)) {
        picErrors.push({param:"size", msg:"Image file sizes must be less than 5mb.", value:req.files.profilePicture.size});
        fileGood = false;
      }
      if(acceptableFileTypes.indexOf(req.files.profilePicture.type)==-1) {
        picErrors.push({param:"type", "msg":"Please upload an image.", value: req.files.profilePicture.type});
        fileGood = false;
      }
      if(picErrors.length>0) {
        req.flash('picErrors', picErrors);
      }

      if(fileGood) {
        if (user.profile.picture!='') //if there is an old pic
          fs.unlink(user.profile.picture); //delete it
        user.profile.picture = req.files.profilePicture.path;   //set pic path to uploaded file path
      }
      else {
        fs.unlink(req.files.profilePicture.path); //file was not good, delete it
      }
        // imgur.upload(req.files.profilePicture.path, function(err, profPic) {
        //   console.log(err);
        //   if (err) {}
        //   else { //file uploaded successfully
        //     user.profile.picture = profPic;
        //     fs.unlink(req.files.profilePicture.path);
        //     console.log(profPic);
        //   }
        // });
    }

    if (user.userType=='mom') {
      formEducation = req.body.education.replace(/[\r]/g, '').split("\n")

      user.education = []
      if (formEducation.length != 0) {
        for(var i=0; i<formEducation.length; i++) {
            userSchool = {}
            
            positionArray = formEducation[i].split(" - ")
            schoolName = positionArray[0]
            degree = positionArray[1]

            userSchool['schoolName'] = schoolName
            userSchool['degree'] = degree

            // console.log("userSchool")
            // console.log(userSchool)
            user.education.push(userSchool);
        }
      } else {
        user.education = ''
      }


      formPositions = req.body.positions.replace(/[\r]/g, '').split("\n")
      // console.log(formPositions)

      user.positions = []
      if (formPositions.length != 0) {
        // -1 because the last one is blank -- FIX THIS ANOTHER TIME
        for(var i=0; i<formPositions.length-1; i++) {
            userPosition = {}
            
            positionArray = formPositions[i].split(",")
            title = positionArray[0]
            company = positionArray[1]

            if (title != '') {
              userPosition['title'] = title
              userPosition['company'] = company
              // console.log(userPosition)
              user.positions.push(userPosition);
            }
        }
      } else {
        user.positions = ''
      }

      formSkills = req.body.skills.replace(/[\r\n]/g, '').split(",")

      user.skills = []
      if (formSkills.length != 0) {
        count = 1
        for(var i=0; i<formSkills.length; i++) {
            userSkill = {}
            
            skill = formSkills[i]

            if (skill != '') {
              
              userSkill['skill'] = skill
              count += 1 
              user.skills.push(userSkill);
            }
        }
      } else {
        user.skills = ''
      }

      //resume upload 
      if(req.files.resume.size>0) {
        var errors = [];
        var fileGood = true;
        var acceptableFileTypes = ['application/pdf'];//, 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if(req.files.resume.size > (500 * 1024)) {
          errors.push({param:"size", msg:"Resume file size must be less than 500 kb.", value: req.files.resume.size});
          fileGood = false;
        }
        if(acceptableFileTypes.indexOf(req.files.resume.type)==-1) {
          errors.push({param:"type", "msg":"Resume file type must be pdf.", value: req.files.resume.type});
          fileGood = false;
        }
        if (errors.length>0) {
          req.flash('errors', errors);
        }

        if (fileGood) {
          if (user.resume.path!='') //if there is an old resume
            fs.unlink(user.resume.path); //delete it
          user.resume.name = req.files.resume.originalFilename; //set resume name to file name
          user.resume.path = req.files.resume.path;   //set resume path to uploaded file path
        }
        else {
          fs.unlink(req.files.resume.path); //file was not good, delete it
        }
      }
    }

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Profile information updated.');
      res.redirect('/account');
    });
  });
};

exports.downloadResume = function(req, res) {
  User.findById(req.params.id, function(err, user) {
    var filename = user.resume.path;
    res.download(filename);
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