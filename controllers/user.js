var mongoose = require('mongoose');
var passport = require('passport');
var _ = require('underscore');
var User = require('../models/User');
var Job = require('../models/Job');
var JobApplication = require('../models/JobApplication');
var fs = require('fs');
var imgur=require('node-imgur').createClient('d5975d94776362d')
var async = require('async');
var nodemailer = require("nodemailer");
var AWS = require('aws-sdk');
var crypto = require('crypto');
var secrets = require('../config/secrets.js');
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

exports.resetUserFields = function(req, res) {
  User.find({}, function(e, users) {

    for (var i=0; i<users.length; i++) {
      // users[i].desiredHoursPerWeek = ['< 10', '10-20', '20-30', '30-40'];
      // users[i].save();
      // console.log("This matches to the old version! Need to make a change!");
    }
    res.redirect('/');
  });
};

exports.initiateChat = function(req, res, next) {
  JobApplication.findById(req.params.id, function(e, jobApp) {
    if (jobApp.chatRequested == false) {
      //Only send the email the first time
      var smtpTransport = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
          user: "contact@athenahire.co",
          pass: "NUventionWeb2014"
        }
      });

      console.log(jobApp.user.email);
      var mailOptions = {
        from: "AthenaHire <contact@athenahire.co>", // sender address
        to: jobApp.user.email, // list of receivers
        subject: jobApp.job.companyName + " wants to chat with you about the " + jobApp.job.jobName + " position", // Subject line
        text: "Log in to http://www.athenahire.co/login and go to 'My Messages' in your dashboard.", // plaintext body
        html: "<span style='text-align:left;'>Hello,</span>" + // html body
        "<p style='text-align:left;'>" + jobApp.job.companyName + " wants to chat with you about the " + jobApp.job.jobName + " position. Log in to <a href='http://www.athenahire.co/login' target='_blank'>AthenaHire</a> to see it. Head over to 'My Messages' in your dashboard to chat.</p>" +
        "<p style='text-align:left;'>Please let us know if you have any questions.</p>" +
        "<span style='font-size:8pt;text-align:left;'>The AthenaHire Team</span>" + "<br>" +
        "<span style='font-size:8pt;text-align:left;'><a href='mailto:contact@athenahire.co' target='_blank'>contact@athenahire.co</a></span>" + "<br>" +
        "<span style='font-size:8pt;text-align:left;'><a href='www.athenahire.co' target='_blank'>athenahire.co</a></span>" + "<br>" +
        "<span style='font-size:8pt;'>Employ. Engage. Empower</span>"
      }

      smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
          console.log(error);
        }else{
          console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        smtpTransport.close(); // shut down the connection pool, no more messages
      });
    }

    jobApp.chatRequested = true;
    jobApp.save(function(e, next){
      res.render('account/partials/profile-chat', {
        title: "Chat",
        jobApp: jobApp,
      });
    });
  });
};

