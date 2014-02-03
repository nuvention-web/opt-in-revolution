/*
 * GET home page.
 */
var mongoose = require('mongoose')
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;
var passport = require('passport');

var Job = require('../models/Job');
var User = require('../models/User');

exports.postJob = function (req, res) {
	//get form value - based on the name attributes
	var jobName = req.body.jobName;
	var description = req.body.description;

	// console.log(req.user.id)
	User.findById(req.user.id, function(err, user) {
		// if (err) return next(err);
		//submit to the DB
		var newJob = new Job({jobName: jobName, companyName: user.company.companyName, jobDescription: description});
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
	res.render('jobs/postjob', {title: "Post a job"});
};

exports.listJobs = function(req, res) {
	Job.find({}, function(e, docs) {
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
