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
var async = require('async');

var default_industries = ['Accounting','Advertising','Broadcasting','Consulting','Consumer Products','Education','Entertainment and Leisure','Financial Services','Food & Beverage','Health Care', 'Nonprofit','Pharmaceuticals','Publishing','Retail', 'Technology'];
var default_jobFunction = ['Accounting', 'Business Development', 'Customer Service', 'Finance', 'Human Resources', 'Marketing', 'Operations', 'Other', 'Sales', 'Strategy'];
var default_totalWeeks = ['< 1 week', '1-2 weeks', '2-3 weeks', '3-4 weeks', '1-2 months', '2-3 months', '3+ months'];
var default_hoursPerWeek = ['< 10', '10-20', '20-30', '30-40'];
var default_checkinFrequency = ['Daily', 'Twice a week', 'Weekly', 'Monthly'];
var default_primaryComm = ['Email', 'Phone', 'In-Person'];

function strToArray(input) {
	if ((typeof input) == 'object') {
		// Already is an array, just return it as is

		// Chop off 'Select all' if it is there, not really necessary but is cleaner
		if (input[0] == 'Select all') {
			input.shift()
		}
		
		console.log("object case")
		return input
	} 
	else if ((typeof input) == 'undefined') {
		// Create array and return it 
		console.log("undefined case")
		inputArray = ['']
		return inputArray
	}
	else {
		console.log("string case")
		inputArray = [input]

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

	selectedFilters = {"industry": default_industries,
						"jobFunction": default_jobFunction,
						"totalWeeks": default_totalWeeks,
						"hoursPerWeek": default_hoursPerWeek,
						"checkinFrequency": default_checkinFrequency,
						"primaryComm": default_primaryComm}
	// console.log("listjobs")
	// console.log(selectedFilters)
	Job.find().
		sort('-dateCreated').
		exec(function(e, docs) {
			res.render("jobs/jobslist", {
			"joblist" : docs,
			"selectedFilters": selectedFilters,
			title: "Job Listing Page",
		});
	});

};

exports.applyJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		if((user.profile.name) && (user.userType == 'mom')) {
			Job.findById(req.params.id, function(e, docs) {
				JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function(err, jobApp) {
					// console.log("Loading apply job..");
					// console.log(jobApp);
					res.render("jobs/applyjob", {
						"job" : docs,
						"jobApp" : jobApp,
						success : req.flash('success'),
						title: "Apply to this project",
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

exports.viewProject = function(req, res) {
	Job.findById(req.params.id, function(e, docs) {
		res.render("jobs/viewproject", {
			"job":docs,
			title: "View this project"
		});
	});
};

exports.postFilterJobs = function (req,res) {

	var industry = strToArray(req.body.industry);
	var jobFunction = strToArray(req.body.jobFunction);
	var totalWeeks = strToArray(req.body.totalWeeks);
	var hoursPerWeek = strToArray(req.body.hoursPerWeek);
	var checkinFrequency = strToArray(req.body.checkinFrequency);
	var primaryComm = strToArray(req.body.primaryComm);

	selectedFilters = {"industry": industry,
					"jobFunction": jobFunction,
					"totalWeeks": totalWeeks,
					"hoursPerWeek": hoursPerWeek,
					"checkinFrequency": checkinFrequency,
					"primaryComm": primaryComm}


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
				"selectedFilters": selectedFilters,
				"joblist" : docs,
				title: "Job Listing Page",
			});
		});
}

exports.saveJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		if((user.profile.name) && (user.userType == 'mom')) {
			user.companiesContacted.push(new ObjectID(req.params.id));
			user.save(function(err, user, count) {
				res.redirect("/employ");
			});
		}
		else {
   			req.flash('signUp', 'signUp');
			res.redirect('/account');
		}
	});
};

exports.viewCompanyPosts = function(req, res) {
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
				res.render("jobs/viewlistings", {
					"joblist": docs,
					jobAppArr: jobAppArray,
					title: "Company Listings",
				});
			}
		);
	});
};