exports.getChat = function(req, res) {
  JobApplication.findById(req.params.id, function(e, jobApp) {
    // console.log(jobApp);
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
      // console.log(docs)
      console.log("at 69");
      res.render('account/profile_mom', {
        title: 'Account Management',
        success: req.flash('success'),
        error: req.flash('error'),
        errors: req.flash('errors'),
        signUp: req.flash('signUp'),
        first: req.flash('first'),
        picErrors: req.flash('picErrors'),
        "jobApps" : docs
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
                  newObj['chatRequested'] = jobApps[i].chatRequested;

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
            projectUpdated: req.flash('projectUpdated'),
            projectDeleted: req.flash('projectDeleted'),
            projectError: req.flash('projectError'),
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
    user.numberOfLogins = user.numberOfLogins + 1;
    user.timesLoggedIn.push(Date());

    user.save(function(err) {
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.redirect('/account');
      });
    });
  })(req, res, next)
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

  req.flash('first', {msg:'Please fill out your profile!'});

  var user = new User({
    email: req.body.email,
    password: req.body.password,
    userType: req.body.usertype,
    numberOfLogins: 1,
  });
  user.timesLoggedIn.push(Date());

  //Welcome message stuff here
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "elizabeth@athenahire.co",
        pass: "NUventionWeb2014"
    }
  });

  if (req.body.usertype == 'mom') {
    var mailOptions = {
      from: "Elizabeth <elizabeth@athenahire.co>", // sender address
      to: req.body.email, // list of receivers
      subject: "Welcome to AthenaHire", // Subject line
      text: "Hello, I am one of the founders of AthenaHire, and I wanted to reach out and welcome you to the site! As a new company, we are thrilled to see more moms join our platform. In order to improve the platform for you, would you mind filling out a quick survey below: https://docs.google.com/forms/d/1HQcRlaw7lOA81NPI73NxGj79AgHe35FFXEtF8harTQ4/viewform. Also, we'd love to chat with you more if you are open to providing anymore feedback about the site. If you'd be up for a phone chat sometime soon, please let me know! Thanks again for all your interest in AthenaHire and I look forward to hearing back from you soon!", // plaintext body
      html: "<span style='text-align:left;'>Hello,</span>" + // html body
      "<p style='text-align:left;'>I am one of the founders of AthenaHire, and I wanted to reach out and welcome you to the site! As a new company, we are thrilled to see more moms join our platform. In order to improve the platform for you, would you mind filling out a quick survey below: <a href='https://docs.google.com/forms/d/1HQcRlaw7lOA81NPI73NxGj79AgHe35FFXEtF8harTQ4/viewform', target='_blank'>AthenaHire Survey</a></p>" +
      "<p style='text-align:left;'>Also, we'd love to chat with you more if you are open to providing anymore feedback about the site. If you'd be up for a phone chat sometime soon, please let me know!</p>" +
      "<p style='text-align:left;'>Thanks again for all your interest in AthenaHire and I look forward to hearing back from you soon!</p>" +
      "<span style='font-size:8pt;'><b>Elizabeth Baumann</b></span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'>Founder, AthenaHire</span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'><a href='mailto:elizabeth@athenahire.co' target='_blank'>elizabeth@athenahire.co</a></span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'><a href='www.athenahire.co' target='_blank'>athenahire.co</a></span>" + "<br>" +
      "<span style='font-size:8pt;'>Employ. Engage. Empower</span>"
    }
  }
  else {
    var mailOptions = {
      from: "Elizabeth <elizabeth@athenahire.co>", // sender address
      to: req.body.email, // list of receivers
      subject: "Welcome to AthenaHire", // Subject line
      text: "Hello, I am one of the founders of AthenaHire, and I wanted to reach out and welcome you to the site! As a new company, we are thrilled to see more businesses join our platform. In order to improve the platform for you, would you mind filling out a quick survey below: https://docs.google.com/forms/d/1S8ZY3wnO37ul4lJjsyUB2PidudvOhvVnuih4yvqmYSM/viewform. Also, we'd love to chat with you more if you are open to providing anymore feedback about the site. If you'd be up for a phone chat sometime soon, please let me know! Thanks again for all your interest in AthenaHire and I look forward to hearing back from you soon!", // plaintext body
      html: "<span style='text-align:left;'>Hello,</span>" + // html body
      "<p style='text-align:left;'>I am one of the founders of AthenaHire, and I wanted to reach out and welcome you to the site! As a new company, we are thrilled to see more businesses join our platform. In order to improve the platform for you, would you mind filling out a quick survey below: <a href='https://docs.google.com/forms/d/1S8ZY3wnO37ul4lJjsyUB2PidudvOhvVnuih4yvqmYSM/viewform', target='_blank'>AthenaHire Survey</a></p>" +
      "<p style='text-align:left;'>Also, we'd love to chat with you more if you are open to providing anymore feedback about the site. If you'd be up for a phone chat sometime soon, please let me know!</p>" + 
      "<p style='text-align:left;'>Thanks again for all your interest in AthenaHire and I look forward to hearing back from you soon!</p>" +
      "<span style='font-size:8pt;'><b>Elizabeth Baumann</b></span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'>Founder, AthenaHire</span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'><a href='mailto:elizabeth@athenahire.co' target='_blank'>elizabeth@athenahire.co</a></span>" + "<br>" +
      "<span style='font-size:8pt;text-align:left;'><a href='www.athenahire.co' target='_blank'>athenahire.co</a></span>" + "<br>" +
      "<span style='font-size:8pt;'>Employ. Engage. Empower</span>"
    }  
  }
  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
          console.log(error);
      }else{
          console.log("Message sent: " + response.message);
      }

      // if you don't want to use this transport object anymore, uncomment following line
      smtpTransport.close(); // shut down the connection pool, no more messages
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

