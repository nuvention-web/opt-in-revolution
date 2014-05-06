var mongoose = require('mongoose')
	,Schema = mongoose.Schema
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;

var jobApplicationSchema = new Schema({
	jobID: {type: String},
	userID: {type: String},
	chatRequested: {type: Boolean, default: false},
	user: {
		email: {type: String},
		profile: {
			name: { type: String, default: '' },
			gender: { type: String, default: '' },
			location: { type: String, default: '' },
			website: { type: String, default: '' },
			picture: { type: String, default: '' }
		},
		skills: { type: Array },
		education: { type: Array },
		positions: {type: Array},
		yearsOfExperience: {type: String, default: ''},
		desiredHoursPerWeek: {type: String, default: ''},
		linkedinURL: {type: String, default: ''},
		desiredHoursPerWeek: {type: Array},
		desiredProjectLength: {type: Array},
		communicationPreferences: {type: Array},
		checkinFrequencyPreference: {type: Array},
		industryPreference: {type: Array},
		jobFunctionPreference: {type: Array},
	},

	job: {
		jobName: {type: String},
		companyName: {type: String},
		jobDescription: {type: String},
		industry: {type: Array},
		jobFunction: {type: Array},
		totalWeeks: {type: Array},
		hoursPerWeek: {type: Array},
		checkinFrequency: {type: Array},
		primaryComm: {type: Array},
		skillsNeeded: {type: String},
		pay: {type: String},
		companyID: {type: String},
	},
	relevantJobExperience: {type: String, default: ''},
	projectApproach: {type: String, default: ''},
	submitted: {type: String, default: 'no'}, //yes, no, saved
	dateCreated: {type: Date, default: Date.now},
	lastModified: {type: Date, default: Date.now},
	timesViewedByEmployer: {type: Number},
});

// jobApplicationSchema.pre('save', function(next) {
//     var jobApplication = this;

//     // only hash the password if it has been modified (or is new)
//     if (!jobApplication.isModified('password')) return next();

//     // generate a salt
//     bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
//         if (err) return next(err);

//         // hash the password using our new salt
//         bcrypt.hash(jobApplication.password, salt, function(err, hash) {
//             if (err) return next(err);

//             // override the cleartext password with the hashed one
//             jobApplication.password = hash;
//             next();
//         });
//     });
// });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);