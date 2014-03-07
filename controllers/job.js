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


function strToArray(input) {
	if ((typeof input) == 'object') {
		// Already is an array, just return it as is

		// Chop off 'Select all' if it is there, not really necessary but is cleaner
		// if (input[0] == 'Select all') {
			// input.shift()
		// }
		console.log("object case")
		// console.log(input)
		return input
	} 
	else if ((typeof input) == 'undefined') {
		// Create array and return it 
		console.log("undefined case")
		inputArray = ['']

		// console.log(inputArray)
		return inputArray
	}
	else {
		console.log("string case")
		inputArray = [input]

		// console.log(inputArray)
		return inputArray	
	}
};


exports.postJob = function (req, res) {

	// Error checking
	req.assert('jobName', 'Job Title cannot be blank').notEmpty();
	req.assert('description', 'Description cannot be blank').notEmpty()
	req.assert('skillsNeeded', 'Skills Needed cannot be blank').notEmpty()
	req.assert('industry', 'Industry cannot be blank').notEmpty()
	req.assert('jobFunction', 'Job Function cannot be blank').notEmpty()
	req.assert('totalWeeks', 'Project Length cannot be blank').notEmpty()
	req.assert('hoursPerWeek', 'Hours per week cannot be blank').notEmpty()
	req.assert('checkinFrequency', 'Check-in Frequency cannot be blank').notEmpty()
	req.assert('primaryComm', 'Contact Method cannot be blank').notEmpty()
	req.assert('pay', 'Pay cannot be blank').notEmpty()

	var errors = req.validationErrors();

	if (errors) {
		req.flash('errors', errors);
		return res.render('jobs/postjob', {title: "Post a job", errors: errors});
	}

	//get form value - based on the name attributes
	var jobName = req.body.jobName;
	var description = req.body.description;
	var skillsNeeded = req.body.skillsNeeded;

	var industry = strToArray(req.body.industry);
	var jobFunction = strToArray(req.body.jobFunction);
	var totalWeeks = strToArray(req.body.totalWeeks);
	var hoursPerWeek = strToArray(req.body.hoursPerWeek);
	var checkinFrequency = strToArray(req.body.checkinFrequency);
	var primaryComm = strToArray(req.body.primaryComm);

	var pay = req.body.pay;

	User.findById(req.user.id, function(err, user) {
		//submit to the DB
		var newJob = new Job({jobName: jobName, 
								companyName: user.company.companyName, 
								jobDescription: description, 
								industry: industry, 
								skillsNeeded: skillsNeeded,
								jobFunction: jobFunction, 
								totalWeeks: totalWeeks, 
								hoursPerWeek: hoursPerWeek, 
								checkinFrequency: checkinFrequency, 
								primaryComm: primaryComm, 
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
	var jobFunction = query.jobFunction;

	// Place Holders for now - need to integrate with the biz posting side
	// var totalWeeks = query.totalWeeks
	// var desiredHoursPerWeek = query.desiredHoursPerWeek
	// var checkinFrequency = query.checkinFrequency
	// var primaryComm = query.primaryComm

	if (typeof(jobFunction)==='undefined' && typeof(industry)==='undefined') {
		Job.find().
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
	else if (typeof(jobFunction)==='undefined') {
		Job.find({industry: industry}).
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
	else if (typeof(industry)==='undefined') {
		Job.find({jobFunction: jobFunction}).
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
	else {
		Job.find({jobFunction: jobFunction, industry: industry}).
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
	}
};

exports.postFilterJobs = function (req,res) {

	var industry = strToArray(req.body.industry);
	var jobFunction = strToArray(req.body.jobFunction);
	var totalWeeks = strToArray(req.body.totalWeeks);
	var hoursPerWeek = strToArray(req.body.hoursPerWeek);
	var checkinFrequency = strToArray(req.body.checkinFrequency);
	var primaryComm = strToArray(req.body.primaryComm);

	Job.find({industry: {$in: industry},
				jobFunction: {$in: jobFunction},
				totalWeeks: {$in: totalWeeks},
				hoursPerWeek: {$in: hoursPerWeek},
				checkinFrequency: {$in: checkinFrequency},
				primaryComm: {$in: primaryComm}
				}).
		sort('-dateCreated').
		exec(function(e, docs) {
			// console.log(docs)
			res.render("jobs/jobslist", {
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
}

exports.applyJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		if(user.profile.name) {
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
		}
		else {
   			req.flash('signUp', 'signUp');
			res.redirect('/account');
 		}
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
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		user.companiesContacted.push(new ObjectID(req.params.id));
		user.save();
	});

	JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function (err, jobApp) {
		if(jobApp) {
			jobApp.relevantJobExperience = req.body.relevantJobExperience || '';
			jobApp.projectApproach = req.body.projectApproach || '';

		} else {
			var jobApp = new JobApplication({
				jobID: req.params.id,
				userID: req.user.id,
				relevantJobExperience: req.body.relevantJobExperience,
				projectApproach: req.body.projectApproach
			});
		}
		jobApp.save(function(err) {
			if(err) return next(err);
			req.flash('success', 'Application saved.');
			res.redirect("/job/apply-"+req.params.id);
		});
	});
};

exports.postSubmitApp = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		user.companiesContacted.push(new ObjectID(req.params.id));
		user.save();
	});
	
	JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function (err, jobApp) {
		if(jobApp) {
			jobApp.relevantJobExperience = req.body.relevantJobExperience || '';
			jobApp.projectApproach = req.body.projectApproach || '';
			jobApp.submitted = 'yes';
		} else {
			var jobApp = new JobApplication({
				jobID: req.params.id,
				userID: req.user.id,
				relevantJobExperience: req.body.relevantJobExperience,
				projectApproach: req.body.projectApproach,
				submitted: 'yes'
			});
		}
		jobApp.save(function(err) {
			if(err) return next(err);
			req.flash('success', 'Application submitted.');
			res.redirect("/job/apply-"+req.params.id);
		});
	});
};