exports.signS3 = function(req, res){
  var AWS_ACCESS_KEY = secrets.s3.accessKeyId;
  var AWS_SECRET_KEY = secrets.s3.secretAccessKey;
  var S3_BUCKET = secrets.s3.bucket;
  var object_name = req.query.s3_object_name;
  var mime_type = req.query.s3_object_type;
  var file_size = req.query.s3_file_size;
  console.log(req.query);
  if(file_size>0) {
    var picErrors = [];
    var fileGood = true;
    var acceptableFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

    if(file_size > (5000 * 1024)) {
      fileGood = false;
    }
    if(acceptableFileTypes.indexOf(mime_type)==-1) {
      fileGood = false;
    }
    console.log('filegood', fileGood);
    if(fileGood) { // if the file is fine, then update it
      var now = new Date();
      var expires = Math.ceil((now.getTime() + 10000)/1000); // 10 seconds from now
      var amz_headers = "x-amz-acl:public-read";

      var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+S3_BUCKET+"/"+ "profile-" + req.user.id;

      var signature = crypto.createHmac('sha1', AWS_SECRET_KEY).update(put_request).digest('base64');
      signature = encodeURIComponent(signature.trim());
      signature = signature.replace('%2B','+');

      var url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/' + "profile-" + req.user.id;
      console.log(url);
      var credentials = {
          signed_request: url+"?AWSAccessKeyId="+AWS_ACCESS_KEY+"&Expires="+expires+"&Signature="+signature,
          url: url
      };
      res.write(JSON.stringify(credentials));
      res.end();
    }
    else {
      // don't update it
    }
  }
};

