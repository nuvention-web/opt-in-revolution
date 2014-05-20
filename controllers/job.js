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
var nodemailer = require('nodemailer');

var default_industries = ['Accounting','Advertising','Broadcasting','Consulting','Consumer Products','Education','Entertainment and Leisure','Financial Services','Food & Beverage','Health Care', 'Nonprofit','Pharmaceuticals','Publishing','Retail', 'Technology'];
var default_jobFunction = ['Accounting', 'Business Development', 'Customer Service', 'Finance', 'Human Resources', 'Legal', 'Marketing', 'Operations', 'Other', 'Sales', 'Strategy'];
var default_totalWeeks = ['< 1 week', '1-2 weeks', '2-3 weeks', '3-4 weeks', '1-2 months', '2-3 months', '3+ months', 'To Be Determined'];
var default_hoursPerWeek = ['< 10', '10-20', '20-30', '30-40','To Be Determined'];
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
		return res.render('jobs/postjob', {title: "Post A Project", errors: errors});
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

		var smtpTransport = nodemailer.createTransport("SMTP",{
			service: "Gmail",
			auth: {
				user: "contact@athenahire.co",
				pass: "NUventionWeb2014"
			}
		});

		var mailOptions = {
			from: "AthenaHire <contact@athenahire.co>", // sender address
			to: user.email, // list of receivers
			subject: "Project posted successfully", // Subject line
			text: "Your project has been posted successfully. We will notify you when applications arrive.", // plaintext body
			html: "<span style='text-align:left;'>Congrats!</span>" + // html body
			"<p style='text-align:left;'>Your project has been posted successfully!</p>" +
			"<p style='text-align:left;'>What's next? We will notify you when applications arrive.</p>" +
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

		newJob.save(function(err, doc) {
			if(err) {
				//if failed, return error
				res.send("There was a problem adding the information to the database.");
			}
			else {
				res.redirect("/findprojects");
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
			res.render('jobs/postjob', {title: "Post A Project"});
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
			title: "Project Listings",
		});
	});

};

