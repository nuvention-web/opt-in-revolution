var mongoose = require('mongoose')
  ,Schema = mongoose.Schema
  ,bcrypt = require('bcrypt')
  ,SALT_WORK_FACTOR = 10;


var jobSchema = new Schema({
	//This is all of the information for a job's profile
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
    dateCreated: { type: Date, default: Date.now },
    companyID: {type: String}
});

jobSchema.pre('save', function(next) {
    var job = this;

    // only hash the password if it has been modified (or is new)
    if (!job.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(job.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            job.password = hash;
            next();
        });
    });
});

jobSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('Jobs', jobSchema);