exports.signResumeS3 = function(req, res){
  var AWS_ACCESS_KEY = secrets.s3.accessKeyId;
  var AWS_SECRET_KEY = secrets.s3.secretAccessKey;
  var S3_BUCKET = secrets.s3.bucket;
  var object_name = req.query.s3_object_name;
  var mime_type = req.query.s3_object_type;
  var file_size = req.query.s3_file_size;

  if(file_size>0) {
    var errors = [];
    var fileGood = true;
    var acceptableFileTypes = ['application/pdf'];//, 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if(file_size > (500 * 1024)) {
      fileGood = false;
    }
    if(acceptableFileTypes.indexOf(mime_type)==-1) {
      fileGood = false;
    }

    if (fileGood) {
      var now = new Date();
      var expires = Math.ceil((now.getTime() + 10000)/1000); // 10 seconds from now
      var amz_headers = "x-amz-acl:public-read";

      var put_request = "PUT\n\n"+mime_type+"\n"+expires+"\n"+amz_headers+"\n/"+S3_BUCKET+"/"+ "resume-" + req.user.id;

      var signature = crypto.createHmac('sha1', AWS_SECRET_KEY).update(put_request).digest('base64');
      signature = encodeURIComponent(signature.trim());
      signature = signature.replace('%2B','+');

      var url = 'https://'+S3_BUCKET+'.s3.amazonaws.com/' + "resume-" + req.user.id;
      console.log(url);
      var credentials = {
          signed_request: url+"?AWSAccessKeyId="+AWS_ACCESS_KEY+"&Expires="+expires+"&Signature="+signature,
          url: url
      };
      res.write(JSON.stringify(credentials));
      res.end();
    }
    else {
      // do nothing
    }
  }
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

    if (user.userType=='mom') {
      // profile picture upload
      // take hidden image and store this link instead
      if(req.files.profilePicture.size>0) {
        var picErrors = [];
        var fileGood = true;
        var acceptableFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        if(req.files.profilePicture.size > (5000 * 1024)) {
          picErrors.push({param:"size", msg:"Image file sizes must be less than 5mb.", value:req.files.profilePicture.size});
          fileGood = false;
        }
        if(acceptableFileTypes.indexOf(req.files.profilePicture.type)==-1) {
          picErrors.push({param:"type", "msg":"Please upload an .png, .jpeg, or .jpg image.", value: req.files.profilePicture.type});
          fileGood = false;
        }
        if(picErrors.length>0) {
          req.flash('picErrors', picErrors);
        }

        if(fileGood) {
          user.profile.picture = req.body.avatar_url;
          // code below is only used when uploading to your own server and not s3
          // if (user.profile.picture!='') //if there is an old pic
          //   fs.unlink(user.profile.picture); //delete it
          // user.profile.picture = req.files.profilePicture.path;   //set pic path to uploaded file path
        }
        else {
          // just don't do anything
          // fs.unlink(req.files.profilePicture.path); //file was not good, delete it
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

      //We are no longer tracking the education as an object, it is just a string.
      formEducation = req.body.education;
      user.education = [];
      user.education.push(formEducation);
      
      //We are no longer tracking the positions as an object, it is just a string.
      formPositions = req.body.positions;
      user.positions = [];
      user.positions.push(formPositions);    

      //We are no longer tracking the skills as an object, it is just a string.
      formSkills = req.body.skills;
      user.skills = [];
      user.skills.push(formSkills);
      // formEducation = req.body.education.replace(/[\r]/g, '').split("\n")
      // user.education = []
      // if (formEducation.length != 0) {
      //   user.education.push(formEducation);
      //   for(var i=0; i<formEducation.length; i++) {
      //       userSchool = {}
            
      //       positionArray = formEducation[i].split(" - ")
      //       schoolName = positionArray[0]
      //       degree = positionArray[1]

      //       userSchool['schoolName'] = schoolName
      //       userSchool['degree'] = degree

      //       // console.log("userSchool")
      //       // console.log(userSchool)
      //       user.education.push(userSchool);
      //   }
      // } else {
      //   user.education = ''
      // }

      // formPositions = req.body.positions.replace(/[\r]/g, '').split("\n")
      // // console.log(formPositions)

      // user.positions = []
      // if (formPositions.length != 0) {
      //   // -1 because the last one is blank -- FIX THIS ANOTHER TIME
      //   for(var i=0; i<formPositions.length-1; i++) {
      //       userPosition = {}
            
      //       positionArray = formPositions[i].split(",")
      //       title = positionArray[0]
      //       company = positionArray[1]

      //       if (title != '') {
      //         userPosition['title'] = title
      //         userPosition['company'] = company
      //         // console.log(userPosition)
      //         user.positions.push(userPosition);
      //       }
      //   }
      // } else {
      //   user.positions = ''
      // }

      // formSkills = req.body.skills.replace(/[\r\n]/g, '').split(",")

      // user.skills = []
      // if (formSkills.length != 0) {
      //   count = 1
      //   for(var i=0; i<formSkills.length; i++) {
      //       userSkill = {}
            
      //       skill = formSkills[i]

      //       if (skill != '') {
              
      //         userSkill['skill'] = skill
      //         count += 1 
      //         user.skills.push(userSkill);
      //       }
      //   }
      // } else {
      //   user.skills = ''
      // }

      // console.log(req.body.resume_url);
      // resume upload is obsolete, just update the link
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
          user.resume.name = req.files.resume.originalFilename;
          user.resume.path = req.body.resume_url;
          // if (user.resume.path!='') //if there is an old resume
          //   fs.unlink(user.resume.path); //delete it
          // user.resume.name = req.files.resume.originalFilename; //set resume name to file name
          // user.resume.path = req.files.resume.path;   //set resume path to uploaded file path
        }
        else {
          // do nothing
          // fs.unlink(req.files.resume.path); //file was not good, delete it
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