exports.applyJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		if((user.profile.name) && (user.userType == 'mom')) {

			Job.findById(req.params.id, function(e, docs) {
				docs.views += 1;

				if(typeof(docs.viewers[0])==='object') { // object has been initialized
					if(user.id in docs.viewers[0]) //user id is in object, then just add the date
						docs.viewers[0][user.id].push(Date());
					else //user id is not in the object yet but object exists, so add the first entry
						docs.viewers[0][user.id]=[Date()];
				} else { // object has not been initialized yet
					docs.viewers[0]={};
					docs.viewers[0][user.id]=[Date()];
				}
				console.log("169")
				console.log(docs.viewers)
				console.log(docs.viewers[0])
				JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function(err, jobApp) {
					// console.log("Loading apply job..");
					// console.log(jobApp);
					docs.save(function(err) {
						res.render("jobs/applyjob", {
							"job" : docs,
							"jobApp" : jobApp,
							success : req.flash('success'),
							title: "Project Application",
						});
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
		docs.views += 1;
		if (req.user) { //logged in
			if(typeof(docs.viewers[0])==='object') { // object has been initialized
				if(user.id in docs.viewers[0]) { //user id is in object, then just add the date
					console.log("at 205")
					docs.viewers[0][req.user.id].push(Date());
				} else { //user id is not in the object yet but object exists, so add the first entry
					console.log("at 208")
					docs.viewers[0][req.user.id]=[Date()];
				}
			} else { // object has not been initialized yet
				console.log("at 211")
				docs.viewers[0]={};
				docs.viewers[0][req.user.id]=[Date()];
			}
		}
		else { //not logged in
			//no user id, so use "anonymous" for key
			console.log("219");
			console.log(docs.viewers);
			console.log(docs.viewers[0]);
			if(typeof(docs.viewers[0])==='object') { // object has been initialized
				if("anonymous" in docs.viewers[0]) { //user id is in object, then just add the date
					console.log("at 220")
					docs.viewers[0]["anonymous"].push(Date());
				} else { //user id is not in the object yet but object exists, so add the first entry
					console.log("at 223")
					docs.viewers[0]["anonymous"]=[Date()];
				}
			} else { // object has not been initialized yet
				console.log("at 226")
				docs.viewers[0]={};
				docs.viewers[0]["anonymous"]=[Date()];
			}
		}
		console.log(docs.viewers);
		console.log(docs.viewers[0]);
		docs.save(function(err) {
			res.render("jobs/viewproject", {
				"job":docs,
				title: "View Project"
			});
		});
	});
};

exports.editProject = function(req, res) {
	Job.findById(req.params.id, function(e, docs) {
	
	res.render("jobs/editproject", {
				job: docs,
				title: "Edit Project"
			});
	});
};

exports.updateProject = function (req, res) {

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
		Job.findById(req.params.id, function(e, docs) {
			req.flash('errors', errors);
			return res.render('jobs/editproject', 
				{title: "Post A Project", 
				job:docs,
				errors: errors});
		})
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

	Job.findById(req.params.id, function(err, jobDoc) {
		//submit to the DB
		jobDoc.jobName = jobName;
		jobDoc.jobDescription = description; 
		jobDoc.industry = industry;
		jobDoc.skillsNeeded = skillsNeeded;
		jobDoc.jobFunction = jobFunction;
		jobDoc.totalWeeks = totalWeeks;
		jobDoc.hoursPerWeek = hoursPerWeek;
		jobDoc.checkinFrequency = checkinFrequency;
		jobDoc.primaryComm = primaryComm;
		jobDoc.pay = pay;

		jobDoc.save(function(err, doc) {
			if(err) {
				//if failed, return error
				res.send("There was a problem updating your project.");
			}
			else {
				console.log("successfully updated");
				req.flash('projectUpdated', 'Your project has been successfully updated.');
				res.redirect("/account");
			}
		});
	});	
};

exports.deleteProject = function(req, res) {
	Job.findById(req.params.id, function(e, docs) {

		// Only delete if job.companyID matches the ID of the company making the request
		if (req.user.id == docs.companyID) {
			console.log("successfully matched job's companyID with job creator");
			// req.flash('projectDeleted', 'Your project has been successfully removed.');
			// res.redirect("/account");
			docs.status = "inactive";
			docs.save(function(err,doc) {
				JobApplication.find({jobID:req.params.id}, function(er, jobApps) {
					// console.log(jobApps.length)
					// console.log(jobApps)
					for (var i=0; i<jobApps.length; i++) {
						// console.log(i)
						// console.log(jobApps[i])
						jobApps[i].submitted = "inactive"
						jobApps[i].save()
					}
					req.flash('projectDeleted', 'Your project has been successfully removed.');
					res.redirect("/account");	
				})
			})
		}
		else {
			console.log("job's companyID did not match with the user making this request");
			req.flash('projectError', 'There was an error with your project removal request.');
			res.redirect("/account");
		}
	});
};


exports.postFilterJobs = function (req,res) {
	if (req.body.filterType == 'profile') {
		var industry = req.user.industryPreference;
		var jobFunction = req.user.jobFunctionPreference;
		var totalWeeks = req.user.desiredProjectLength;
		var hoursPerWeek = req.user.desiredHoursPerWeek;
		var checkinFrequency = req.user.checkinFrequencyPreference;
		var primaryComm = req.user.communicationPreferences;
	}
	else {
		var industry = strToArray(req.body.industry);
		var jobFunction = strToArray(req.body.jobFunction);
		var totalWeeks = strToArray(req.body.totalWeeks);
		var hoursPerWeek = strToArray(req.body.hoursPerWeek);
		var checkinFrequency = strToArray(req.body.checkinFrequency);
		var primaryComm = strToArray(req.body.primaryComm);
		
	}



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
			if (req.body.filterType == 'profile') {
				var profileFilter = "Your profile preferences have been applied to the filters.";
			}
			res.render("jobs/jobslist", {
				"selectedFilters": selectedFilters,
				"joblist" : docs,
				title: "Project Listings",
				"profileFilter": profileFilter
			});
		});
};

exports.saveJob = function(req, res) {
	User.findById(req.user.id, function(err, user) {
		// Save as ObjectID for easier querying when viewing saved jobs
		if((user.profile.name) && (user.userType == 'mom')) {
			// user.companiesContacted.push(new ObjectID(req.params.id));
			// user.save(function(err, user, count) {
			// 	res.redirect("/employ");
			// });
			JobApplication.findOne({jobID: req.params.id, userID: req.user.id}, function (err, jobApp) {
				if(jobApp) { // if the job app exists
					// console.log("jobapp exists")
					// console.log(jobApp)
				} else { // job app doesn't exist yet
				// console.log("jobapp DOESN'T exist")
					var jobApp = new JobApplication({
						jobID: req.params.id,
						userID: req.user.id,
						relevantJobExperience: req.body.relevantJobExperience,
						projectApproach: req.body.projectApproach,
						submitted: "saved"
					});
				}

				//Save all of the user information
				copyUserInformation(jobApp, req.user);

				//Save all of the job information
				Job.findById(req.params.id, function(erro, thisJob) {
					copyJobInformation(jobApp, thisJob);

					jobApp.lastModified = Date();

					jobApp.save(function(err) {
						if(err) return next(err);
						req.flash('success', 'Application saved.');
						res.redirect("/account");
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
				console.log(jobAppArray)
				res.render("jobs/viewlistings", {
					"joblist": docs,
					"jobAppArr": jobAppArray,
					title: "My Projects",
				});
			}
		);
	});
};

exports.viewApplication = function(req, res) {
	JobApplication.findById(req.params.id, function(err, jobApp) {
		jobApp.timesViewedByEmployer = jobApp.timesViewedByEmployer+1;
		jobApp.save(function(err) {
			res.render("jobs/viewapplication", {
				"jobApp": jobApp,
				title: "View Application",
			});
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
			jobApp.lastModified = Date();
			jobApp.submitted = "no";
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
			jobApp.lastModified = Date();

			// notify mom that application successfully sent
			var smtpTransport = nodemailer.createTransport("SMTP",{
				service: "Gmail",
				auth: {
					user: "contact@athenahire.co",
					pass: "NUventionWeb2014"
				}
			});

			var mailOptions = {
				from: "AthenaHire <contact@athenahire.co>", // sender address
				to: jobApp.user.email, // list of receivers
				subject: "Application for " + jobApp.job.jobName + " submitted successfully", // Subject line
				text: "Your application has been submitted successfully. We will notify you when your application status changes.", // plaintext body
				html: "<span style='text-align:left;'>Congrats!</span>" + // html body
				"<p style='text-align:left;'>Your application has been submitted successfully!</p>" +
				"<p style='text-align:left;'>What's next? We will notify you when your application status changes. In the meanwhile, check out our <a href='blog.athenahire.co' target='_blank'>blog</a> for inspiration!.</p>" +
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

			User.findById(thisJob.companyID, function(er, companyInfo) {
				// email the company that the job came in!		
				console.log(companyInfo);
				console.log("Fuck");		
				var smtpTransport = nodemailer.createTransport("SMTP",{
					service: "Gmail",
					auth: {
						user: "contact@athenahire.co",
						pass: "NUventionWeb2014"
					}
				});

				var mailOptions = {
					from: "AthenaHire <contact@athenahire.co>", // sender address
					to: companyInfo.email, // list of receivers
					subject: "Application for " + jobApp.job.jobName + " has arrived", // Subject line
					text: "An application for the " + jobApp.job.jobName + " position has come in. Log in to http://www.athenahire.co/login to see it.", // plaintext body
					html: "<span style='text-align:left;'>Greetings!</span>" + // html body
					"<p style='text-align:left;'>An application for the " + jobApp.job.jobName + " position has come in. Log in to <a href='http://www.athenahire.co/login' target='_blank'>AthenaHire</a> to see it.</p>" +
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
				jobApp.save(function(err) {
					if(err) return next(err);
					req.flash('success', 'Application submitted.');
					res.redirect("/job/apply-"+req.params.id);
				});
			})
		});
	});
};