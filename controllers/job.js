
/*
 * GET home page.
 */
var mongoose = require('mongoose')
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;

var Job = require('../models/Job');

exports.postJob = function (req, res) {
	//get form value - based on the name attributes
	var jobName = req.body.jobName;
	var company = req.body.company;
	var description = req.body.description;

	//submit to the DB
	var newJob = new Job({jobName: jobName, companyName: company, jobDescription: description});
	newJob.save(function(err, doc) {
		if(err) {
			//if failed, return error
			res.send("There was a problem adding the information to the database.");
		}
		else {
			res.redirect("/jobslist");
		}
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
