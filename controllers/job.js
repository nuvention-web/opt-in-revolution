/*
 * GET home page.
 */
var mongoose = require('mongoose')
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;
var passport = require('passport');

var Job = require('../models/Job');
var JobApplication = require('../models/JobApplication');
var User = require('../models/User');
var ObjectID = require('mongoose').Types.ObjectId; 
var url = require('url');

exports.postJob = function (req, res) {
	//get form value - based on the name attributes
	var jobName = req.body.jobName;
	var description = req.body.description;
	var industry = req.body.industry;
	var jobFunction = req.body.jobFunction;
	var duration = req.body.duration;
	var hoursPerWeek = req.body.hoursPerWeek;
	var telephoneOnly = req.body.telephoneOnly;
	var skillsNeeded = req.body.skillsNeeded;
	var pay = req.body.pay;

	User.findById(req.user.id, function(err, user) {
		//submit to the DB
		var newJob = new Job({jobName: jobName, 
								companyName: user.company.companyName, 
								jobDescription: description, 
								industry: industry, 
								jobFunction: jobFunction, 
								duration: duration, 
								hoursPerWeek: hoursPerWeek, 
								telephoneOnly: telephoneOnly, 
								skillsNeeded: skillsNeeded, 
								pay: pay, 
								companyID: req.user.id});
		newJob.save(function(err, doc) {
			if(err) {
				//if failed, return error
				res.send("There was a problem adding the information to the database.");
			}
			else {
				res.redirect("/employ");
			}
		});
	});
	
};

exports.submitJobPost = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		if (typeof(user.company.companyName) === 'undefined' || user.company.companyName == null || user.company.companyName.length == 0) { //typeof user.company.companyName==='undefined' || typeof user) {
			req.flash('companyError', { msg: "Fill out company information before posting jobs" });
			return res.redirect('/account');
		}
		else{ 
			res.render('jobs/postjob', {title: "Post a job"});
		}
	});
};

exports.listJobs = function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var industry = query.industry;
	var jobFunction = query.jobfunction;

	if (typeof(jobFunction)==='undefined') {
		Job.find().
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
	else {
		Job.find({jobFunction: jobFunction}).
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
};

exports.applyJob = function(req, res) {
	Job.findById(req.params.id, function(e, docs) {
		JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function(err, jobApp) {
			console.log("Loading apply job..");
			console.log(jobApp);
			res.render("jobs/applyjob", {
				"job" : docs,
				"jobApp" : jobApp,
				success : req.flash('success'),
				title: "Apply to this job",
			});
		});
	});
};

exports.saveJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		user.companiesContacted.push(new ObjectID(req.params.id));
		user.save(function(err, user, count) {
			res.redirect("/employ");
		});
	});
};

exports.viewCompanyPosts = function(req, res) {
	Job.find({companyID: req.user.id}, function (e, docs) {
		res.render("jobs/viewlistings", {
			"joblist": docs,
			title: "Company Listings",
		});
	});
};

exports.viewSavedJobs = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		Job.find({_id: {$in: user.companiesContacted}}, function (e, docs) {
			// console.log(docs)
			res.render("jobs/savedjobs", {
				"joblist" : docs,
				title: "Saved Companies",
			});
		});
	});
};

exports.postSaveApp = function(req, res, next) {
	JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function (err, jobApp) {
		console.log(jobApp);
		if(jobApp) {
			console.log('found a job app...');
			console.log(jobApp);
			jobApp.relevantJobExperience = req.body.relevantJobExperience || '';
			jobApp.projectApproach = req.body.projectApproach || '';

		} else {
			console.log('didnt find a job app');
			console.log(req.body);
			var jobApp = new JobApplication({
				jobID: req.params.id,
				userID: req.user.id,
				relevantJobExperience: req.body.relevantJobExperience,
				projectApproach: req.body.projectApproach
			});
		}
		console.log("line 156");
		console.log(jobApp);
		jobApp.save(function(err) {
			console.log("saving");
			if(err) return next(err);
			req.flash('success', 'Application saved.');
			res.redirect("/job/apply-"+req.params.id);
		});
	});
};

exports.postSubmitApp = function(req, res) {
	res.redirect("/job/apply-"+req.params.id);
};
