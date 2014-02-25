/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var flash = require('connect-flash');
var less = require('less-middleware');
var path = require('path');
var mongodb = require('mongodb')
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');

/**
 * Load controllers.
 */

var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');
var jobController = require('./controllers/job');

/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Mongoose configuration.
 */

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/optInRev';

mongoose.connect(mongoUri);
mongoose.connection.on('error', function() {
  console.log('← MongoDB Connection Error →');
});

var app = express();

/**
 * Express configuration.
 */

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(expressValidator());
app.use(express.methodOverride());
// app.use(express.cookieSession());
app.use(express.session({ secret: 'your secret code' }));
app.use(passport.initialize());

app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(flash());
app.use(less({ src: __dirname + '/public', compress: true }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res) {
  res.status(404);
  res.render('404');
});
app.use(express.errorHandler());



/**
 * Application routes.
 */

app.get('/', homeController.index);
app.get('/about', homeController.about);
app.get('/team', homeController.team);
app.post('/subscribeEmailPost', homeController.subscribeEmailPost)

// Account Stuff
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
// app.post('/account/deactivate', passportConf.isAuthenticated, userController.postDeactivateAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

// API Related
app.get('/api', apiController.getApi);
app.get('/api/facebook', passportConf.isAuthenticated, apiController.getFacebook);
app.get('/api/scraping', apiController.getScraping);

// Auth Stuff
app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/', successRedirect: '/account', scope: ['r_basicprofile', 'r_fullprofile', 'r_emailaddress']  }));


// Job Related
app.post('/postJob', passportConf.isAuthenticated, jobController.postJob);
app.get('/postjob', jobController.submitJobPost);
app.get('/mylistings', jobController.viewCompanyPosts);
// app.get('/jobslist', jobController.listJobs);
app.get('/job/apply-:id', jobController.applyJob);
app.get('/job/save-:id', jobController.saveJob);
app.get('/viewsavedjobs', jobController.viewSavedJobs);

app.get('/viewcandidates', userController.viewCandidates);


// Pillars
app.get('/employ', jobController.listJobs);
app.get('/empower', homeController.empower);
app.get('/engage', homeController.engage);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
