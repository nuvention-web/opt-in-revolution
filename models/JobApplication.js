var mongoose = require('mongoose')
	,Schema = mongoose.Schema
	,bcrypt = require('bcrypt')
	,SALT_WORK_FACTOR = 10;

var jobApplicationSchema = new Schema({
	jobID: {type: String},
	userID: {type: String},
	relevantJobExperience: {type: String, default: ''},
	projectApproach: {type: String, default: ''},
	submitted: {type: String, default: 'no'}, //yes, no
	dateCreated: {type: Date, default: Date.now}
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