/*
 * GET home page.
 */
var mongoose = require('mongoose')
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;
var passport = require('passport');

var Job = require('../models/Job');
var User = require('../models/User');
var ObjectID = require('mongoose').Types.ObjectId; 


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
				res.redirect("/jobslist");
			}
		});
	});
	
};

exports.submitJobPost = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		if (typeof(user.company.companyName) === 'undefined' || user.company.companyName == null || user.company.companyName.length == 0) { //typeof user.company.companyName==='undefined' || typeof user) {
			req.flash('errors', { msg: "Please fill in company name " });
			return res.redirect('/account');
		}
		else{ 
			res.render('jobs/postjob', {title: "Post a job"});
		}
	});
};

exports.listJobs = function(req, res) {
	Job.find({}).
	sort('-dateCreated').
	exec(function(e, docs) {
		res.render("jobs/jobslist", {
			"joblist" : docs,
			title: "Job Listing Page",
		});
	});
};

exports.applyJob = function(req, res) {
	Job.findById(req.params.id, function(e, docs) {
		res.render("jobs/applyjob", {
			"job" : docs,
			title: "Apply to this job",
		});
	});
};

exports.saveJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		user.companiesContacted.push(new ObjectID(req.params.id));
		user.save(function(err, user, count) {
			res.redirect("/jobslist");
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