exports.viewApplication = function(req, res) {
	JobApplication.findById(req.params.id, function(err, jobApp) {
		res.render("jobs/viewapplication", {
			"jobApp": jobApp,
			title: "View Application",
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

function copyUserInformation(jobApplication, user) {
	jobApplication.user.email = user.email || '';
	jobApplication.user.profile.name = user.profile.name || '';
	jobApplication.user.profile.gender = user.profile.gender || '';
	jobApplication.user.profile.location = user.profile.location || '';
	jobApplication.user.profile.website = user.profile.website || '';
	jobApplication.user.profile.picture = user.profile.picture || '';

	jobApplication.user.skills = user.skills || '';
	jobApplication.user.education = user.education || '';

	jobApplication.user.positions = user.positions || '';
	jobApplication.user.yearsOfExperience = user.yearsOfExperience || '';
	jobApplication.user.desiredHoursPerWeek = user.desiredHoursPerWeek || '';
	jobApplication.user.linkedinURL = user.linkedinURL || '';
	jobApplication.user.desiredHoursPerWeek = user.desiredHoursPerWeek || '';
	jobApplication.user.desiredProjectLength = user.desiredProjectLength || '';
	jobApplication.user.communicationPreferences = user.communicationPreferences || '';
	jobApplication.user.checkinFrequencyPreference = user.checkinFrequencyPreference || '';
	jobApplication.user.industryPreference = user.industryPreference || '';
	jobApplication.user.jobFunctionPreference = user.jobFunctionPreference || '';
}

function copyJobInformation(jobApplication, job) {
	jobApplication.job.jobName = job.jobName;
	jobApplication.job.companyName = job.companyName;
	jobApplication.job.jobDescription = job.jobDescription;
	jobApplication.job.industry = job.industry;
	jobApplication.job.jobFunction = job.jobFunction;
	jobApplication.job.totalWeeks = job.totalWeeks;
	jobApplication.job.hoursPerWeek = job.hoursPerWeek;
	jobApplication.job.checkinFrequency = job.checkinFrequency;
	jobApplication.job.primaryComm = job.primaryComm;
	jobApplication.job.skillsNeeded = job.skillsNeeded;
	jobApplication.job.pay = job.pay;
	jobApplication.job.companyID = job.companyID;
}

exports.postSaveApp = function(req, res, next) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		user.companiesContacted.push(new ObjectID(req.params.id));
		user.save();
	});

	JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function (err, jobApp) {
		if(jobApp) { // if the job app exists
			jobApp.relevantJobExperience =req.body.relevantJobExperience;
			jobApp.projectApproach =req.body.projectApproach;
		} else { // job app doesn't exist yet
			var jobApp = new JobApplication({
				jobID: req.params.id,
				userID: req.user.id,
				relevantJobExperience: req.body.relevantJobExperience,
				projectApproach: req.body.projectApproach
			});
		}

		//Save all of the user information
		copyUserInformation(jobApp, req.user);

		//Save all of the job information
		Job.findById(req.params.id, function(erro, thisJob) {
			copyJobInformation(jobApp, thisJob);

			jobApp.save(function(err) {
				if(err) return next(err);
				req.flash('success', 'Application saved.');
				res.redirect("/job/apply-"+req.params.id);
			});

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
		if(jobApp) { // if the job app exists
			jobApp.submitted = "yes";
			jobApp.relevantJobExperience =req.body.relevantJobExperience;
			jobApp.projectApproach =req.body.projectApproach;
		} else { // job app doesn't exist yet
			var jobApp = new JobApplication({
				jobID: req.params.id,
				userID: req.user.id,
				relevantJobExperience: req.body.relevantJobExperience,
				projectApproach: req.body.projectApproach,
				submitted: 'yes'
			});
		}

		
		//Save all of the user information
		copyUserInformation(jobApp, req.user);

		//Save all of the job information
		Job.findById(req.params.id, function(erro, thisJob) {
			copyJobInformation(jobApp, thisJob);

			jobApp.save(function(err) {
				if(err) return next(err);
				req.flash('success', 'Application saved.');
				res.redirect("/job/apply-"+req.params.id);
			});

		});
	});
};